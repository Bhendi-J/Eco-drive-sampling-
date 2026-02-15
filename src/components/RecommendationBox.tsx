import { motion } from "framer-motion";
import { Bot, Lightbulb, TrendingUp, Shield } from "lucide-react";

interface Recommendation {
  icon: "tip" | "trend" | "safety";
  text: string;
}

interface RecommendationBoxProps {
  recommendations: Recommendation[];
  title?: string;
}

const iconMap = {
  tip: Lightbulb,
  trend: TrendingUp,
  safety: Shield,
};

const RecommendationBox = ({ recommendations, title = "AI Recommendations" }: RecommendationBoxProps) => {
  return (
    <div className="neon-card-purple neon-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-secondary" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const Icon = iconMap[rec.icon];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/50"
            >
              <Icon className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">{rec.text}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationBox;
