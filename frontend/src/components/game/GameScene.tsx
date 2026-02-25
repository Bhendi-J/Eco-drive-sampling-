import { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import Car from "./Car";
import Road from "./Road";
import Obstacle from "./Obstacle";
import type { GameState, GameActions } from "@/hooks/useGameState";

const LANE_POSITIONS = [-3, 0, 3];

interface GameSceneProps {
    state: GameState;
    actions: GameActions;
}

interface ObstacleEntry {
    id: number;
    lane: number;
}

let obstacleIdCounter = 0;

// --- Environment Background ---
function EnvironmentBackground({ config }: { config: GameState["environmentConfig"] }) {
    const isJungle = config.displayName === "Jungle";
    const isCity = config.displayName === "City";

    return (
        <group>
            {/* Sky dome */}
            <mesh>
                <sphereGeometry args={[100, 32, 32]} />
                <meshBasicMaterial color={config.skyColor} side={2 /* DoubleSide */} />
            </mesh>

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, -30]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color={config.groundColor} roughness={1} />
            </mesh>

            {/* --- City: buildings on both sides --- */}
            {isCity && (
                <group>
                    {Array.from({ length: 12 }).map((_, i) => {
                        const side = i % 2 === 0 ? -1 : 1;
                        const x = side * (9 + Math.random() * 3);
                        const z = -10 - i * 8;
                        const h = 3 + Math.random() * 8;
                        const w = 1.5 + Math.random() * 2;
                        return (
                            <group key={`bldg-${i}`}>
                                <mesh position={[x, h / 2, z]} castShadow>
                                    <boxGeometry args={[w, h, w]} />
                                    <meshStandardMaterial
                                        color={i % 3 === 0 ? "#1e1e3a" : i % 3 === 1 ? "#252545" : "#2a2a4a"}
                                        roughness={0.8}
                                    />
                                </mesh>
                                {/* Lit windows */}
                                {Array.from({ length: Math.floor(h / 1.5) }).map((_, wi) => (
                                    <mesh key={`win-${i}-${wi}`} position={[x + (side * w * 0.45), 1 + wi * 1.5, z]}>
                                        <boxGeometry args={[0.05, 0.4, 0.4]} />
                                        <meshStandardMaterial
                                            emissive={wi % 3 === 0 ? "#ffdd44" : "#88aaff"}
                                            emissiveIntensity={0.8 + Math.random() * 0.5}
                                            color="#000"
                                        />
                                    </mesh>
                                ))}
                            </group>
                        );
                    })}
                    {/* Streetlights */}
                    {[-7.5, 7.5].map((x, si) =>
                        Array.from({ length: 5 }).map((_, li) => (
                            <group key={`sl-${si}-${li}`}>
                                <mesh position={[x, 2.5, -5 - li * 15]}>
                                    <cylinderGeometry args={[0.06, 0.06, 5, 6]} />
                                    <meshStandardMaterial color="#333" />
                                </mesh>
                                <mesh position={[x, 5.2, -5 - li * 15]}>
                                    <sphereGeometry args={[0.15, 8, 8]} />
                                    <meshStandardMaterial emissive="#ffcc66" emissiveIntensity={2} color="#ffcc66" />
                                </mesh>
                                <pointLight position={[x, 5, -5 - li * 15]} intensity={0.3} distance={10} color="#ffcc66" />
                            </group>
                        ))
                    )}
                </group>
            )}

            {/* --- Jungle: dense trees, vines, boulders --- */}
            {isJungle && (
                <group>
                    {/* Dense canopy trees both sides */}
                    {Array.from({ length: 16 }).map((_, i) => {
                        const side = i % 2 === 0 ? -1 : 1;
                        const x = side * (8 + Math.random() * 4);
                        const z = -5 - i * 6;
                        const trunkH = 3 + Math.random() * 3;
                        return (
                            <group key={`jt-${i}`} position={[x, 0, z]}>
                                {/* Trunk */}
                                <mesh position={[0, trunkH / 2, 0]}>
                                    <cylinderGeometry args={[0.25, 0.35, trunkH, 8]} />
                                    <meshStandardMaterial color="#3d2817" roughness={0.9} />
                                </mesh>
                                {/* Canopy */}
                                <mesh position={[0, trunkH + 1, 0]}>
                                    <sphereGeometry args={[1.5 + Math.random(), 8, 8]} />
                                    <meshStandardMaterial color={i % 2 === 0 ? "#1a4d0f" : "#2d6b1a"} roughness={0.7} />
                                </mesh>
                            </group>
                        );
                    })}
                    {/* Boulders */}
                    {Array.from({ length: 6 }).map((_, i) => {
                        const side = i % 2 === 0 ? -1 : 1;
                        return (
                            <mesh key={`boulder-${i}`} position={[side * (7 + Math.random() * 2), 0.4, -8 - i * 12]}>
                                <dodecahedronGeometry args={[0.6 + Math.random() * 0.5, 0]} />
                                <meshStandardMaterial color="#3a3a2a" roughness={0.95} />
                            </mesh>
                        );
                    })}
                </group>
            )}

            {/* --- Highway: open terrain with barriers and signs --- */}
            {!isCity && !isJungle && (
                <group>
                    {/* Highway barriers */}
                    {[-6.5, 6.5].map((x, bi) => (
                        <mesh key={`barrier-${bi}`} position={[x, 0.3, -30]}>
                            <boxGeometry args={[0.15, 0.6, 100]} />
                            <meshStandardMaterial color="#333344" metalness={0.5} roughness={0.5} />
                        </mesh>
                    ))}
                    {/* Distant hills */}
                    {[-25, 25, -35, 35].map((x, hi) => (
                        <mesh key={`hill-${hi}`} position={[x, -2, -50]} rotation={[-0.1, 0, 0]}>
                            <sphereGeometry args={[12 + hi * 2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                            <meshStandardMaterial color="#0e0e22" roughness={1} />
                        </mesh>
                    ))}
                    {/* Road signs */}
                    {Array.from({ length: 3 }).map((_, i) => (
                        <group key={`sign-${i}`} position={[7.5, 0, -15 - i * 25]}>
                            <mesh position={[0, 2, 0]}>
                                <cylinderGeometry args={[0.04, 0.04, 4, 6]} />
                                <meshStandardMaterial color="#555" />
                            </mesh>
                            <mesh position={[0, 3.8, 0]}>
                                <boxGeometry args={[1.2, 0.8, 0.05]} />
                                <meshStandardMaterial color="#1a5c1a" roughness={0.5} />
                            </mesh>
                        </group>
                    ))}
                </group>
            )}
        </group>
    );
}

export default function GameScene({ state, actions }: GameSceneProps) {
    const [obstacles, setObstacles] = useState<ObstacleEntry[]>([]);
    const spawnTimer = useRef(0);

    // Update game state and spawn obstacles
    useFrame((_, delta) => {
        if (state.gameOver) return;

        // Update game engine state
        actions.updateGameState(delta);

        // Spawn obstacles
        spawnTimer.current += delta;
        if (spawnTimer.current >= state.obstacleSpawnInterval) {
            spawnTimer.current = 0;
            const lane =
                LANE_POSITIONS[Math.floor(Math.random() * LANE_POSITIONS.length)];
            const id = obstacleIdCounter++;
            setObstacles((prev) => [...prev, { id, lane }]);
        }
    });

    const handleCollision = useCallback(() => {
        actions.registerCollision();
    }, [actions]);

    const handleRemove = useCallback((id: number) => {
        setObstacles((prev) => prev.filter((o) => o.id !== id));
    }, []);

    return (
        <>
            {/* Environment Background */}
            <EnvironmentBackground config={state.environmentConfig} />

            {/* Lighting - environment aware */}
            <ambientLight intensity={state.environmentConfig.ambientLightIntensity} />
            <directionalLight
                position={[5, 10, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
            <pointLight position={[0, 8, -10]} intensity={0.5} color="#4488ff" />

            {/* Fog - environment aware */}
            <fog
                attach="fog"
                args={[
                    state.environmentConfig.fogDensity.color,
                    state.environmentConfig.fogDensity.near,
                    state.environmentConfig.fogDensity.far
                ]}
            />

            {/* Road */}
            <Road config={state.environmentConfig} currentSpeed={state.speed} />

            {/* Player Car */}
            <Car
                lane={state.lane}
                onSwitchLane={actions.switchLane}
                onAccelerate={actions.setAcceleration}
                onBrake={actions.setBraking}
                gameOver={state.gameOver}
            />

            {/* Obstacles */}
            {obstacles.map((obs) => (
                <Obstacle
                    key={obs.id}
                    lane={obs.lane}
                    playerLane={state.lane}
                    currentSpeed={state.speed}
                    speedMultiplier={state.obstacleSpeedMultiplier}
                    onCollision={handleCollision}
                    onRemove={() => handleRemove(obs.id)}
                />
            ))}
        </>
    );
}
