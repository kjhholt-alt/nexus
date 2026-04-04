"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb, Plus, RefreshCw, ArrowUpRight, X, Check,
  TrendingUp, Target, Sparkles, Archive,
} from "lucide-react";
import type { Idea } from "@/lib/buildkit-types";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  idea: { bg: "bg-zinc-500/10 border-zinc-500/20", text: "text-zinc-400", label: "Idea" },
  researched: { bg: "bg-cyan-500/10 border-cyan-500/20", text: "text-cyan-400", label: "Researched" },
  validated: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", label: "Validated" },
  promoted: { bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400", label: "Product" },
  killed: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400", label: "Killed" },
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-zinc-600 uppercase w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] text-zinc-400 w-6 text-right">{score}</span>
    </div>
  );
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: "", description: "", source: "", score: 50, feasibility: 5 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ideas");
      if (res.ok) setIdeas(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function createIdea() {
    if (!newIdea.title.trim()) return;
    await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newIdea, status: "idea" }),
    });
    setNewIdea({ title: "", description: "", source: "", score: 50, feasibility: 5 });
    setShowNew(false);
    fetchData();
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/ideas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  }

  const active = ideas.filter(i => i.status !== "killed" && i.status !== "promoted");
  const promoted = ideas.filter(i => i.status === "promoted");
  const killed = ideas.filter(i => i.status === "killed");

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#0a0a0f" }}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Lightbulb className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Ideas</h1>
              <p className="text-xs text-zinc-600 uppercase tracking-widest">
                Capture, score, promote to product
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/products"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors">
              Products
            </a>
            <button onClick={() => setShowNew(!showNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Idea
            </button>
            <button onClick={fetchData}
              className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-cyan-500/30 transition-colors">
              <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </motion.header>

        {/* New Idea Form */}
        {showNew && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-zinc-900/80 border border-emerald-500/20 rounded-xl p-4 space-y-3">
            <input
              value={newIdea.title}
              onChange={e => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Idea title..."
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
            <textarea
              value={newIdea.description}
              onChange={e => setNewIdea(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description..."
              rows={2}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-zinc-500 uppercase">Source</label>
                <input
                  value={newIdea.source}
                  onChange={e => setNewIdea(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="Where'd this come from?"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="w-24">
                <label className="text-[10px] text-zinc-500 uppercase">Score (0-100)</label>
                <input
                  type="number" min={0} max={100}
                  value={newIdea.score}
                  onChange={e => setNewIdea(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="w-24">
                <label className="text-[10px] text-zinc-500 uppercase">Feasibility</label>
                <input
                  type="number" min={0} max={10}
                  value={newIdea.feasibility}
                  onChange={e => setNewIdea(prev => ({ ...prev, feasibility: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNew(false)}
                className="px-3 py-1.5 text-[10px] text-zinc-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={createIdea}
                className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors">
                <Check className="w-3 h-3" /> Save
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-zinc-900/50 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Active Ideas</span>
            </div>
            <div className="text-2xl font-bold text-amber-400">{active.length}</div>
          </div>
          <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Avg Score</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {active.length > 0 ? Math.round(active.reduce((s, i) => s + i.score, 0) / active.length) : 0}
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Promoted</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{promoted.length}</div>
          </div>
          <div className="bg-zinc-900/50 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <X className="w-4 h-4 text-red-400" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Killed</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{killed.length}</div>
          </div>
        </motion.div>

        {/* Ideas List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Pipeline ({active.length} active)
            </h2>
          </div>
          <div className="divide-y divide-zinc-800/30">
            {active.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-600 text-sm">No ideas yet. Add one above.</div>
            ) : (
              active.map((idea) => {
                const st = STATUS_STYLES[idea.status];
                return (
                  <div key={idea.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-white">{idea.title}</h3>
                          <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${st.bg} ${st.text}`}>
                            {st.label}
                          </span>
                          {idea.source && (
                            <span className="text-[9px] text-zinc-600">via {idea.source}</span>
                          )}
                        </div>
                        {idea.description && (
                          <p className="text-[11px] text-zinc-500 mb-2 line-clamp-2">{idea.description}</p>
                        )}
                        <div className="space-y-1 max-w-md">
                          <ScoreBar score={idea.score} label="Score" />
                          <ScoreBar score={idea.feasibility * 10} label="Feasible" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {idea.status !== "validated" && (
                          <button onClick={() => updateStatus(idea.id, "validated")}
                            className="flex items-center gap-1 px-2 py-1 text-[9px] text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors">
                            <Check className="w-3 h-3" /> Validate
                          </button>
                        )}
                        {(idea.status === "validated" || idea.status === "researched") && (
                          <button onClick={() => updateStatus(idea.id, "promoted")}
                            className="flex items-center gap-1 px-2 py-1 text-[9px] text-purple-400 hover:bg-purple-500/10 rounded transition-colors">
                            <ArrowUpRight className="w-3 h-3" /> Promote
                          </button>
                        )}
                        <button onClick={() => updateStatus(idea.id, "killed")}
                          className="flex items-center gap-1 px-2 py-1 text-[9px] text-red-400 hover:bg-red-500/10 rounded transition-colors">
                          <X className="w-3 h-3" /> Kill
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Promoted & Killed sections */}
        {promoted.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Promoted to Product ({promoted.length})
              </h2>
            </div>
            <div className="divide-y divide-zinc-800/30">
              {promoted.map(idea => (
                <div key={idea.id} className="px-4 py-2.5 flex items-center gap-2">
                  <ArrowUpRight className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-white">{idea.title}</span>
                  <span className="text-[10px] text-purple-400/60 ml-auto">Score: {idea.score}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {killed.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="bg-zinc-900/50 border border-zinc-800/30 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center gap-2">
              <Archive className="w-4 h-4 text-zinc-600" />
              <h2 className="text-sm font-semibold text-zinc-600 uppercase tracking-wider">
                Killed ({killed.length})
              </h2>
            </div>
            <div className="divide-y divide-zinc-800/30">
              {killed.map(idea => (
                <div key={idea.id} className="px-4 py-2 flex items-center gap-2">
                  <X className="w-3 h-3 text-zinc-700" />
                  <span className="text-xs text-zinc-600 line-through">{idea.title}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
