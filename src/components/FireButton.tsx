import React from 'react';
import { useGameStore } from '../store/gameStore';
import '../styles/FireButton.css';

export const FireButton: React.FC = () => {
    const fire = useGameStore(state => state.fire);
    const ammo = useGameStore(state => state.ammo);
    const isReloading = useGameStore(state => state.isReloading);
    const reload = useGameStore(state => state.reload);

    const handleFire = () => {
        if (ammo === 0 && !isReloading) {
            reload();
            return;
        }

        const canFire = fire();
        if (canFire) {
            // Trigger weapon system
            if ((window as any).fireWeapon) {
                (window as any).fireWeapon();
            }

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    };

    return (
        <div className="fire-button-container">
            <button
                className={`fire-button ${isReloading ? 'reloading' : ''}`}
                onTouchStart={handleFire}
                onClick={handleFire}
                disabled={isReloading}
            >
                {isReloading ? '⟳' : '🎯'}
            </button>

            {ammo === 0 && !isReloading && (
                <div className="reload-prompt">TAP TO RELOAD</div>
            )}
        </div>
    );
};
