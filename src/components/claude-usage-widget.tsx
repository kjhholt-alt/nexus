"use client";

import { useEffect, useState } from "react";

interface UsageData {
  session_pct: number;
  session_resets_at: string;
  weekly_pct: number;
  weekly_resets_at: string;
  sonnet_pct: number;
  sonnet_resets_at: string;
  extra_enabled: boolean;
  extra_spent_cents: number;
  extra_limit_cents: number;
  extra_pct: number;
  balance_cents: number;
  auto_reload: boolean;
  fetched_at: number;
  error?: string;
}

function Bar({ pct, color }: { pct: number; color: string }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="h-1.5 w-full rounded-full bg-[#1a2235]">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function timeUntil(iso: string): string {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "resetting…";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 23) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function ClaudeUsageWidget() {
  const [data, setData] = useState<UsageData | null>(null);
  const [lastPoll, setLastPoll] = useState<Date | null>(null);

  async function poll() {
    try {
      const res = await fetch("/api/claude-usage", { cache: "no-store" });
      const json = await res.json();
      setData(json);
      setLastPoll(new Date());
    } catch {
      setData({ error: "fetch_failed" } as UsageData);
    }
  }

  useEffect(() => {
    poll();
    const id = setInterval(poll, 60_000);
    return () => clearInterval(id);
  }, []);

  const unavailable = !data || data.error === "proxy_unavailable";

  return (
    <div className="rounded-lg border border-[#1a2235] bg-[#0d1321] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Claude Usage
        </span>
        <span className="flex items-center gap-1 text-[9px] text-zinc-600">
          <span
            className={`h-1.5 w-1.5 rounded-full ${unavailable ? "bg-zinc-700" : "bg-emerald-500"}`}
          />
          {unavailable
            ? "proxy offline"
            : lastPoll
              ? `${Math.round((Date.now() - lastPoll.getTime()) / 1000)}s ago`
              : "…"}
        </span>
      </div>

      {unavailable ? (
        <div className="py-3 text-center text-[10px] text-zinc-600">
          Run <code className="text-zinc-400">python tools/claude-usage-server.py</code>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Session */}
          <div>
            <div className="mb-1 flex justify-between text-[10px]">
              <span className="text-zinc-400">Session</span>
              <span className="text-zinc-300">
                {data.session_pct}%
                <span className="ml-1 text-zinc-600">
                  resets {timeUntil(data.session_resets_at)}
                </span>
              </span>
            </div>
            <Bar
              pct={data.session_pct}
              color={
                data.session_pct >= 80
                  ? "bg-red-500"
                  : data.session_pct >= 60
                    ? "bg-amber-400"
                    : "bg-blue-500"
              }
            />
          </div>

          {/* Weekly all models */}
          <div>
            <div className="mb-1 flex justify-between text-[10px]">
              <span className="text-zinc-400">Weekly (all)</span>
              <span className="text-zinc-300">
                {data.weekly_pct}%
                <span className="ml-1 text-zinc-600">
                  resets {timeUntil(data.weekly_resets_at)}
                </span>
              </span>
            </div>
            <Bar
              pct={data.weekly_pct}
              color={
                data.weekly_pct >= 80 ? "bg-red-500" : data.weekly_pct >= 60 ? "bg-amber-400" : "bg-blue-500"
              }
            />
          </div>

          {/* Weekly Sonnet */}
          <div>
            <div className="mb-1 flex justify-between text-[10px]">
              <span className="text-zinc-400">Weekly (Sonnet)</span>
              <span className="text-zinc-300">
                {data.sonnet_pct}%
                <span className="ml-1 text-zinc-600">
                  resets {timeUntil(data.sonnet_resets_at)}
                </span>
              </span>
            </div>
            <Bar
              pct={data.sonnet_pct}
              color={
                data.sonnet_pct >= 80 ? "bg-red-500" : data.sonnet_pct >= 60 ? "bg-amber-400" : "bg-violet-500"
              }
            />
          </div>

          {/* Divider */}
          <div className="border-t border-[#1a2235]" />

          {/* Extra usage + balance */}
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="mb-0.5 text-[9px] text-zinc-600">Extra usage</div>
              <div className="text-[11px] font-mono text-zinc-300">
                {dollars(data.extra_spent_cents)}
                <span className="text-zinc-600"> / {dollars(data.extra_limit_cents)}</span>
              </div>
              <Bar
                pct={(data.extra_spent_cents / (data.extra_limit_cents || 1)) * 100}
                color="bg-orange-500"
              />
            </div>
            <div className="flex-1">
              <div className="mb-0.5 text-[9px] text-zinc-600">
                Balance{data.auto_reload ? " · auto-reload" : ""}
              </div>
              <div className="text-[11px] font-mono text-emerald-400">
                {dollars(data.balance_cents)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
