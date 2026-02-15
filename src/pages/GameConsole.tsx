import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Trophy, Brain, ArrowLeft, Leaf } from "lucide-react";
import EnvironmentCard from "@/components/EnvironmentCard";
import Leaderboard from "@/components/Leaderboard";
import MLTester from "@/components/MLTester";

import highwayImg from "@/assets/highway-env.jpg";
import cityImg from "@/assets/city-env.jpg";
import jungleImg from "@/assets/jungle-env.jpg";

const tabs = [
  { id: "play", label: "Play Game", icon: Gamepad2 },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "ml", label: "Test ML Model", icon: Brain },
];

const environments = [
  {
    name: "Highway",
    difficulty: "Easy" as const,
    description: "Cruise through calm highways with smooth roads and clear skies.",
    image: highwayImg,
    glowClass: "",
    accentColor: "hsl(190, 100%, 50%)",
  },
  {
    name: "City",
    difficulty: "Medium" as const,
    description: "Navigate busy urban streets, traffic lights, and intersections.",
    image: cityImg,
    glowClass: "neon-card-purple",
    accentColor: "hsl(45, 100%, 60%)",
  },
  {
    name: "Jungle",
    difficulty: "Hard" as const,
    description: "Tackle foggy jungle paths with sharp turns and wild terrain.",
    image: jungleImg,
    glowClass: "neon-card-green",
    accentColor: "hsl(150, 100%, 55%)",
  },
];

const GameConsole = () => {
  const [activeTab, setActiveTab] = useState("play");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background arcade-grid">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-20 lg:w-64 bg-card/50 border-r border-border flex flex-col py-6 shrink-0">
          <div className="flex items-center gap-3 px-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-sm font-bold gradient-text hidden lg:block">EcoDrive</span>
          </div>

          <nav className="flex-1 space-y-2 px-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary/15 text-primary shadow-[0_0_15px_hsl(190_100%_50%/0.15)] border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
                }`}
              >
                <tab.icon className="w-5 h-5 shrink-0" />
                <span className="font-display text-xs font-semibold hidden lg:block">{tab.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" />
            <span className="text-xs font-body hidden lg:block">Back Home</span>
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === "play" && (
              <motion.div
                key="play"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Choose Your <span className="gradient-text">Environment</span>
                </h2>
                <p className="text-muted-foreground font-body mb-8">
                  Select a terrain and prove your eco-driving skills.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {environments.map((env) => (
                    <EnvironmentCard key={env.name} {...env} />
                  ))}
                </div>
              </motion.div>
            )}
            {activeTab === "leaderboard" && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  <span className="gradient-text">Leaderboard</span>
                </h2>
                <p className="text-muted-foreground font-body mb-8">
                  Top eco-racers ranked by driving efficiency.
                </p>
                <Leaderboard />
              </motion.div>
            )}
            {activeTab === "ml" && (
              <motion.div
                key="ml"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Test <span className="gradient-text">ML Model</span>
                </h2>
                <p className="text-muted-foreground font-body mb-8">
                  Predict your eco score with our AI-powered model.
                </p>
                <MLTester />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default GameConsole;
