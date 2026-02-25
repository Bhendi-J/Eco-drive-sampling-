import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGameState, type GameMode } from "@/hooks/useGameState";
import GameScene from "@/components/game/GameScene";
import GameHUD from "@/components/game/GameHUD";

export default function GamePlay() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const mode = (searchParams.get("mode") as GameMode) || "highway";
    const { state, actions } = useGameState(mode);

    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#0a0a1a" }}>
            {/* Back button */}
            <button
                onClick={() => navigate("/console")}
                style={{
                    position: "absolute",
                    top: 20,
                    right: 28,
                    zIndex: 30,
                    padding: "8px 18px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(12px)",
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                }}
            >
                ← Back
            </button>

            <Canvas
                shadows
                camera={{ position: [0, 6, 10], fov: 60 }}
                style={{ width: "100%", height: "100%" }}
            >
                <Suspense fallback={null}>
                    <GameScene state={state} actions={actions} />
                </Suspense>
            </Canvas>

            <GameHUD state={state} actions={actions} />
        </div>
    );
}
