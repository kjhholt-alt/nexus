"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package, DollarSign, Users, TrendingUp, RefreshCw, Plus,
  Wrench, Server, Phone, Bot, Search, FileSearch, Rocket, FileText,
  ExternalLink, Play, Eye, GitBranch, ArrowRight, Sparkles,
} from "lucide-react";
import type { Product } from "@/lib/buildkit-types";
import { TIER_CONFIG, STATUS_CONFIG, PRODUCT_COLORS } from "@/lib/buildkit-types";

const ICON_MAP: Record<string, React.ReactNode> = {
  Wrench: <Wrench className="w-5 h-5" />,
  Server: <Server className="w-5 h-5" />,
  Phone: <Phone className="w-5 h-5" />,
  Bot: <Bot className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  FileSearch: <FileSearch className="w-5 h-5" />,
  Rocket: <Rocket className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
};

const COLOR_TEXT: Record<string, string> = {
  cyan: "text-cyan-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
  orange: "text-orange-400",
  rose: "text-rose-400",
  sky: "text-sky-400",
  zinc: "text-zinc-400",
};

const COLOR_BG: Record<string, string> = {
  cyan: "bg-cyan-500/10 border-cyan-500/20",
  emerald: "bg-emerald-500/10 border-emerald-500/20",
  amber: "bg-amber-500/10 border-amber-500/20",
  purple: "bg-purple-500/10 border-purple-500/20",
  orange: "bg-orange-500/10 border-orange-500/20",
  rose: "bg-rose-500/10 border-rose-500/20",
  sky: "bg-sky-500/10 border-sky-500/20",
  zinc: "bg-zinc-500/10 border-zinc-500/20",
};

interface RevenueData {
  totalMRR: number;
  totalRevenue: number;
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const tier = TIER_CONFIG[product.tier];
  const status = STATUS_CONFIG[product.status];
  const borderColor = PRODUCT_COLORS[product.color] || PRODUCT_COLORS.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group bg-zinc-900/50 border ${borderColor} rounded-xl overflow-hidden transition-all duration-300 hover:bg-zinc-900/80`}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className={`p-2 rounded-lg border ${COLOR_BG[product.color] || COLOR_BG.cyan}`}>
          <span className={COLOR_TEXT[product.color] || COLOR_TEXT.cyan}>
            {ICON_MAP[product.icon] || <Package className="w-5 h-5" />}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
            <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
          </div>
          <p className="text-[10px] text-zinc-500 truncate">{product.tagline}</p>
        </div>
        <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${tier.bg} ${tier.border} ${tier.text}`}>
          {tier.label}
        </span>
      </div>

      {/* Metrics */}
      <div className="px-4 pb-2 grid grid-cols-3 gap-2">
        <div className="bg-zinc-800/30 rounded-lg p-2">
          <span className="text-[9px] text-zinc-600 uppercase">MRR</span>
          <p className="text-sm font-bold text-emerald-400">${product.mrr.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-2">
          <span className="text-[9px] text-zinc-600 uppercase">Customers</span>
          <p className="text-sm font-bold text-white">{product.customer_count}</p>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-2">
          <span className="text-[9px] text-zinc-600 uppercase">Feasibility</span>
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold text-cyan-400">{product.feasibility}/10</p>
          </div>
        </div>
      </div>

      {/* Sprint / Milestone */}
      {(product.current_sprint || product.next_milestone) && (
        <div className="px-4 pb-2">
          {product.current_sprint && (
            <div className="flex items-center gap-1.5 text-[10px]">
              <Play className="w-3 h-3 text-cyan-400" />
              <span className="text-zinc-400">Sprint:</span>
              <span className="text-white">{product.current_sprint}</span>
            </div>
          )}
          {product.next_milestone && (
            <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
              <ArrowRight className="w-3 h-3 text-amber-400" />
              <span className="text-zinc-400">Next:</span>
              <span className="text-zinc-300">{product.next_milestone}</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t border-zinc-800/50 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {product.deploy_url && (
          <a href={product.deploy_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors">
            <ExternalLink className="w-3 h-3" /> Live
          </a>
        )}
        {product.demo_url && (
          <a href={product.demo_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors">
            <Eye className="w-3 h-3" /> Demo
          </a>
        )}
        {product.github_repo && (
          <a href={`https://github.com/${product.github_repo}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-purple-400 hover:bg-purple-500/10 rounded transition-colors">
            <GitBranch className="w-3 h-3" /> Repo
          </a>
        )}
        <button className="flex items-center gap-1 px-2 py-1 text-[10px] text-amber-400 hover:bg-amber-500/10 rounded transition-colors ml-auto">
          <Sparkles className="w-3 h-3" /> Spawn Agent
        </button>
      </div>
    </motion.div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [revenue, setRevenue] = useState<RevenueData>({ totalMRR: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, revenueRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/revenue?days=30"),
      ]);
      if (productsRes.ok) setProducts(await productsRes.json());
      if (revenueRes.ok) setRevenue(await revenueRes.json());
    } catch {
      // silent — cards will show empty state
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tiers = ["launch-now", "build-next", "opportunistic", "parked"] as const;
  const totalMRR = products.reduce((sum, p) => sum + Number(p.mrr), 0);
  const totalCustomers = products.reduce((sum, p) => sum + p.customer_count, 0);
  const liveCount = products.filter(p => p.status === "live" || p.status === "beta").length;
  const buildingCount = products.filter(p => p.status === "building").length;

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#0a0a0f" }}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Package className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Products</h1>
              <p className="text-xs text-zinc-600 uppercase tracking-widest">
                BuildKit Portfolio — {products.length} products
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/ideas"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors">
              <Sparkles className="w-3.5 h-3.5" /> Ideas
            </a>
            <button onClick={fetchData}
              className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-cyan-500/30 transition-colors">
              <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </motion.header>

        {/* Top Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Total MRR</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">${totalMRR.toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900/50 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Customers</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{totalCustomers}</div>
          </div>
          <div className="bg-zinc-900/50 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Live / Beta</span>
            </div>
            <div className="text-2xl font-bold text-cyan-400">{liveCount}</div>
          </div>
          <div className="bg-zinc-900/50 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Building</span>
            </div>
            <div className="text-2xl font-bold text-amber-400">{buildingCount}</div>
          </div>
        </motion.div>

        {/* Product Grid by Tier */}
        {tiers.map((tierKey) => {
          const tierProducts = products.filter(p => p.tier === tierKey);
          if (tierProducts.length === 0) return null;
          const config = TIER_CONFIG[tierKey];

          return (
            <motion.section key={tierKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${config.bg.replace("bg-", "bg-").replace("/10", "")}`} />
                <h2 className={`text-xs font-semibold uppercase tracking-wider ${config.text}`}>
                  {config.label}
                </h2>
                <span className="text-[10px] text-zinc-600">({tierProducts.length})</span>
                <div className="flex-1 h-px bg-zinc-800/50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {tierProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </motion.section>
          );
        })}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Package className="w-12 h-12 mb-4" />
            <p className="text-sm">No products yet. Run the SQL migration to seed data.</p>
            <p className="text-xs mt-1 text-zinc-700">supabase/migrations/20260403_buildkit_products.sql</p>
          </div>
        )}
      </div>
    </div>
  );
}
