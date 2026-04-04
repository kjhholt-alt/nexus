"use client";

import { useEffect, useState } from "react";

interface UsageData {
  session_pct: number;
  session_resets_at: string;
  weekly_pct: number;
  weekly_resets_at: string;
  sonnet_pct: number;
  sonnet_resets_at: string;
  extra_spent_cents: number;
  extra_limit_cents: number;
  balance_cents: number;
  auto_reload: boolean;
}

function timeUntil(iso: string): string {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "~";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 23) return `${Math.floor(h / 24)}d`;
  return h > 0 ? `${h}h${m}m` : `${m}m`;
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 3, background: "#111827", borderRadius: 2, overflow: "hidden", flex: 1 }}>
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: color,
          borderRadius: 2,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

export default function FloatingWidget() {
  const [data, setData] = useState<UsageData | null>(null);
  const [hovered, setHovered] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);

  // Strip nav/header/alert bars — this is a standalone floating widget
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "widget-override";
    style.textContent = `
      nav, header, [class*="nav-"], [class*="alert"], [class*="ribbon"],
      [class*="status"], .ops-status, .AlertBanner { display: none !important; }
      body, html { background: transparent !important; overflow: hidden !important; }
      #__next, main { background: transparent !important; }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("widget-override")?.remove();
  }, []);

  useEffect(() => {
    const load = () =>
      fetch("/api/claude-usage", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => { if (d.session_pct !== undefined) { setData(d); setLastFetch(Date.now()); } })
        .catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const sessionColor = (data?.session_pct ?? 0) >= 80 ? "#ef4444" : (data?.session_pct ?? 0) >= 60 ? "#f59e0b" : "#3b82f6";
  const weeklyColor = (data?.weekly_pct ?? 0) >= 80 ? "#ef4444" : "#3b82f6";
  const ageS = lastFetch ? Math.round((Date.now() - lastFetch) / 1000) : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "transparent",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        padding: 0,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          opacity: hovered ? 1 : 0.08,
          transition: "opacity 0.25s ease",
          background: hovered ? "rgba(8,11,18,0.97)" : "rgba(8,11,18,0.6)",
          border: "1px solid rgba(34,211,238,0.12)",
          borderRadius: 8,
          padding: "10px 12px",
          width: 220,
          backdropFilter: "blur(4px)",
          cursor: "default",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ color: "#94a3b8", fontSize: 9, letterSpacing: "0.12em", fontWeight: 600 }}>
            CLAUDE MAX
          </span>
          <span style={{ color: "#374151", fontSize: 8 }}>
            {ageS !== null ? `${ageS}s` : "…"}
          </span>
        </div>

        {data ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Session */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ color: "#64748b", fontSize: 9 }}>session</span>
                <span style={{ color: "#e2e8f0", fontSize: 9, fontVariantNumeric: "tabular-nums" }}>
                  {data.session_pct}% · {timeUntil(data.session_resets_at)}
                </span>
              </div>
              <Bar pct={data.session_pct} color={sessionColor} />
            </div>

            {/* Weekly */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ color: "#64748b", fontSize: 9 }}>weekly</span>
                <span style={{ color: "#e2e8f0", fontSize: 9, fontVariantNumeric: "tabular-nums" }}>
                  {data.weekly_pct}% · {timeUntil(data.weekly_resets_at)}
                </span>
              </div>
              <Bar pct={data.weekly_pct} color={weeklyColor} />
            </div>

            {/* Sonnet */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ color: "#64748b", fontSize: 9 }}>sonnet</span>
                <span style={{ color: "#e2e8f0", fontSize: 9, fontVariantNumeric: "tabular-nums" }}>
                  {data.sonnet_pct}%
                </span>
              </div>
              <Bar pct={data.sonnet_pct} color="#8b5cf6" />
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #111827", marginTop: 2, paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: "#374151", fontSize: 8, marginBottom: 1 }}>extra</div>
                <div style={{ color: "#f97316", fontSize: 10, fontVariantNumeric: "tabular-nums" }}>
                  ${(data.extra_spent_cents / 100).toFixed(2)}
                  <span style={{ color: "#374151" }}> /{(data.extra_limit_cents / 100).toFixed(0)}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#374151", fontSize: 8, marginBottom: 1 }}>
                  balance{data.auto_reload ? " ↺" : ""}
                </div>
                <div style={{ color: "#10b981", fontSize: 10, fontVariantNumeric: "tabular-nums" }}>
                  ${(data.balance_cents / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: "#374151", fontSize: 9, textAlign: "center", padding: "8px 0" }}>
            no data
          </div>
        )}
      </div>
    </div>
  );
}
