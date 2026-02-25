import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CarProps {
    lane: number;
    onSwitchLane: (direction: "left" | "right") => void;
    onAccelerate: (value: number) => void;
    onBrake: (isBraking: boolean) => void;
    gameOver: boolean;
}

export default function Car({ lane, onSwitchLane, onAccelerate, onBrake, gameOver }: CarProps) {
    const groupRef = useRef<THREE.Group>(null!);

    // Keyboard listener for controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver) return;
            switch (e.key.toLowerCase()) {
                case "a":
                case "arrowleft":
                    onSwitchLane("left");
                    break;
                case "d":
                case "arrowright":
                    onSwitchLane("right");
                    break;
                case "w":
                case "arrowup":
                    onAccelerate(1.0);
                    break;
                case "s":
                case "arrowdown":
                    onBrake(true);
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.key.toLowerCase()) {
                case "w":
                case "arrowup":
                    onAccelerate(0);
                    break;
                case "s":
                case "arrowdown":
                    onBrake(false);
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [onSwitchLane, onAccelerate, onBrake, gameOver]);

    // Smooth lane interpolation
    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.position.x = THREE.MathUtils.lerp(
            groupRef.current.position.x,
            lane,
            0.12
        );

        // Add subtle bounce/tilt for realism
        groupRef.current.rotation.z = THREE.MathUtils.lerp(
            groupRef.current.rotation.z,
            (groupRef.current.position.x - lane) * -0.1,
            0.1
        );
    });

    return (
        <group ref={groupRef} position={[0, 0.35, 2]}>
            {/* Body */}
            <mesh castShadow position={[0, 0, 0]}>
                <boxGeometry args={[1.8, 0.5, 3.5]} />
                <meshStandardMaterial color="#1a73e8" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Cabin */}
            <mesh castShadow position={[0, 0.45, -0.2]}>
                <boxGeometry args={[1.5, 0.45, 1.8]} />
                <meshStandardMaterial color="#1565c0" metalness={0.6} roughness={0.3} />
            </mesh>

            {/* Windshield */}
            <mesh position={[0, 0.45, 0.75]}>
                <boxGeometry args={[1.4, 0.4, 0.05]} />
                <meshStandardMaterial
                    color="#88ccff"
                    transparent
                    opacity={0.5}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Wheels */}
            {[
                [-0.85, -0.2, 1.0],
                [0.85, -0.2, 1.0],
                [-0.85, -0.2, -1.0],
                [0.85, -0.2, -1.0],
            ].map((pos, i) => (
                <mesh
                    key={i}
                    position={pos as [number, number, number]}
                    rotation={[0, 0, Math.PI / 2]}
                    castShadow
                >
                    <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
                    <meshStandardMaterial color="#222" roughness={0.8} />
                </mesh>
            ))}
        </group>
    );
}
