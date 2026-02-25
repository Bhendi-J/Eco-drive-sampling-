import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import {
  type GameMode,
  type EnvironmentConfig,
  getEnvironmentConfig,
  BASE_CONSTANTS
} from "@/config/environments";

export type { GameMode };

// --- Game Constants ---
const LANE_POSITIONS = [-3, 0, 3];

// --- Game State Interface ---
export interface GameState {
  // Position & Movement
  lane: number;
  laneIndex: number;
  speed: number;
  mode: GameMode;

  // Resources
  fuel: number;
  ecoScore: number;
  status: string;

  // Game State
  gameOver: boolean;
  gameOverReason: "time" | "fuel" | null;
  gameDuration: number; // seconds
  timeRemaining: number; // seconds left
  obstacleSpawnInterval: number;
  obstacleSpeedMultiplier: number;

  // Environment
  environmentConfig: EnvironmentConfig;

  // Session Metrics (Cumulative)
  sessionMetrics: {
    totalRPMVariation: number;
    totalBrakingEvents: number;
    totalFuelConsumed: number;
    totalLaneSwitches: number;
    distanceTraveled: number;
  };

  // Current Interval Metrics (for API calls)
  intervalMetrics: {
    rpmVariation: number;
    brakingEvents: number;
    smoothness: number;
  };
}

// --- Game Actions Interface ---
export interface GameActions {
  switchLane: (direction: "left" | "right") => void;
  registerCollision: () => void;
  restartGame: () => void;
  updateGameState: (deltaTime: number) => void; // Called every frame
  setAcceleration: (value: number) => void;
  setBraking: (isBraking: boolean) => void;
}

// --- Session Summary ---
export interface SessionSummary {
  mode: GameMode;
  final_score: number;
  duration: number;
  fuel_remaining: number;
  collisions: number;
  total_rpm_variation: number;
  total_fuel_consumed: number;
  total_lane_switches: number;
  distance_traveled: number;
  player_name?: string;
}

