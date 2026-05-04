"""
Twitter Video Analyzer
Downloads a video from a tweet using yt-dlp, extracts key frames with ffmpeg,
and sends them to Claude Vision for a detailed breakdown.

Usage:
    python tools/twitter-video.py https://x.com/user/status/12345
    python tools/twitter-video.py --url https://x.com/user/status/12345
    python tools/twitter-video.py --url https://x.com/user/status/12345 --frames 12

Requires: yt-dlp, ffmpeg, anthropic
    pip install yt-dlp anthropic
    winget install ffmpeg  (or https://ffmpeg.org/download.html)
"""

import argparse
import base64
import glob
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

# Load .env / .env.local from the project root if present
_project_root = Path(__file__).resolve().parent.parent
for _env_file in [".env.local", ".env"]:
    _env_path = _project_root / _env_file
    if _env_path.exists():
        try:
            from dotenv import load_dotenv
            load_dotenv(_env_path)
        except ImportError:
            # Manual fallback: parse KEY=VALUE lines
            with open(_env_path, "r") as _f:
                for _line in _f:
                    _line = _line.strip()
                    if _line and not _line.startswith("#") and "=" in _line:
                        _k, _, _v = _line.partition("=")
                        os.environ.setdefault(_k.strip(), _v.strip())
        break

# Resolve paths from the actual file location (works even when dynamically loaded)
TOOLS_DIR = Path(__file__).resolve().parent
DOWNLOADS_DIR = TOOLS_DIR / "downloads"


# ── Dependency check ──────────────────────────────────────────────────────────

