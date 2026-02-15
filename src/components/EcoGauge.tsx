import { motion } from "framer-motion";

interface EcoGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
}

const EcoGauge = ({ score, maxScore = 100, size = 200 }: EcoGaugeProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / maxScore) * circumference;
  const offset = circumference - progress;

  const getColor = () => {
    if (score >= 80) return "hsl(150, 100%, 55%)";
    if (score >= 50) return "hsl(45, 100%, 60%)";
    return "hsl(0, 84%, 60%)";
  };

  const getLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Work";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="hsl(220, 25%, 14%)"
            strokeWidth="8"
          />
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${getColor()})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-display font-bold"
            style={{ color: getColor(), textShadow: `0 0 15px ${getColor()}` }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground font-body uppercase tracking-widest">
            Eco Score
          </span>
        </div>
      </div>
      <span
        className="text-sm font-display font-semibold tracking-wider uppercase"
        style={{ color: getColor() }}
      >
        {getLabel()}
      </span>
    </div>
  );
};

export default EcoGauge;
