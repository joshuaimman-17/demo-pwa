import React, { useEffect, useState } from 'react';
import { ARScene } from './ARScene';
import { HUD } from './HUD';
import { FireButton } from './FireButton';
import { ZombieManager } from '../systems/ZombieManager';
import { WeaponSystem } from '../systems/WeaponSystem';
import { DamageFlash } from './DamageFlash';
import { CameraTest } from './CameraTest';
import { useGameStore } from '../store/gameStore';
import '../styles/Game.css';

export const Game: React.FC = () => {
    const [testPassed, setTestPassed] = useState(false);
    const startGame = useGameStore(state => state.startGame);
    const isPlaying = useGameStore(state => state.isPlaying);
    const isGameOver = useGameStore(state => state.isGameOver);
    const score = useGameStore(state => state.score);
    const reset = useGameStore(state => state.reset);

    useEffect(() => {
        // Lock to landscape orientation
        if (screen.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock('landscape').catch(() => {
                console.log('Orientation lock not supported');
            });
        }

        // Request fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {
                console.log('Fullscreen not supported');
            });
        }
    }, []);

    // Show camera test first
    if (!testPassed) {
        return <CameraTest onTestComplete={() => setTestPassed(true)} />;
    }

    if (!isPlaying && !isGameOver) {
        return (
            <div className="game-menu">
                <div className="menu-content">
                    <h1 className="game-logo">
                        <span className="logo-ar">AR</span>
                        <span className="logo-zombie">ZOMBIE</span>
                        <span className="logo-shooter">SHOOTER</span>
                    </h1>
                    <p className="game-tagline">Survive the undead invasion</p>
                    <button className="start-button" onClick={startGame}>
                        START GAME
                    </button>
                    <div className="game-instructions">
                        <h3>How to Play:</h3>
                        <ul>
                            <li>🎯 Move your phone to aim</li>
                            <li>🔫 Tap the fire button to shoot</li>
                            <li>💀 Aim for headshots for instant kills</li>
                            <li>❤️ Don't let zombies get too close!</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    if (isGameOver) {
        return (
            <div className="game-over">
                <div className="game-over-content">
                    <h1 className="game-over-title">GAME OVER</h1>
                    <div className="final-score">
                        <div className="score-label">Final Score</div>
                        <div className="score-number">{score}</div>
                    </div>
                    <button className="restart-button" onClick={reset}>
                        TRY AGAIN
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-container">
            <ARScene />
            <HUD />
            <FireButton />
            <DamageFlash />

            {/* Game systems (invisible) */}
            <div style={{ display: 'none' }}>
                <ZombieManager />
                <WeaponSystem />
            </div>
        </div>
    );
};
