"use client";

import { useState } from "react";

export function MoreDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-white hover:bg-white/5 rounded transition-colors"
      >
        More ▾
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-[200] w-44 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 rounded-lg shadow-2xl py-1.5 space-y-0.5">
            <a href="/sessions" className="block px-3 py-1.5 text-[10px] uppercase tracking-wider text-purple-400 hover:bg-purple-500/10 rounded mx-1 transition-colors">Sessions</a>
            <a href="/templates" className="block px-3 py-1.5 text-[10px] uppercase tracking-wider text-orange-400 hover:bg-orange-500/10 rounded mx-1 transition-colors">Templates</a>
            <a href="/workflows" className="block px-3 py-1.5 text-[10px] uppercase tracking-wider text-purple-400 hover:bg-purple-500/10 rounded mx-1 transition-colors">Flows</a>
            <a href="/fusion" className="block px-3 py-1.5 text-[10px] uppercase tracking-wider text-cyan-400 hover:bg-cyan-500/10 rounded mx-1 transition-colors">Fusion</a>
            <a href="/costs" className="block px-3 py-1.5 text-[10px] uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/10 rounded mx-1 transition-colors">Costs</a>
            <a href="/achievements" className="block px-3 py-1.5 text-[10px] uppercase tracking-wider text-amber-400 hover:bg-amber-500/10 rounded mx-1 transition-colors">Trophies</a>
            <div className="h-px bg-zinc-800 mx-2 my-1" />
            <a href="/guide" className="block px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-400 hover:bg-white/5 rounded mx-1 transition-colors">Guide</a>
            <a href="/setup" className="block px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-400 hover:bg-white/5 rounded mx-1 transition-colors">Setup</a>
            <a href="/settings" className="block px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-400 hover:bg-white/5 rounded mx-1 transition-colors">Settings</a>
          </div>
        </>
      )}
    </div>
  );
}
