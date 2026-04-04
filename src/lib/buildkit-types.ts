export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  tier: "launch-now" | "build-next" | "opportunistic" | "parked";
  status: "planned" | "building" | "beta" | "live" | "paused" | "archived";
  icon: string;
  color: string;
  github_repo: string | null;
  deploy_url: string | null;
  demo_url: string | null;
  landing_url: string | null;
  mrr: number;
  customer_count: number;
  feasibility: number;
  current_sprint: string | null;
  next_milestone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  score: number;
  feasibility: number;
  market_size: string | null;
  revenue_potential: string | null;
  status: "idea" | "researched" | "validated" | "promoted" | "killed";
  product_id: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingEvent {
  id: string;
  product_id: string | null;
  title: string;
  event_type: "blog" | "social" | "email" | "launch" | "demo" | "outreach" | "seo" | "community" | "ad";
  platform: string | null;
  scheduled_date: string;
  status: "planned" | "in-progress" | "done" | "skipped";
  content_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface RevenueEvent {
  id: string;
  product_id: string | null;
  amount: number;
  source: "stripe" | "lemonsqueezy" | "mcpize" | "manual" | "consulting" | "other";
  description: string | null;
  event_date: string;
  recurring: boolean;
  created_at: string;
}

export const TIER_CONFIG = {
  "launch-now": { label: "Launch Now", color: "emerald", border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  "build-next": { label: "Build Next", color: "cyan", border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-400" },
  "opportunistic": { label: "Opportunistic", color: "amber", border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400" },
  "parked": { label: "Parked", color: "zinc", border: "border-zinc-500/30", bg: "bg-zinc-500/10", text: "text-zinc-400" },
} as const;

export const STATUS_CONFIG = {
  planned: { label: "Planned", dot: "bg-zinc-400" },
  building: { label: "Building", dot: "bg-cyan-400 animate-pulse" },
  beta: { label: "Beta", dot: "bg-amber-400" },
  live: { label: "Live", dot: "bg-emerald-400" },
  paused: { label: "Paused", dot: "bg-zinc-600" },
  archived: { label: "Archived", dot: "bg-zinc-800" },
} as const;

export const PRODUCT_COLORS: Record<string, string> = {
  cyan: "border-cyan-500/30 hover:border-cyan-500/60",
  emerald: "border-emerald-500/30 hover:border-emerald-500/60",
  amber: "border-amber-500/30 hover:border-amber-500/60",
  purple: "border-purple-500/30 hover:border-purple-500/60",
  orange: "border-orange-500/30 hover:border-orange-500/60",
  rose: "border-rose-500/30 hover:border-rose-500/60",
  sky: "border-sky-500/30 hover:border-sky-500/60",
  zinc: "border-zinc-500/30 hover:border-zinc-500/60",
};