// --- Hook Implementation ---
export function useGameState(initialMode: GameMode = "highway") {
  const [mode] = useState<GameMode>(initialMode);
  const envConfig = getEnvironmentConfig(mode);

  const [laneIndex, setLaneIndex] = useState(1); // center lane
  const [fuel, setFuel] = useState(100);
  const [ecoScore, setEcoScore] = useState(75);
  const [status, setStatus] = useState("Smooth Driving");
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<"time" | "fuel" | null>(null);
  const [speed, setSpeed] = useState(envConfig.minSpeed); // Start at min cruising speed
  const [timeRemaining, setTimeRemaining] = useState(BASE_CONSTANTS.GAME_DURATION);

  // Mutable refs for performance (avoid re-renders)
  const speedRef = useRef(envConfig.minSpeed); // Start at min cruising speed
  const minSpeedRef = useRef(envConfig.minSpeed);
  const maxSpeedRef = useRef(BASE_CONSTANTS.SPEED * envConfig.speedMultiplier);
  const accelerationRef = useRef(0);
  const isBrakingRef = useRef(false);
  const brakingDurationRef = useRef(0);

  const gameDurationRef = useRef(0);
  const apiTimerRef = useRef(0);
  const lastSwitchTimeRef = useRef(0);
  const gameOverRef = useRef(false);

  // Refs to keep current state values accessible without stale closures
  const ecoScoreRef = useRef(ecoScore);
  const fuelRef = useRef(fuel);

  // Session Metrics (cumulative)
  const sessionMetricsRef = useRef({
    totalRPMVariation: 0,
    totalBrakingEvents: 0,
    totalFuelConsumed: 0,
    totalLaneSwitches: 0,
    distanceTraveled: 0,
  });

  // Interval Metrics (reset after each API call)
  const intervalMetricsRef = useRef({
    rpmVariation: BASE_CONSTANTS.RPM_BASE,
    brakingEvents: 0,
    smoothness: 0.85,
  });

  // Session summary ref
  const sessionSummaryRef = useRef<SessionSummary | null>(null);

  // Sync refs with state
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);
  useEffect(() => {
    ecoScoreRef.current = ecoScore;
  }, [ecoScore]);
  useEffect(() => {
    fuelRef.current = fuel;
  }, [fuel]);

  // --- Lane Switching ---
  const switchLane = useCallback((direction: "left" | "right") => {
    if (gameOverRef.current) return;

    setLaneIndex((prev) => {
      const next = direction === "left" ? Math.max(0, prev - 1) : Math.min(2, prev + 1);

      if (next !== prev) {
        // Update metrics
        sessionMetricsRef.current.totalLaneSwitches += 1;

        // RPM spike on lane switch depends on speed
        const speedFactor = speedRef.current / maxSpeedRef.current;
        const rpmSpike = 100 + (speedFactor * 200);

        intervalMetricsRef.current.rpmVariation += rpmSpike;
        sessionMetricsRef.current.totalRPMVariation += rpmSpike;

        // Penalize rapid switching
        const now = Date.now();
        if (now - lastSwitchTimeRef.current < 500) {
          intervalMetricsRef.current.smoothness = Math.max(0, intervalMetricsRef.current.smoothness - 0.08);
        }
        lastSwitchTimeRef.current = now;
      }

      return next;
    });
  }, []);

  // --- Collision Handling ---
  const registerCollision = useCallback(() => {
    if (gameOverRef.current) return;

    intervalMetricsRef.current.brakingEvents += 1;
    sessionMetricsRef.current.totalBrakingEvents += 1;
    intervalMetricsRef.current.rpmVariation += 500; // Massive spike
    sessionMetricsRef.current.totalRPMVariation += 500;
    intervalMetricsRef.current.smoothness = Math.max(0, intervalMetricsRef.current.smoothness - 0.3);

    // Collision penalty: Sudden stop or massive slowdown
    speedRef.current = Math.max(0, speedRef.current * 0.3); // Lose 70% speed
    setEcoScore(prev => Math.max(0, prev - 10)); // Direct score hit

    // Visual feedback
    setStatus("COLLISION! Speed Lost");
  }, []);

  // --- External Controls (W/S) ---
  const setAcceleration = useCallback((value: number) => {
    accelerationRef.current = value;
  }, []);

  const setBraking = useCallback((isBraking: boolean) => {
    isBrakingRef.current = isBraking;
    if (!isBraking) {
      brakingDurationRef.current = 0; // Reset braking timer
    }
  }, []);

  // --- Main Game Update (called every frame) ---
  const updateGameState = useCallback((deltaTime: number) => {
    if (gameOverRef.current) return;

    // --- Physics & Speed Logic ---
    const ACCEL_RATE = 20.0;
    const BRAKE_RATE = 40.0;
    const FRICTION = 5.0;

    let currentSpeed = speedRef.current;

    // Apply Acceleration / Braking
    if (isBrakingRef.current) {
      currentSpeed -= BRAKE_RATE * deltaTime;
      brakingDurationRef.current += deltaTime;

      // Harsh Braking Detection (> 0.5s holding S)
      if (brakingDurationRef.current > 0.5) {
        // Only penalize once per "harsh event" threshold (e.g. every 0.1s after 0.5s)
        if (Math.floor(brakingDurationRef.current * 10) % 5 === 0) {
          intervalMetricsRef.current.rpmVariation += 50;
          intervalMetricsRef.current.smoothness = Math.max(0, intervalMetricsRef.current.smoothness - 0.05);
          setStatus("Warning: Harsh Braking!");
        }
      }
    } else if (accelerationRef.current > 0) {
      currentSpeed += ACCEL_RATE * deltaTime * accelerationRef.current;

      // RPM increases with heavy acceleration
      intervalMetricsRef.current.rpmVariation += 10 * accelerationRef.current;
    } else {
      // Coasting friction
      currentSpeed -= FRICTION * deltaTime;
    }

    // Clamp Speed — never drop below minimum cruising speed
    currentSpeed = Math.max(minSpeedRef.current, Math.min(currentSpeed, maxSpeedRef.current));
    speedRef.current = currentSpeed;
    setSpeed(currentSpeed); // Update UI state

    // --- End Physics ---

    // Update game duration
    gameDurationRef.current += deltaTime;

    // Update countdown timer
    const remaining = Math.max(0, BASE_CONSTANTS.GAME_DURATION - gameDurationRef.current);
    setTimeRemaining(remaining);
    if (remaining <= 0) {
      handleGameOver("time");
      return;
    }

    // Update distance traveled
    const distance = currentSpeed * deltaTime;
    sessionMetricsRef.current.distanceTraveled += distance;

    // Calculate realistic fuel consumption based on environment config
    const baseFuelRate = BASE_CONSTANTS.FUEL_CONSUMPTION_RATE;
    const fuelRate = baseFuelRate * envConfig.fuelDrainMultiplier;

    // Fuel depends on RPM (acceleration) and Speed
    const accelFactor = accelerationRef.current > 0 ? 1.5 : 1.0;
    const speedFactor = (currentSpeed / BASE_CONSTANTS.SPEED) * accelFactor;

    // Idle fuel consumption if stopped
    const actualFuelRate = currentSpeed === 0 ? fuelRate * 0.1 : fuelRate * speedFactor;

    const fuelConsumed = actualFuelRate * deltaTime;

    sessionMetricsRef.current.totalFuelConsumed += fuelConsumed;

    setFuel((prev) => {
      const next = Math.max(0, prev - fuelConsumed);
      if (next <= 0) {
        handleGameOver("fuel");
      }
      return next;
    });

    // Decay RPM and recover smoothness over time
    intervalMetricsRef.current.rpmVariation = Math.max(
      BASE_CONSTANTS.RPM_BASE,
      intervalMetricsRef.current.rpmVariation - BASE_CONSTANTS.RPM_DECAY_RATE * deltaTime
    );
    intervalMetricsRef.current.smoothness = Math.min(
      1,
      intervalMetricsRef.current.smoothness + BASE_CONSTANTS.SMOOTHNESS_RECOVERY_RATE * deltaTime
    );

    // API update timer
    apiTimerRef.current += deltaTime;
    if (apiTimerRef.current >= BASE_CONSTANTS.API_UPDATE_INTERVAL) {
      apiTimerRef.current = 0;
      updateEcoScore();
    }
  }, [envConfig]);

  // --- API Score Update ---
  const updateEcoScore = async () => {
    try {
      const data = await api.getEcoScore({
        rpm_var: intervalMetricsRef.current.rpmVariation,
        braking_hits: intervalMetricsRef.current.brakingEvents,
        fuel_usage: 10 - (fuel * 0.06), // Legacy compatibility
        smoothness_val: intervalMetricsRef.current.smoothness,
      });

      setEcoScore(data.eco_score);
      // Only update status if it's not a critical warning from client-side logic
      if (!status.includes("Warning") && !status.includes("COLLISION")) {
        setStatus(data.status);
      } else if (status.includes("Warning")) {
        // Clear warning after a bit if conditions improve, or let backend status take over
        setTimeout(() => setStatus(data.status), 1000);
      }

      // Reset interval metrics
      intervalMetricsRef.current.brakingEvents = 0;
    } catch (error) {
      // Backend unavailable - keep last score
      console.warn("Failed to update eco score:", error);
    }
  };

  // --- Game Over Handler ---
  const handleGameOver = useCallback((reason: "time" | "fuel" = "fuel") => {
    if (gameOverRef.current) return;

    setGameOver(true);
    setGameOverReason(reason);
    gameOverRef.current = true;

    // Create session summary — use refs for the latest values
    const summary: SessionSummary = {
      mode,
      final_score: ecoScoreRef.current,
      duration: Math.floor(gameDurationRef.current),
      fuel_remaining: fuelRef.current,
      collisions: sessionMetricsRef.current.totalBrakingEvents,
      total_rpm_variation: sessionMetricsRef.current.totalRPMVariation,
      total_fuel_consumed: sessionMetricsRef.current.totalFuelConsumed,
      total_lane_switches: sessionMetricsRef.current.totalLaneSwitches,
      distance_traveled: Math.floor(sessionMetricsRef.current.distanceTraveled),
    };

    sessionSummaryRef.current = summary;

    // Save to backend
    api.saveSession(summary).catch((error) => {
      console.warn("Failed to save session:", error);
    });
  }, [mode]);

  // --- Restart Game ---
  const restartGame = useCallback(() => {
    setLaneIndex(1);
    setFuel(100);
    setEcoScore(75);
    setStatus("Smooth Driving");
    setGameOver(false);
    setGameOverReason(null);
    setSpeed(envConfig.minSpeed);
    setTimeRemaining(BASE_CONSTANTS.GAME_DURATION);

    speedRef.current = envConfig.minSpeed;
    gameDurationRef.current = 0;
    apiTimerRef.current = 0;
    lastSwitchTimeRef.current = 0;
    gameOverRef.current = false;

    sessionMetricsRef.current = {
      totalRPMVariation: 0,
      totalBrakingEvents: 0,
      totalFuelConsumed: 0,
      totalLaneSwitches: 0,
      distanceTraveled: 0,
    };

    intervalMetricsRef.current = {
      rpmVariation: BASE_CONSTANTS.RPM_BASE,
      brakingEvents: 0,
      smoothness: 0.85,
    };

    sessionSummaryRef.current = null;
  }, [envConfig]);

  // --- Build State Object ---
  const state: GameState = {
    lane: LANE_POSITIONS[laneIndex],
    laneIndex,
    speed: speedRef.current,
    mode,
    fuel,
    ecoScore,
    status,
    gameOver,
    gameOverReason,
    gameDuration: gameDurationRef.current,
    timeRemaining,
    obstacleSpawnInterval: envConfig.obstacleSpawnRate,
    obstacleSpeedMultiplier: envConfig.obstacleSpeedMultiplier,
    environmentConfig: envConfig,
    sessionMetrics: sessionMetricsRef.current,
    intervalMetrics: intervalMetricsRef.current,
  };

  const actions: GameActions = {
    switchLane,
    registerCollision,
    restartGame,
    updateGameState,
    setAcceleration, // New Action
    setBraking,      // New Action
  };

  return {
    state,
    actions,
    sessionSummary: sessionSummaryRef.current,
  };
}
