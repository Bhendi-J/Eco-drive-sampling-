import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Gamepad2, BarChart3, Zap, Leaf } from "lucide-react";
import heroCar from "@/assets/hero-car.png";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background arcade-grid relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/3 blur-[150px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display text-lg font-bold gradient-text">EcoDrive Arena</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/console")}
            className="text-sm font-body text-muted-foreground hover:text-primary transition-colors"
          >
            Console
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm font-body text-muted-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-8 pt-12 pb-20 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-display font-semibold bg-accent/10 text-accent border border-accent/20 mb-8 uppercase tracking-widest">
            🌿 Eco Racing Reimagined
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-black mb-4 leading-tight"
        >
          <span className="gradient-text">EcoDrive</span>{" "}
          <span className="text-foreground">Arena</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl font-body text-muted-foreground mb-10"
        >
          Drive Smart. <span className="neon-text-green text-accent">Score Green.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/console")}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-bold text-sm bg-primary text-primary-foreground shadow-[0_0_30px_hsl(190_100%_50%/0.3)] hover:shadow-[0_0_50px_hsl(190_100%_50%/0.5)] transition-all duration-300"
          >
            <Gamepad2 className="w-5 h-5" />
            Enter Game Console
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-bold text-sm border border-secondary/40 text-secondary hover:bg-secondary/10 shadow-[0_0_20px_hsl(270_80%_65%/0.15)] hover:shadow-[0_0_30px_hsl(270_80%_65%/0.3)] transition-all duration-300"
          >
            <BarChart3 className="w-5 h-5" />
            View Dashboard
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="animate-float"
        >
          <img src={heroCar} alt="EcoDrive Car" className="w-full max-w-lg mx-auto drop-shadow-[0_0_40px_hsl(190_100%_50%/0.3)]" />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid grid-cols-3 gap-8 mt-16"
        >
          {[
            { label: "Active Racers", value: "12.4K", icon: Zap },
            { label: "Eco Points Earned", value: "3.2M", icon: Leaf },
            { label: "Avg Eco Score", value: "82.5", icon: BarChart3 },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="font-display text-2xl font-bold text-foreground neon-text">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;
