"use client";

import { motion } from "framer-motion";
import {
  BookOpen, Package, Lightbulb, Wrench, Server, Phone, Bot, Search,
  FileSearch, Rocket, FileText, ArrowRight, Sparkles, Terminal,
  GitBranch, Eye, DollarSign, Calendar, Zap, ChevronRight,
  Monitor, MessageSquare, Play, CheckCircle2, BarChart3,
  Layers, RefreshCw, Globe, Users, Target,
} from "lucide-react";

const PRODUCT_GUIDE = [
  { name: "AI Ops in a Week", icon: <Wrench className="w-4 h-4" />, color: "amber", tier: "Launch Now", desc: "$3.5K/client consulting", action: "Send cold emails → Land client → Deliver in 1 week → Upsell retainer" },
  { name: "MCP Servers", icon: <Server className="w-4 h-4" />, color: "cyan", tier: "Launch Now", desc: "5 servers → MCPize", action: "Deploy email-finder → Deploy SEO autopilot → Monitor conversions" },
  { name: "Voice Receptionist", icon: <Phone className="w-4 h-4" />, color: "emerald", tier: "Build Next", desc: "AI phone answering", action: "Build on Retell AI → Target law firms → $199/mo" },
  { name: "BuildKit Agents", icon: <Bot className="w-4 h-4" />, color: "purple", tier: "Build Next", desc: "White-label AI agents", action: "Build 3 demo agents → Outreach to agencies → Managed service" },
  { name: "Prospector Pro", icon: <Search className="w-4 h-4" />, color: "orange", tier: "Build Next", desc: "Vertical lead gen", action: "Scraper MVP → Readiness scoring → Agency outreach" },
  { name: "DealBrain", icon: <FileSearch className="w-4 h-4" />, color: "rose", tier: "Build Next", desc: "Small biz DD reports", action: "PDF upload → Multi-agent analysis → $199-499/report" },
  { name: "ShipIt", icon: <Rocket className="w-4 h-4" />, color: "sky", tier: "Opportunistic", desc: "Code factory", action: "Take projects via referrals — don't build a platform" },
  { name: "ClaimsReader", icon: <FileText className="w-4 h-4" />, color: "zinc", tier: "Parked", desc: "Insurance doc extraction", action: "Build demo → Find co-founder with insurance connections" },
];

const WORKFLOW_STEPS = [
  { icon: <Lightbulb className="w-5 h-5" />, label: "Idea", desc: "/ideas — Capture and score", color: "text-amber-400" },
  { icon: <Target className="w-5 h-5" />, label: "Validate", desc: "Research via swarm agents", color: "text-cyan-400" },
  { icon: <ArrowRight className="w-5 h-5" />, label: "Promote", desc: "Move to /products", color: "text-purple-400" },
  { icon: <Play className="w-5 h-5" />, label: "Plan", desc: "Spawn planning agent", color: "text-emerald-400" },
  { icon: <Terminal className="w-5 h-5" />, label: "Code", desc: "Agent builds in worktree", color: "text-cyan-400" },
  { icon: <Eye className="w-5 h-5" />, label: "Review", desc: "Codex verifies + PR", color: "text-amber-400" },
  { icon: <Rocket className="w-5 h-5" />, label: "Ship", desc: "Deploy to Vercel/Railway", color: "text-emerald-400" },
  { icon: <BarChart3 className="w-5 h-5" />, label: "Track", desc: "Revenue + marketing", color: "text-purple-400" },
];

