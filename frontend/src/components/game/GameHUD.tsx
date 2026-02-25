import type { GameState, GameActions } from "@/hooks/useGameState";
import "./GameHUD.css";

interface GameHUDProps {
    state: GameState;
    actions: GameActions;
}

function getScoreColor(score: number): string {
    if (score >= 70) return "#4ade80";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
}

export default function GameHUD({ state, actions }: GameHUDProps) {
    const { ecoScore, status, fuel, mode, gameOver, gameOverReason, timeRemaining } = state;

    // SVG ring calculations
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (ecoScore / 100) * circumference;
    const scoreColor = getScoreColor(ecoScore);

    const isWarning = status.toLowerCase().includes("warning");

    return (
        <div className="game-hud">
            {/* Top row */}
            <div className="hud-top">
                {/* Eco Score Ring */}
                <div className="eco-ring-wrap">
                    <svg className="eco-ring-svg" viewBox="0 0 100 100">
                        <circle className="eco-ring-bg" cx="50" cy="50" r={radius} />
                        <circle
                            className="eco-ring-fg"
                            cx="50"
                            cy="50"
                            r={radius}
                            stroke={scoreColor}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                        />
                        <text className="eco-ring-label" x="50" y="50" transform="rotate(90 50 50)">
                            {Math.round(ecoScore)}
                        </text>
                    </svg>
                    <span className="eco-label">Eco Score</span>
                </div>

                {/* Countdown Timer — centered */}
                <div className={`timer-display ${timeRemaining <= 10 ? "timer-critical" : ""}`}>
                    <div className="timer-value">
                        {Math.ceil(timeRemaining)}s
                    </div>
                    <div className="timer-label">Time Left</div>
                </div>

                {/* Status badge */}
                <div className={`status-badge ${isWarning ? "warning" : ""}`}>
                    {status}
                </div>
            </div>

            {/* Bottom row */}
            <div className="hud-bottom">
                {/* Fuel bar */}
                <div className="fuel-wrap">
                    <div className="fuel-label">⛽ Fuel</div>
                    <div className="fuel-bar">
                        <div
                            className={`fuel-fill ${fuel < 25 ? "low" : ""}`}
                            style={{ width: `${fuel}%` }}
                        />
                    </div>
                    <div className="fuel-pct">{fuel.toFixed(1)}%</div>
                </div>

                {/* Mode indicator */}
                <div className="mode-indicator">
                    {mode === "city" ? "🏙️ City" : mode === "jungle" ? "🌴 Jungle" : "🛣️ Highway"}
                </div>

                {/* Controls hint */}
                <div className="controls-hint">
                    <span className="key-cap">W</span>
                    <span className="key-cap">S</span>
                    <span className="controls-text">Speed</span>
                    <span className="key-divider">|</span>
                    <span className="key-cap">A</span>
                    <span className="key-cap">D</span>
                    <span className="controls-text">Lane</span>
                </div>
            </div>

            {/* Speedometer (Absolute positioning or new section) */}
            <div className="speed-gauge">
                <div className="speed-value">{Math.round(state.speed * 3.6)}</div>
                <div className="speed-unit">km/h</div>
            </div>

            {/* Game Over overlay */}
            {gameOver && (
                <div className="game-over-overlay">
                    <div className="game-over-card">
                        <div className="game-over-title">Game Over</div>
                        <div className="game-over-subtitle">
                            {gameOverReason === "time" ? "Time's up!" : "Out of fuel!"}
                        </div>
                        <div className="final-score">{Math.round(ecoScore)}</div>
                        <div className="final-score-label">Final Eco Score</div>
                        <button className="restart-btn" onClick={actions.restartGame}>
                            🔄 Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
