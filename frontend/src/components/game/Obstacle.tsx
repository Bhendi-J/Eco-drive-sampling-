import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ObstacleProps {
    lane: number;
    playerLane: number;
    currentSpeed: number;
    speedMultiplier: number;
    onCollision: () => void;
    onRemove: () => void;
}

const BASE_APPROACH_SPEED = 8; // minimum speed so obstacles still move when car is stopped

export default function Obstacle({ lane, playerLane, currentSpeed, speedMultiplier, onCollision, onRemove }: ObstacleProps) {
    const groupRef = useRef<THREE.Group>(null!);
    const [collided, setCollided] = useState(false);

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        // Move obstacle towards camera — use at least BASE_APPROACH_SPEED so
        // obstacles still approach even when the car is stationary.
        // Apply the environment's speedMultiplier for difficulty scaling.
        const moveSpeed = Math.max(BASE_APPROACH_SPEED, currentSpeed) * speedMultiplier;

        groupRef.current.position.z += moveSpeed * delta;

        const z = groupRef.current.position.z;

        // Collision zone — only check if player is in the SAME lane
        if (!collided && z > 0.5 && z < 3.5) {
            if (lane === playerLane) {
                onCollision();
                setCollided(true);
            }
        }

        // Remove when past camera
        if (z > 10) {
            onRemove();
        }
    });

    return (
        <group ref={groupRef} position={[lane, 0.5, -60]}>
            {/* Main body */}
            <mesh castShadow>
                <boxGeometry args={[1.6, 1.0, 2.0]} />
                <meshStandardMaterial color="#e53935" metalness={0.3} roughness={0.5} />
            </mesh>

            {/* Warning stripe */}
            <mesh position={[0, 0, 1.01]}>
                <boxGeometry args={[1.6, 0.2, 0.02]} />
                <meshStandardMaterial
                    color="#fdd835"
                    emissive="#fdd835"
                    emissiveIntensity={0.8}
                />
            </mesh>

            {/* Top warning light */}
            <mesh position={[0, 0.7, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial
                    emissive="#ff6600"
                    emissiveIntensity={2}
                    color="#ff8800"
                />
            </mesh>
        </group>
    );
}