const QUICK_COMMANDS = [
  { section: "Navigation", items: [
    { keys: ["Ctrl", "K"], desc: "Command palette" },
    { keys: ["Ctrl", "1"], desc: "Focus Claude 1 (operator)" },
    { keys: ["Ctrl", "2"], desc: "Focus Claude 2 (coder)" },
    { keys: ["Ctrl", "3"], desc: "Focus Codex (verifier)" },
    { keys: ["`"], desc: "Open Obsidian notes" },
  ]},
  { section: "Nexus Pages", items: [
    { keys: ["/products"], desc: "Product portfolio hub" },
    { keys: ["/ideas"], desc: "Idea pipeline" },
    { keys: ["/today"], desc: "Daily dashboard" },
    { keys: ["/ops"], desc: "Task kanban + agents" },
    { keys: ["/command"], desc: "Work logs" },
    { keys: ["/costs"], desc: "API spend tracking" },
    { keys: ["/oracle"], desc: "AI decision engine" },
    { keys: ["/game"], desc: "3D factory visualization" },
  ]},
  { section: "Agent Commands", items: [
    { keys: ["hud_build"], desc: "Start building (fast path)" },
    { keys: ["hud_ship"], desc: "Ship to production" },
    { keys: ["hud_report"], desc: "Log progress/finding/error" },
    { keys: ["hud_inbox"], desc: "What needs attention" },
    { keys: ["hud_dashboard"], desc: "System health" },
    { keys: ["hud_poll_directives"], desc: "Check for operator instructions" },
  ]},
  { section: "Deploy", items: [
    { keys: ["vercel deploy"], desc: "Frontend → Vercel" },
    { keys: ["railway up"], desc: "Backend → Railway (from service dir!)" },
    { keys: ["git push"], desc: "Auto-deploy via CI" },
  ]},
];

const ARCHITECTURE = [
  { icon: <Monitor className="w-5 h-5" />, name: "Nexus", desc: "Dashboard + command center", color: "text-cyan-400", detail: "Next.js 16, Supabase Realtime" },
  { icon: <Layers className="w-5 h-5" />, name: "Operator HUD", desc: "Task lifecycle + agent routing", color: "text-amber-400", detail: "28 MCP tools, port 8400" },
  { icon: <RefreshCw className="w-5 h-5" />, name: "n8n Hub", desc: "Scheduled automations", color: "text-emerald-400", detail: "15 workflows on Railway" },
  { icon: <MessageSquare className="w-5 h-5" />, name: "Discord", desc: "Agent comms + alerts", color: "text-purple-400", detail: "Bot + plugin + webhooks" },
  { icon: <Globe className="w-5 h-5" />, name: "Supabase", desc: "Shared data layer", color: "text-rose-400", detail: "Realtime, 18+ tables" },
  { icon: <Terminal className="w-5 h-5" />, name: "WezTerm", desc: "3-pane agent terminal", color: "text-sky-400", detail: "Claude 1 + Claude 2 + Codex" },
];