def check_dependencies() -> list[str]:
    """Return list of missing dependencies."""
    missing = []

    # Check yt-dlp
    try:
        subprocess.run(
            ["yt-dlp", "--version"],
            capture_output=True, text=True, timeout=10,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        # Try as python module
        try:
            subprocess.run(
                [sys.executable, "-m", "yt_dlp", "--version"],
                capture_output=True, text=True, timeout=10,
            )
        except (FileNotFoundError, subprocess.TimeoutExpired):
            missing.append("yt-dlp  (pip install yt-dlp)")

    # Check ffmpeg
    try:
        subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True, text=True, timeout=10,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        missing.append("ffmpeg  (winget install ffmpeg)")

    # Claude transport is claudex (Max-sub `claude -p`) — no SDK dep.
    # The Vision analysis path is currently disabled (claude -p is text-only).
    # The download + frame extraction parts of this tool still work.

    return missing


# ── Download ──────────────────────────────────────────────────────────────────

def get_yt_dlp_cmd() -> list[str]:
    """Return the yt-dlp command (direct or via python -m)."""
    try:
        subprocess.run(
            ["yt-dlp", "--version"],
            capture_output=True, text=True, timeout=10,
        )
        return ["yt-dlp"]
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return [sys.executable, "-m", "yt_dlp"]


def download_video(url: str) -> tuple[str, dict]:
    """Download video from Twitter/X using yt-dlp.

    Returns:
        Tuple of (video_file_path, metadata_dict)
    """
    DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
    output_template = str(DOWNLOADS_DIR / "%(id)s.%(ext)s")

    yt_dlp = get_yt_dlp_cmd()

    result = subprocess.run(
        yt_dlp + [
            "--no-warnings",
            "-f", "best[ext=mp4]/best",
            "-o", output_template,
            "--write-info-json",
            "--no-playlist",
            "--print", "after_move:filepath",
            url,
        ],
        capture_output=True, text=True, timeout=120,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"yt-dlp failed (exit {result.returncode}):\n{result.stderr.strip()}"
        )

    # The --print filename gives us the actual path
    video_path = result.stdout.strip().splitlines()[-1]

    if not os.path.isfile(video_path):
        # Fallback: find most recent mp4 in downloads
        mp4s = sorted(
            glob.glob(str(DOWNLOADS_DIR / "*.mp4")),
            key=os.path.getmtime,
            reverse=True,
        )
        if mp4s:
            video_path = mp4s[0]
        else:
            raise FileNotFoundError(
                f"yt-dlp ran but no video file found in {DOWNLOADS_DIR}"
            )

    # Load metadata from info json
    metadata = {}
    info_json = Path(video_path).with_suffix(".info.json")
    # yt-dlp may name it .mp4.info.json or just .info.json
    if not info_json.exists():
        info_json = Path(str(video_path) + ".info.json")
    if not info_json.exists():
        # Search for any info.json with matching id
        video_id = Path(video_path).stem
        candidates = list(DOWNLOADS_DIR.glob(f"{video_id}*.info.json"))
        if candidates:
            info_json = candidates[0]

    if info_json.exists():
        try:
            with open(info_json, "r", encoding="utf-8") as f:
                raw = json.load(f)
            metadata = {
                "id": raw.get("id", ""),
                "title": raw.get("title", raw.get("fulltitle", "")),
                "description": raw.get("description", ""),
                "uploader": raw.get("uploader", raw.get("uploader_id", "")),
                "uploader_id": raw.get("uploader_id", ""),
                "duration": raw.get("duration"),
                "view_count": raw.get("view_count"),
                "like_count": raw.get("like_count"),
                "upload_date": raw.get("upload_date"),
                "webpage_url": raw.get("webpage_url", url),
            }
        except (json.JSONDecodeError, KeyError):
            pass

    if not metadata.get("id"):
        metadata["id"] = Path(video_path).stem

    return video_path, metadata


# ── Frame extraction ──────────────────────────────────────────────────────────

def extract_frames(video_path: str, num_frames: int = 8) -> list[str]:
    """Extract evenly-spaced key frames from video using ffmpeg.

    Returns:
        List of paths to extracted JPEG frame files.
    """
    # Get video duration
    probe = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            video_path,
        ],
        capture_output=True, text=True, timeout=30,
    )

    duration = 10.0  # fallback
    try:
        duration = float(probe.stdout.strip())
    except (ValueError, AttributeError):
        pass

    # Create temp dir for frames
    frames_dir = Path(video_path).parent / f"frames_{Path(video_path).stem}"
    frames_dir.mkdir(exist_ok=True)

    # Calculate interval between frames
    if duration <= 0:
        duration = 10.0
    interval = max(duration / (num_frames + 1), 0.1)

    frame_paths = []
    for i in range(num_frames):
        timestamp = interval * (i + 1)
        if timestamp >= duration:
            break
        out_path = str(frames_dir / f"frame_{i:03d}.jpg")
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-ss", f"{timestamp:.2f}",
                "-i", video_path,
                "-frames:v", "1",
                "-q:v", "2",
                out_path,
            ],
            capture_output=True, text=True, timeout=30,
        )
        if os.path.isfile(out_path) and os.path.getsize(out_path) > 0:
            frame_paths.append(out_path)

    if not frame_paths:
        # Fallback: just grab the first frame
        out_path = str(frames_dir / "frame_000.jpg")
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", video_path,
                "-frames:v", "1",
                "-q:v", "2",
                out_path,
            ],
            capture_output=True, text=True, timeout=30,
        )
        if os.path.isfile(out_path):
            frame_paths.append(out_path)

    return frame_paths


# ── Claude Vision analysis ───────────────────────────────────────────────────

def analyze_with_claude(
    frames: list[str],
    metadata: dict,
    model: str = "claude-cli",
) -> str:
    """DISABLED: Vision analysis required the Anthropic SDK and a per-project Claude key.

    Migration to claudex (Max-sub `claude -p` subprocess) removed both. The CLI
    in -p mode is text-only and does not currently accept image attachments,
    so this Vision-based analyzer is not portable to the new transport.

    The download + frame extraction parts of this script still work — frames
    land in DOWNLOADS_DIR. Manually drop them into a Claude Code session for
    Vision analysis until claudex (or a future `claude -p`) supports images.
    """
    return (
        "[claudex limitation] Vision analysis disabled — claude -p does not yet "
        f"accept image input. {len(frames)} frames are saved on disk; open them "
        "in an interactive Claude Code session for analysis."
    )


