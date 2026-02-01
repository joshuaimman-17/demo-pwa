import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import '../styles/DamageFlash.css';

export const DamageFlash: React.FC = () => {
    const health = useGameStore(state => state.health);
    const [prevHealth, setPrevHealth] = useState(health);
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (health < prevHealth) {
            setShowFlash(true);

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }

            setTimeout(() => {
                setShowFlash(false);
            }, 200);
        }
        setPrevHealth(health);
    }, [health, prevHealth]);

    if (!showFlash) return null;

    return <div className="damage-flash" />;
};