function Section({ title, icon, children, delay = 0 }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{title}</h2>
        <div className="flex-1 h-px bg-zinc-800/50" />
      </div>
      {children}
    </motion.section>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#0a0a0f" }}>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-8">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <BookOpen className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NEXUS Guide</h1>
          <p className="text-sm text-zinc-500 max-w-lg mx-auto">
            One app. Every product. Every agent. Every metric.
            Here&apos;s how everything connects.
          </p>
        </motion.header>

        {/* The Flow — Visual Pipeline */}
        <Section title="The Flow: Idea → Revenue" icon={<Zap className="w-4 h-4 text-amber-400" />} delay={0.1}>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-[700px]">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5 px-3 py-2 bg-zinc-800/30 rounded-lg border border-zinc-700/30 min-w-[90px]">
                    <span className={step.color}>{step.icon}</span>
                    <span className="text-[10px] font-semibold text-white uppercase">{step.label}</span>
                    <span className="text-[9px] text-zinc-500 text-center">{step.desc}</span>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0 mx-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Architecture */}
        <Section title="Architecture" icon={<Layers className="w-4 h-4 text-cyan-400" />} delay={0.15}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ARCHITECTURE.map(a => (
              <div key={a.name} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={a.color}>{a.icon}</span>
                  <span className="text-xs font-semibold text-white">{a.name}</span>
                </div>
                <p className="text-[10px] text-zinc-400">{a.desc}</p>
                <p className="text-[9px] text-zinc-600 mt-1">{a.detail}</p>
              </div>
            ))}
          </div>
          {/* Connection diagram */}
          <div className="mt-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
            <pre className="text-[10px] text-zinc-500 font-mono leading-relaxed">
{`  You (Nexus Dashboard)
   │
   ├──→ /products ──→ "Spawn Agent" ──→ HUD hud_build()
   │                                      │
   │    ┌────────────────────────────────┘
   │    ▼
   │    Claude 2 (coder) ──→ builds in worktree
   │    │                      │
   │    │                      ▼
   │    │                    hud_ship() ──→ Codex reviews
   │    │                                    │
   │    │    ┌──────────────────────────────┘
   │    │    ▼
   │    │    PR merged ──→ auto-deploy ──→ n8n notifies Discord
   │    │                                    │
   │    └──→ Revenue tracked ◄──────────────┘
   │
   ├──→ /ideas ──→ Capture → Score → Validate → Promote to /products
   │
   ├──→ /today ──→ Daily tasks, costs, agent rankings
   │
   └──→ /ops ──→ Kanban, agent fleet, pipeline DAGs`}
            </pre>
          </div>
        </Section>

        {/* Products at a Glance */}
        <Section title="Products at a Glance" icon={<Package className="w-4 h-4 text-cyan-400" />} delay={0.2}>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
            <div className="divide-y divide-zinc-800/30">
              {PRODUCT_GUIDE.map(p => {
                const colorClass = `text-${p.color}-400`;
                return (
                  <div key={p.name} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start gap-3">
                      <span className={colorClass}>{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{p.name}</span>
                          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-zinc-700/50 text-zinc-500`}>
                            {p.tier}
                          </span>
                          <span className="text-[10px] text-zinc-600">{p.desc}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400">
                          <ArrowRight className="w-3 h-3 text-zinc-600" />
                          {p.action}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Quick Commands */}
        <Section title="Quick Commands" icon={<Terminal className="w-4 h-4 text-emerald-400" />} delay={0.25}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {QUICK_COMMANDS.map(section => (
              <div key={section.section} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
                <div className="px-3 py-2 border-b border-zinc-800/50">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{section.section}</span>
                </div>
                <div className="divide-y divide-zinc-800/30">
                  {section.items.map(item => (
                    <div key={item.desc} className="flex items-center gap-2 px-3 py-1.5">
                      <div className="flex items-center gap-1">
                        {item.keys.map((key, i) => (
                          <span key={i}>
                            <kbd className="px-1.5 py-0.5 text-[9px] bg-zinc-800 border border-zinc-700 rounded text-cyan-400 font-mono">
                              {key}
                            </kbd>
                            {i < item.keys.length - 1 && <span className="text-[9px] text-zinc-700 mx-0.5">+</span>}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-400 ml-auto">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Revenue Targets */}
        <Section title="6-Month Revenue Targets" icon={<DollarSign className="w-4 h-4 text-emerald-400" />} delay={0.3}>
          <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-xl p-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              {[
                { month: "Apr", total: "$3.5K" },
                { month: "May", total: "$7.2K" },
                { month: "Jun", total: "$9.9K" },
                { month: "Jul", total: "$14.9K" },
                { month: "Aug", total: "$23.6K" },
                { month: "Sep", total: "$32.3K" },
              ].map(m => (
                <div key={m.month} className="bg-zinc-800/30 rounded-lg p-3 text-center border border-zinc-700/30">
                  <span className="text-[10px] text-zinc-500 uppercase">{m.month}</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1">{m.total}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">6-month target</span>
              <p className="text-2xl font-bold text-emerald-400">$91K cumulative</p>
              <p className="text-xs text-zinc-500 mt-1">$32K/mo run rate = $387K/yr annualized</p>
            </div>
          </div>
        </Section>

        {/* Key Principles */}
        <Section title="Key Principles" icon={<Sparkles className="w-4 h-4 text-purple-400" />} delay={0.35}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { num: "01", text: "Cash first, product second", sub: "AI Ops consulting funds everything else" },
              { num: "02", text: "Ship MCPs immediately", sub: "5 servers built, 0 deployed. Every day is lost revenue" },
              { num: "03", text: "One vertical per product", sub: "Law firms for Voice. Agencies for Agents. Restaurants for AI Ops" },
              { num: "04", text: "Retainers > projects", sub: "Every $3.5K project should convert to a $1K/mo retainer" },
              { num: "05", text: "DealBrain = small biz buyers, NOT PE", sub: "Self-serve $199-499 reports, no SOC 2 needed" },
              { num: "06", text: "Prove before scaling", sub: "Get 5 paying customers before adding features" },
            ].map(p => (
              <div key={p.num} className="flex gap-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3">
                <span className="text-lg font-bold text-zinc-800">{p.num}</span>
                <div>
                  <p className="text-xs font-semibold text-white">{p.text}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center py-8 border-t border-zinc-800/50">
          <p className="text-[10px] text-zinc-700 uppercase tracking-widest">
            NEXUS — BuildKit Command Center — April 2026
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
