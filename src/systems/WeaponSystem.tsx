import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import type { Zombie } from '../store/gameStore';

export const WeaponSystem: React.FC = () => {
    const { camera, raycaster } = useThree();
    const zombies = useGameStore(state => state.zombies);
    const damageZombie = useGameStore(state => state.damageZombie);
    const addScore = useGameStore(state => state.addScore);
    const removeZombie = useGameStore(state => state.removeZombie);

    const fireRequestRef = useRef(false);

    // Expose fire function globally for button to call
    React.useEffect(() => {
        (window as any).fireWeapon = () => {
            fireRequestRef.current = true;
        };

        return () => {
            delete (window as any).fireWeapon;
        };
    }, []);

    useFrame(() => {
        if (!fireRequestRef.current) return;
        fireRequestRef.current = false;

        // Raycast from camera center
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

        // Check for zombie hits
        type HitInfo = { zombie: Zombie; distance: number; isHeadshot: boolean };
        let closestHit: HitInfo | null = null;

        zombies.forEach(zombie => {
            if (zombie.state === 'dead') return;

            // Create bounding box for zombie
            const zombiePos = new THREE.Vector3(...zombie.position);
            const zombieBox = new THREE.Box3(
                new THREE.Vector3(zombiePos.x - 0.3, zombiePos.y, zombiePos.z - 0.2),
                new THREE.Vector3(zombiePos.x + 0.3, zombiePos.y + 1.2, zombiePos.z + 0.2)
            );

            // Check if ray intersects zombie
            const ray = raycaster.ray;
            const intersection = ray.intersectBox(zombieBox, new THREE.Vector3());

            if (intersection) {
                const distance = camera.position.distanceTo(intersection);

                // Check for headshot (upper part of zombie)
                const isHeadshot = intersection.y > zombiePos.y + 0.9;

                if (!closestHit || distance < closestHit.distance) {
                    closestHit = { zombie, distance, isHeadshot };
                }
            }
        });

        // Apply damage to closest hit
        if (closestHit !== null) {
            const hitInfo: HitInfo = closestHit;
            const damage = hitInfo.isHeadshot ? 100 : 50; // Headshot = instant kill
            const points = hitInfo.isHeadshot ? 100 : 50;

            damageZombie(hitInfo.zombie.id, damage);
            addScore(points);

            // Remove if dead
            if (hitInfo.zombie.health - damage <= 0) {
                const zombieId = hitInfo.zombie.id;
                setTimeout(() => {
                    removeZombie(zombieId);
                }, 1000);
            }
        }
    });

    return null; // System component
};
