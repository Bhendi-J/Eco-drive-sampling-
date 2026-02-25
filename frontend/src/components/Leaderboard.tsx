import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

const filters = ["Global", "Highway", "City", "Jungle"];

const mockPlayers = [
  { rank: 1, name: "EcoRacer_X", score: 97, env: "Highway", avatar: "🏎️" },
  { rank: 2, name: "GreenDrift", score: 94, env: "City", avatar: "🌿" },
  { rank: 3, name: "SmoothOp", score: 91, env: "Jungle", avatar: "⚡" },
  { rank: 4, name: "FuelSaver", score: 88, env: "Highway", avatar: "🔋" },
  { rank: 5, name: "BrakeKing", score: 85, env: "City", avatar: "🎯" },
  { rank: 6, name: "NitroEco", score: 82, env: "Jungle", avatar: "🌍" },
  { rank: 7, name: "DriftLord", score: 79, env: "Highway", avatar: "💨" },
  { rank: 8, name: "CleanRun", score: 76, env: "City", avatar: "🏁" },
];

const medalStyles = [
  { icon: Trophy, color: "text-neon-yellow", glow: "0 0 12px hsl(45 100% 60% / 0.5)", bg: "bg-neon-yellow/10" },
  { icon: Medal, color: "text-muted-foreground", glow: "0 0 12px hsl(220 15% 55% / 0.3)", bg: "bg-muted/30" },
  { icon: Award, color: "text-neon-orange", glow: "0 0 12px hsl(25 100% 55% / 0.5)", bg: "bg-neon-orange/10" },
];

const Leaderboard = () => {
  const [active, setActive] = useState("Global");

  const filtered = active === "Global"
    ? mockPlayers
    : mockPlayers.filter((p) => p.env === active);

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`px-4 py-2 rounded-xl font-display text-xs font-semibold transition-all duration-300 border ${
              active === f
                ? "bg-primary/15 text-primary border-primary/40 shadow-[0_0_15px_hsl(190_100%_50%/0.2)]"
                : "bg-muted/30 text-muted-foreground border-border hover:border-primary/30"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((player, i) => {
          const medal = player.rank <= 3 ? medalStyles[player.rank - 1] : null;
          return (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:border-primary/30 ${
                medal ? `${medal.bg} border-border/50` : "bg-muted/20 border-border/30"
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50">
                {medal ? (
                  <medal.icon className={`w-5 h-5 ${medal.color}`} style={{ filter: `drop-shadow(${medal.glow})` }} />
                ) : (
                  <span className="text-sm font-display font-bold text-muted-foreground">#{player.rank}</span>
                )}
              </div>
              <span className="text-2xl">{player.avatar}</span>
              <div className="flex-1">
                <p className="font-display font-semibold text-foreground text-sm">{player.name}</p>
                <p className="text-xs text-muted-foreground">{player.env}</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-lg text-primary neon-text">{player.score}</p>
                <p className="text-xs text-muted-foreground">Eco Score</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
