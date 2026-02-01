import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import type { Zombie } from '../store/gameStore';

export const ZombieManager: React.FC = () => {
    const addZombie = useGameStore(state => state.addZombie);
    const updateZombie = useGameStore(state => state.updateZombie);
    const zombies = useGameStore(state => state.zombies);
    const maxZombies = useGameStore(state => state.maxZombies);
    const isPlaying = useGameStore(state => state.isPlaying);
    const isPaused = useGameStore(state => state.isPaused);
    const takeDamage = useGameStore(state => state.takeDamage);

    const spawnInterval = 3000; // Spawn every 3 seconds

    // Spawn zombies
    useEffect(() => {
        if (!isPlaying || isPaused) return;

        const spawnTimer = setInterval(() => {
            const aliveZombies = zombies.filter(z => z.state !== 'dead');

            if (aliveZombies.length < maxZombies) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 8 + Math.random() * 4; // Spawn 8-12 units away

                const x = Math.sin(angle) * distance;
                const z = Math.cos(angle) * distance;

                const newZombie: Zombie = {
                    id: `zombie-${Date.now()}-${Math.random()}`,
                    position: [x, 0, z],
                    health: 100,
                    state: 'walking',
                    distance: distance
                };

                addZombie(newZombie);
            }
        }, spawnInterval);

        return () => clearInterval(spawnTimer);
    }, [isPlaying, isPaused, zombies, maxZombies, addZombie]);

    // Update zombie positions (move toward player)
    useFrame((_state, delta) => {
        if (isPaused || !isPlaying) return;

        zombies.forEach(zombie => {
            if (zombie.state === 'dead') return;

            const [x, y, z] = zombie.position;
            const distance = Math.sqrt(x * x + z * z);

            // Update distance
            updateZombie(zombie.id, { distance });

            // Move toward player (at origin)
            if (distance > 1.5) {
                const speed = 0.5 * delta; // Adjust speed
                const dirX = -x / distance;
                const dirZ = -z / distance;

                const newX = x + dirX * speed;
                const newZ = z + dirZ * speed;

                updateZombie(zombie.id, {
                    position: [newX, y, newZ],
                    state: 'walking'
                });
            } else {
                // Attack player
                updateZombie(zombie.id, { state: 'attacking' });

                // Damage player periodically
                if (Math.random() < 0.02) { // 2% chance per frame
                    takeDamage(5);
                }
            }
        });
    });

    return null; // This is a system component, no visual output
};
