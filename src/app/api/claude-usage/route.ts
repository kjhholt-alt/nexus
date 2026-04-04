import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CACHE_PATH = join(process.cwd(), "claude-usage-cache.json");

function readCache() {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return null;
  }
}

export async function GET() {
  const data = readCache();
  if (!data) {
    return NextResponse.json({ error: "no_data" }, { status: 503 });
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    writeFileSync(CACHE_PATH, JSON.stringify({ ...body, cached_at: Date.now() }));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}
