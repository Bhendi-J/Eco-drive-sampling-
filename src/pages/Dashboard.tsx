import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Award, Zap, Leaf } from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import EcoGauge from "@/components/EcoGauge";
import RecommendationBox from "@/components/RecommendationBox";

const radarData = [
  { metric: "RPM Stability", score: 82 },
  { metric: "Brake Discipline", score: 74 },
  { metric: "Smoothness", score: 91 },
  { metric: "Fuel Efficiency", score: 68 },
];

const trendData = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 75 },
  { day: "Wed", score: 68 },
  { day: "Thu", score: 81 },
  { day: "Fri", score: 85 },
  { day: "Sat", score: 79 },
  { day: "Sun", score: 88 },
];

const stats = [
  { label: "Average Score", value: "78.3", icon: TrendingUp, color: "text-primary" },
  { label: "Best Score", value: "94", icon: Award, color: "text-accent" },
  { label: "Improvement", value: "+12%", icon: Zap, color: "text-secondary" },
];

const recommendations = [
  { icon: "tip" as const, text: "Maintain steadier RPM during highway segments for +5% efficiency." },
  { icon: "trend" as const, text: "Your braking pattern improved 18% this week — keep it up!" },
  { icon: "safety" as const, text: "Try engine braking on descents to boost fuel efficiency by up to 8%." },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background arcade-grid p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Performance <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-sm text-muted-foreground font-body">Your eco-driving analytics at a glance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-accent" />
          <span className="font-display text-sm font-bold gradient-text-accent">EcoDrive Arena</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="neon-card flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="neon-card-purple neon-card"
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Skill Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 30%, 18%)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 11, fontFamily: "Exo 2" }}
                />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar
                  dataKey="score"
                  stroke="hsl(270, 80%, 65%)"
                  fill="hsl(270, 80%, 65%)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Line chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="neon-card lg:col-span-2"
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Eco Score Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid stroke="hsl(220, 30%, 14%)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 12, fontFamily: "Exo 2" }}
                  axisLine={{ stroke: "hsl(220, 30%, 18%)" }}
                />
                <YAxis
                  domain={[60, 100]}
                  tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 12, fontFamily: "Exo 2" }}
                  axisLine={{ stroke: "hsl(220, 30%, 18%)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 25%, 10%)",
                    border: "1px solid hsl(190, 100%, 50%, 0.3)",
                    borderRadius: "12px",
                    color: "hsl(200, 100%, 95%)",
                    fontFamily: "Exo 2",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(190, 100%, 50%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(190, 100%, 50%)", r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: "hsl(190, 100%, 50%)", stroke: "hsl(190, 100%, 50%)", strokeWidth: 3, strokeOpacity: 0.3 }}
                  style={{ filter: "drop-shadow(0 0 6px hsl(190, 100%, 50%, 0.4))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="neon-card-green neon-card flex flex-col items-center py-8"
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-6">Current Eco Rating</h3>
            <EcoGauge score={82} size={200} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <RecommendationBox recommendations={recommendations} title="AI Coach Insights" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
