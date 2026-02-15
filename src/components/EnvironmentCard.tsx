import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface EnvironmentCardProps {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  image: string;
  glowClass: string;
  accentColor: string;
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-neon-blue/20 text-neon-blue border-neon-blue/30",
  Medium: "bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30",
  Hard: "bg-neon-green/20 text-neon-green border-neon-green/30",
};

const EnvironmentCard = ({ name, difficulty, description, image, glowClass, accentColor }: EnvironmentCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`neon-card ${glowClass} cursor-pointer group`}
    >
      <div className="relative overflow-hidden rounded-xl mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <span
          className={`absolute top-3 right-3 text-xs font-display font-semibold px-3 py-1 rounded-full border ${difficultyColors[difficulty]}`}
        >
          {difficulty}
        </span>
      </div>
      <h3 className="font-display text-xl font-bold text-foreground mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <button
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-300 border"
        style={{
          borderColor: accentColor,
          color: accentColor,
          boxShadow: `0 0 15px ${accentColor}33`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${accentColor}15`;
          e.currentTarget.style.boxShadow = `0 0 25px ${accentColor}55`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.boxShadow = `0 0 15px ${accentColor}33`;
        }}
      >
        <Play className="w-4 h-4" />
        Start Race
      </button>
    </motion.div>
  );
};

export default EnvironmentCard;