# ── Playwright fallback ──────────────────────────────────────────────────────

def analyze_with_playwright(url: str, num_screenshots: int = 6) -> str:
    """Fallback: use Playwright to screenshot the tweet page.

    Opens the tweet, takes screenshots of the video area at intervals,
    and sends them to Claude for analysis.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return "Playwright not installed. Run: pip install playwright && python -m playwright install chromium"

    frames_dir = DOWNLOADS_DIR / "playwright_frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    screenshot_paths = []

    print("  Launching browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)  # Let video player load

        # Try to find and click the video to start playback
        try:
            video_el = page.locator("video").first
            if video_el.is_visible():
                video_el.click()
                page.wait_for_timeout(1000)
        except Exception:
            pass

        # Take screenshots at intervals
        for i in range(num_screenshots):
            path = str(frames_dir / f"pw_frame_{i:03d}.png")
            page.screenshot(path=path, full_page=False)
            screenshot_paths.append(path)
            page.wait_for_timeout(2000)  # Wait 2s between screenshots

        # Grab tweet text
        tweet_text = ""
        try:
            tweet_text = page.locator('[data-testid="tweetText"]').first.inner_text()
        except Exception:
            pass

        browser.close()

    if not screenshot_paths:
        return "Failed to capture any screenshots."

    # Analyze with Claude
    metadata = {
        "uploader": "unknown",
        "description": tweet_text or "N/A",
    }

    # Convert PNGs to the same format expected by analyze_with_claude
    content: list[dict] = []
    content.append({
        "type": "text",
        "text": (
            f"These are {len(screenshot_paths)} screenshots taken from a Twitter/X page.\n"
            f"URL: {url}\n"
            f"Tweet text: \"{tweet_text}\"\n\n"
            f"Describe what you see: What product/tool is shown? What does the UI look like? "
            f"What features are demonstrated? What makes it impressive?"
        ),
    })

    for path in screenshot_paths:
        with open(path, "rb") as f:
            img_data = base64.standard_b64encode(f.read()).decode("utf-8")
        media_type = "image/png" if path.endswith(".png") else "image/jpeg"
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": media_type,
                "data": img_data,
            },
        })

    # Vision analysis disabled — see analyze_with_claude() above for context.
    return (
        f"[claudex limitation] Playwright captured {len(screenshot_paths)} screenshots "
        f"in {frames_dir}. Open them in an interactive Claude Code session for analysis "
        "(claude -p is text-only)."
    )


# ── Main ──────────────────────────────────────────────────────────────────────

def analyze_video(
    url: str,
    num_frames: int = 8,
    model: str = "claude-haiku-4-5-20251001",
    use_playwright: bool = False,
) -> dict:
    """Full pipeline: download, extract frames, analyze.

    Args:
        url: Twitter/X URL
        num_frames: Number of frames to extract (default 8)
        model: Claude model to use for analysis
        use_playwright: Force Playwright fallback

    Returns:
        Dict with keys: url, author, title, analysis, frames_dir, video_path
    """
    if use_playwright:
        print("Using Playwright screenshot approach...")
        analysis = analyze_with_playwright(url, num_screenshots=num_frames)
        return {
            "url": url,
            "author": "unknown",
            "title": "N/A",
            "analysis": analysis,
            "frames_dir": str(DOWNLOADS_DIR / "playwright_frames"),
            "video_path": None,
            "method": "playwright",
        }

    print(f"Downloading video from {url}...")
    try:
        video_path, metadata = download_video(url)
    except Exception as e:
        print(f"  yt-dlp download failed: {e}")
        print("  Falling back to Playwright screenshot approach...")
        analysis = analyze_with_playwright(url, num_screenshots=num_frames)
        return {
            "url": url,
            "author": "unknown",
            "title": "N/A",
            "analysis": analysis,
            "frames_dir": str(DOWNLOADS_DIR / "playwright_frames"),
            "video_path": None,
            "method": "playwright_fallback",
        }

    print(f"  Downloaded: {video_path}")
    print(f"  Author: @{metadata.get('uploader', 'unknown')}")

    print(f"Extracting {num_frames} frames...")
    frames = extract_frames(video_path, num_frames=num_frames)
    print(f"  Extracted {len(frames)} frames")

    if not frames:
        raise RuntimeError("No frames could be extracted from the video.")

    print(f"Analyzing with Claude ({model})...")
    analysis = analyze_with_claude(frames, metadata, model=model)

    author = metadata.get("uploader") or metadata.get("uploader_id") or "unknown"
    title = metadata.get("title") or metadata.get("description") or "N/A"
    video_id = metadata.get("id", "unknown")

    # Save analysis as markdown
    output_file = DOWNLOADS_DIR / f"analysis_{video_id}.md"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"# Video Analysis\n\n")
        f.write(f"**URL:** {url}\n")
        f.write(f"**Author:** @{author}\n")
        f.write(f"**Title:** {title}\n")
        if metadata.get("duration"):
            f.write(f"**Duration:** {metadata['duration']:.0f}s\n")
        if metadata.get("view_count"):
            f.write(f"**Views:** {metadata['view_count']:,}\n")
        f.write(f"\n---\n\n")
        f.write(analysis)

    print(f"\nSaved analysis to {output_file}")

    return {
        "url": url,
        "author": author,
        "title": title,
        "analysis": analysis,
        "frames_dir": str(Path(video_path).parent / f"frames_{Path(video_path).stem}"),
        "video_path": video_path,
        "analysis_file": str(output_file),
        "method": "yt-dlp",
        "metadata": metadata,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Download and analyze Twitter/X videos with AI",
        usage="python tools/twitter-video.py [URL] [options]",
    )
    parser.add_argument("url", nargs="?", help="Twitter/X URL to analyze")
    parser.add_argument("--url", dest="url_flag", help="Twitter/X URL (alternative)")
    parser.add_argument(
        "--frames", type=int, default=8,
        help="Number of frames to extract (default: 8)",
    )
    parser.add_argument(
        "--model", default="claude-haiku-4-5-20251001",
        help="Claude model for analysis (default: claude-haiku-4-5-20251001)",
    )
    parser.add_argument(
        "--deep", action="store_true",
        help="Use Sonnet for deeper analysis (costs more)",
    )
    parser.add_argument(
        "--playwright", action="store_true",
        help="Force Playwright screenshot approach instead of yt-dlp",
    )

    args = parser.parse_args()

    url = args.url or args.url_flag
    if not url:
        url = input("Twitter/X URL: ").strip()

    if not url:
        print("Error: No URL provided.")
        sys.exit(1)

    # Normalize URL
    url = url.strip().strip('"').strip("'")
    if not re.match(r"https?://(twitter\.com|x\.com|t\.co)/", url):
        print(f"Warning: URL doesn't look like a Twitter/X link: {url}")

    # Check dependencies
    missing = check_dependencies()
    if missing:
        print("Missing dependencies:")
        for dep in missing:
            print(f"  - {dep}")
        sys.exit(1)

    model = args.model
    if args.deep:
        model = "claude-sonnet-4-5-20250514"

    try:
        result = analyze_video(
            url=url,
            num_frames=args.frames,
            model=model,
            use_playwright=args.playwright,
        )
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("VIDEO ANALYSIS")
    print("=" * 60)
    print(f"Source:  {result['url']}")
    print(f"Author: @{result['author']}")
    print(f"Title:  {result['title']}")
    print(f"Method: {result['method']}")
    print("-" * 60)
    print()
    print(result["analysis"])
    print()


if __name__ == "__main__":
    main()
