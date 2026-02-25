import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EnvironmentConfig } from "@/config/environments";

interface RoadProps {
    config: EnvironmentConfig;
    currentSpeed: number;
}

function LaneStripe({ x, color, currentSpeed }: { x: number; color: string; currentSpeed: number }) {
    const groupRef = useRef<THREE.Group>(null!);
    const stripeCount = 20;
    const gap = 4;

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        // Move stripes towards camera at car speed
        groupRef.current.position.z += delta * currentSpeed;
        if (groupRef.current.position.z > gap) {
            groupRef.current.position.z -= gap;
        }
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: stripeCount }).map((_, i) => (
                <mesh key={i} position={[x, 0.01, -i * gap]} receiveShadow>
                    <boxGeometry args={[0.12, 0.01, 1.5]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
                </mesh>
            ))}
        </group>
    );
}

// Jungle tree component
function JungleTree({ position, currentSpeed }: { position: [number, number, number]; currentSpeed: number }) {
    const groupRef = useRef<THREE.Group>(null!);
    const initialZ = position[2];
    const resetZ = 20; // When to reset to back
    const startZ = -60; // Where to reappear

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        groupRef.current.position.z += delta * currentSpeed;

        // Loop trees
        if (groupRef.current.position.z > resetZ) {
            groupRef.current.position.z = startZ + (Math.random() * 10);
        }
    });

    return (
        <group ref={groupRef} position={[position[0], position[1], initialZ]}>
            {/* Trunk */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
                <meshStandardMaterial color="#3d2817" roughness={0.9} />
            </mesh>
            {/* Leaves */}
            <mesh position={[0, 3.5, 0]}>
                <sphereGeometry args={[1.2, 8, 8]} />
                <meshStandardMaterial color="#2d5016" roughness={0.7} />
            </mesh>
            <mesh position={[0, 4.2, 0]}>
                <coneGeometry args={[1.5, 2, 8]} />
                <meshStandardMaterial color="#3d6b1f" roughness={0.7} />
            </mesh>
        </group>
    );
}

export default function Road({ config, currentSpeed }: RoadProps) {
    const isJungle = config.displayName === "Jungle";

    // Generate tree positions for jungle
    const treePositions: [number, number, number][] = isJungle
        ? [
            [-8, 0, -10], [-7.5, 0, -25], [-8.2, 0, -40], [-7.8, 0, -55],
            [8, 0, -15], [7.5, 0, -30], [8.2, 0, -45], [7.8, 0, -60],
        ]
        : [];

    return (
        <group>
            {/* Asphalt */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -30]} receiveShadow>
                <planeGeometry args={[12, 80]} />
                <meshStandardMaterial color={config.roadColor} roughness={0.9} />
            </mesh>

            {/* Shoulder lines */}
            {[-5.5, 5.5].map((x, i) => (
                <mesh key={i} position={[x, 0.005, -30]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.15, 80]} />
                    <meshStandardMaterial
                        color={config.lineColor}
                        emissive={config.lineColor}
                        emissiveIntensity={0.4}
                    />
                </mesh>
            ))}

            {/* Lane stripes (dashed white/colored lines at lane boundaries) */}
            <LaneStripe x={-1.5} color={config.lineColor} currentSpeed={currentSpeed} />
            <LaneStripe x={1.5} color={config.lineColor} currentSpeed={currentSpeed} />

            {/* Jungle trees */}
            {isJungle && treePositions.map((pos, i) => (
                <JungleTree key={i} position={pos} currentSpeed={currentSpeed} />
            ))}
        </group>
    );
}
