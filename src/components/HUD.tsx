import React from 'react';
import { useAR } from '../contexts/ARContext';
import { useGameStore } from '../store/gameStore';
import '../styles/HUD.css';

export const HUD: React.FC = () => {
    const health = useGameStore(state => state.health);
    const maxHealth = useGameStore(state => state.maxHealth);
    const ammo = useGameStore(state => state.ammo);
    const maxAmmo = useGameStore(state => state.maxAmmo);
    const score = useGameStore(state => state.score);
    const isReloading = useGameStore(state => state.isReloading);
    const zombies = useGameStore(state => state.zombies);
    const wave = useGameStore(state => state.wave);

    const healthPercentage = (health / maxHealth) * 100;
    const aliveZombies = zombies.filter(z => z.state !== 'dead');

    const { orientation } = useAR();
    const compassRotation = orientation.alpha || 0;

    return (
        <div className="hud">
            {/* Crosshair */}
            <div className="crosshair">
                <div className="crosshair-line horizontal" />
                <div className="crosshair-line vertical" />
                <div className="crosshair-dot" />
            </div>

            {/* Compass - Top Center (Below Wave) */}
            <div className="compass-container">
                <div className="compass-arrow" style={{ transform: `rotate(${compassRotation}deg)` }}>
                    ➤
                </div>
                <div className="compass-label">{Math.round(compassRotation)}°</div>
            </div>

            {/* Top Left - Health */}
            <div className="hud-top-left">
                <div className="health-container">
                    <div className="health-label">HEALTH</div>
                    <div className="health-bar-bg">
                        <div
                            className="health-bar-fill"
                            style={{
                                width: `${healthPercentage}%`,
                                backgroundColor: healthPercentage > 50 ? '#00ff00' : healthPercentage > 25 ? '#ffaa00' : '#ff0000'
                            }}
                        />
                    </div>
                    <div className="health-value">{health}</div>
                </div>
            </div>

            {/* Top Right - Radar/Scanner */}
            <div className="hud-top-right">
                <div className="radar-container">
                    <div className="radar-label">SCANNER</div>
                    <div className="radar">
                        <div className="radar-center" />
                        {aliveZombies.map(zombie => {
                            const angle = Math.atan2(zombie.position[0], zombie.position[2]);
                            const distance = Math.min(zombie.distance / 10, 1); // Normalize to 0-1
                            const x = 50 + Math.sin(angle) * distance * 40;
                            const y = 50 + Math.cos(angle) * distance * 40;

                            return (
                                <div
                                    key={zombie.id}
                                    className="radar-blip"
                                    style={{
                                        left: `${x}%`,
                                        top: `${y}%`
                                    }}
                                />
                            );
                        })}
                        <div className="radar-sweep" />
                    </div>
                    <div className="zombie-count">{aliveZombies.length} HOSTILES</div>
                </div>
            </div>

            {/* Bottom Left - Ammo */}
            <div className="hud-bottom-left">
                <div className="ammo-container">
                    <div className="ammo-count">{ammo}</div>
                    <div className="ammo-label">/ {maxAmmo}</div>
                    {isReloading && <div className="reload-indicator">RELOADING...</div>}
                </div>
                <div className="score-container">
                    <div className="score-label">SCORE</div>
                    <div className="score-value">{score}</div>
                </div>
            </div>

            {/* Top Center - Wave */}
            <div className="hud-top-center">
                <div className="wave-indicator">WAVE {wave}</div>
            </div>
        </div>
    );
};
