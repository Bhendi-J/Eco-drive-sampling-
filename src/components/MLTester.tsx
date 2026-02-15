import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Zap } from "lucide-react";
import EcoGauge from "./EcoGauge";
import RecommendationBox from "./RecommendationBox";

const MLTester = () => {
  const [inputs, setInputs] = useState({
    rpmVariation: "",
    harshBraking: "",
    smoothness: "",
    fuelUsage: "",
  });
  const [predicted, setPredicted] = useState(false);
  const [score, setScore] = useState(0);

  const handlePredict = () => {
    const rpm = parseFloat(inputs.rpmVariation) || 50;
    const braking = parseFloat(inputs.harshBraking) || 3;
    const smooth = parseFloat(inputs.smoothness) || 70;
    const fuel = parseFloat(inputs.fuelUsage) || 8;
    const calc = Math.min(100, Math.max(0, Math.round(
      smooth * 0.4 + (100 - rpm) * 0.25 + (10 - braking) * 5 * 0.2 + (15 - fuel) * 3 * 0.15
    )));
    setScore(calc);
    setPredicted(true);
  };

  const fields = [
    { key: "rpmVariation", label: "RPM Variation", placeholder: "e.g. 45" },
    { key: "harshBraking", label: "Harsh Braking Count", placeholder: "e.g. 3" },
    { key: "smoothness", label: "Smoothness (%)", placeholder: "e.g. 78" },
    { key: "fuelUsage", label: "Fuel Usage (L/100km)", placeholder: "e.g. 7.2" },
  ] as const;

  const recommendations = [
    { icon: "tip" as const, text: "Reduce RPM variation by maintaining steady acceleration in each gear." },
    { icon: "trend" as const, text: "Your smoothness score can improve by 12% with gradual braking." },
    { icon: "safety" as const, text: "Anticipate traffic flow to reduce harsh braking incidents." },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="neon-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">ML Eco Predictor</h3>
              <p className="text-xs text-muted-foreground">Enter driving metrics to predict your eco score</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-display font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  {f.label}
                </label>
                <input
                  type="number"
                  placeholder={f.placeholder}
                  value={inputs[f.key]}
                  onChange={(e) => setInputs((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_hsl(190_100%_50%/0.15)] transition-all"
                />
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePredict}
            className="w-full py-3.5 rounded-xl font-display font-semibold text-sm bg-primary text-primary-foreground shadow-[0_0_20px_hsl(190_100%_50%/0.3)] hover:shadow-[0_0_30px_hsl(190_100%_50%/0.5)] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Predict Eco Score
          </motion.button>
        </div>
        {predicted && <RecommendationBox recommendations={recommendations} />}
      </div>
      <div className="flex items-center justify-center">
        {predicted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="neon-card flex flex-col items-center py-10"
          >
            <EcoGauge score={score} size={220} />
            <p className="mt-4 text-sm text-muted-foreground text-center max-w-xs">
              Based on your driving metrics, the ML model predicts your eco-efficiency rating.
            </p>
          </motion.div>
        ) : (
          <div className="neon-card flex flex-col items-center py-16 text-center">
            <Brain className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-display text-sm">
              Enter metrics & predict to see your eco score
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MLTester;
