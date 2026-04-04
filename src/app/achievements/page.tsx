"use client";

import { useState, useEffect } from "react";

import {
  Trophy,
  Rocket,
  Star,
  Crown,
  Monitor,
  Timer,
  Shield,
  Wrench,
  Zap,
  Factory,
  Coins,
  DollarSign,
  Gem,
  Layers,
  Briefcase,
  Sparkles,
  Lock,
} from "lucide-react";
import { getAllAchievements, getUnlockedCount } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";

const ICON_MAP: Record<string, React.ReactNode> = {
  rocket: <Rocket className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
  trophy: <Trophy className="w-6 h-6" />,
  monitor: <Monitor className="w-6 h-6" />,
  timer: <Timer className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  wrench: <Wrench className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
  factory: <Factory className="w-6 h-6" />,
  coins: <Coins className="w-6 h-6" />,
  dollar: <DollarSign className="w-6 h-6" />,
  gem: <Gem className="w-6 h-6" />,
  layers: <Layers className="w-6 h-6" />,
  briefcase: <Briefcase className="w-6 h-6" />,
  sparkles: <Sparkles className="w-6 h-6" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  missions: "Missions",
  sessions: "Sessions",
  cost: "Spending",
  tools: "Tool Usage",
  milestones: "Milestones",
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<
    (Achievement & { unlocked: boolean })[]
  >([]);
  const [counts, setCounts] = useState({ unlocked: 0, total: 0 });

  useEffect(() => {
    setAchievements(getAllAchievements());
    setCounts(getUnlockedCount());
  }, []);

  const categories = Array.from(
    new Set(achievements.map((a) => a.category))
  );

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <header
          className="flex items-center gap-4"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Achievements</h1>
            <p className="text-xs text-zinc-600 uppercase tracking-widest">
              {counts.unlocked}/{counts.total} unlocked
            </p>
          </div>
        </header>

        {/* Progress bar */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Overall Progress</span>
            <span className="text-xs text-amber-400">
              {counts.total > 0
                ? Math.round((counts.unlocked / counts.total) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              style={{
                width: `${counts.total > 0 ? (counts.unlocked / counts.total) * 100 : 0}%`,
              }}
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-1000"
            />
          </div>
        </div>

        {/* Achievement grid by category */}
        {categories.map((category) => {
          const catAchievements = achievements.filter(
            (a) => a.category === category
          );

          return (
            <section
              key={category}
            >
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[category] || category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catAchievements.map((achievement, i) => (
                  <div
                    key={achievement.id}
                    className={`border rounded-xl p-4 transition-colors ${
                      achievement.unlocked
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-zinc-900/30 border-zinc-800/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          achievement.unlocked
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-zinc-800 text-zinc-600"
                        }`}
                      >
                        {achievement.unlocked ? (
                          ICON_MAP[achievement.icon] || (
                            <Trophy className="w-6 h-6" />
                          )
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`text-sm font-semibold ${
                            achievement.unlocked
                              ? "text-white"
                              : "text-zinc-500"
                          }`}
                        >
                          {achievement.title}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && achievement.unlocked_at && (
                          <p className="text-[10px] text-amber-400/50 mt-1">
                            Unlocked{" "}
                            {new Date(
                              achievement.unlocked_at
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
