// Environment Configuration for EcoDrive Arena

export type GameMode = "highway" | "city" | "jungle";

export interface EnvironmentConfig {
    // Gameplay
    obstacleSpawnRate: number; // seconds between spawns
    obstacleSpeedMultiplier: number; // multiplier for obstacle speed
    fuelDrainMultiplier: number; // multiplier for fuel consumption
    speedMultiplier: number; // base speed multiplier
    minSpeed: number; // minimum cruising speed (units/sec)

    // Visuals
    fogDensity: {
        near: number;
        far: number;
        color: string;
    };
    trafficDensity: number; // 0-1, affects number of obstacles

    // Theme
    roadColor: string;
    lineColor: string;
    ambientLightIntensity: number;
    backgroundColor: string;
    skyColor: string;
    groundColor: string;

    // Difficulty
    difficultyLevel: "easy" | "medium" | "hard";

    // Display
    displayName: string;
    icon: string;
    description: string;
}

export const ENVIRONMENT_CONFIG: Record<GameMode, EnvironmentConfig> = {
    highway: {
        // Gameplay
        obstacleSpawnRate: 5.0,
        obstacleSpeedMultiplier: 1.0,
        fuelDrainMultiplier: 0.6,
        speedMultiplier: 1.5,
        minSpeed: 8,

        // Visuals
        fogDensity: {
            near: 25,
            far: 80,
            color: "#0a0a1a",
        },
        trafficDensity: 0.3,

        // Theme
        roadColor: "#1a1a2e",
        lineColor: "#ffdd00",
        ambientLightIntensity: 0.3,
        backgroundColor: "#0a0a1a",
        skyColor: "#070b1a",
        groundColor: "#111122",

        // Difficulty
        difficultyLevel: "easy",

        // Display
        displayName: "Highway",
        icon: "🛣️",
        description: "Long stretches, fuel efficient, light traffic",
    },

    city: {
        // Gameplay
        obstacleSpawnRate: 1.5,
        obstacleSpeedMultiplier: 0.8,
        fuelDrainMultiplier: 1.2,
        speedMultiplier: 1.2,
        minSpeed: 6,

        // Visuals
        fogDensity: {
            near: 20,
            far: 60,
            color: "#1a1a28",
        },
        trafficDensity: 0.7,

        // Theme
        roadColor: "#252535",
        lineColor: "#ffffff",
        ambientLightIntensity: 0.4,
        backgroundColor: "#1a1a28",
        skyColor: "#14142a",
        groundColor: "#1c1c30",

        // Difficulty
        difficultyLevel: "medium",

        // Display
        displayName: "City",
        icon: "🏙️",
        description: "Heavy traffic, frequent stops, moderate fuel consumption",
    },

    jungle: {
        // Gameplay
        obstacleSpawnRate: 2.5,
        obstacleSpeedMultiplier: 1.2,
        fuelDrainMultiplier: 1.5,
        speedMultiplier: 1.0,
        minSpeed: 5,

        // Visuals
        fogDensity: {
            near: 10,
            far: 40,
            color: "#0d1a0d",
        },
        trafficDensity: 0.5,

        // Theme
        roadColor: "#1a2a1a",
        lineColor: "#88cc44",
        ambientLightIntensity: 0.25,
        backgroundColor: "#0d1a0d",
        skyColor: "#081a08",
        groundColor: "#0f250f",

        // Difficulty
        difficultyLevel: "hard",

        // Display
        displayName: "Jungle",
        icon: "🌴",
        description: "Dense vegetation, poor visibility, challenging terrain",
    },
};

// Helper function to get environment config
export function getEnvironmentConfig(mode: GameMode): EnvironmentConfig {
    return ENVIRONMENT_CONFIG[mode];
}

// Base constants (used with multipliers)
export const BASE_CONSTANTS = {
    SPEED: 12, // units/sec
    FUEL_CONSUMPTION_RATE: 0.3, // per second
    OBSTACLE_BASE_SPEED: 15, // units/sec
    RPM_BASE: 1500,
    RPM_DECAY_RATE: 50, // per second
    SMOOTHNESS_RECOVERY_RATE: 0.02, // per second
    API_UPDATE_INTERVAL: 2.0, // seconds
    GAME_DURATION: 60, // seconds — 1 minute timer
};
