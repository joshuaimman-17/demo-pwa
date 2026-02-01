import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

interface GunProps {
    onFire?: () => void;
}

export const Gun: React.FC<GunProps> = ({ onFire }) => {
    const meshRef = useRef<THREE.Group>(null);
    const muzzleFlashRef = useRef<THREE.PointLight>(null);
    const lastFireTime = useGameStore(state => state.lastFireTime);
    const isReloading = useGameStore(state => state.isReloading);

    // Gun sway animation
    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        // Idle sway
        meshRef.current.rotation.x = Math.sin(time * 1.5) * 0.01;
        meshRef.current.rotation.y = Math.cos(time * 1.2) * 0.01;
        meshRef.current.position.y = -0.5 + Math.sin(time * 2) * 0.005;

        // Recoil animation
        const timeSinceFire = Date.now() - lastFireTime;
        if (timeSinceFire < 100) {
            const recoilAmount = 1 - (timeSinceFire / 100);
            meshRef.current.position.z = recoilAmount * 0.1;
            meshRef.current.rotation.x = -recoilAmount * 0.2;
        }

        // Reload animation
        if (isReloading) {
            meshRef.current.rotation.z = Math.sin(time * 10) * 0.3;
        } else {
            meshRef.current.rotation.z = 0;
        }

        // Muzzle flash
        if (muzzleFlashRef.current) {
            if (timeSinceFire < 50) {
                muzzleFlashRef.current.intensity = 5;
            } else {
                muzzleFlashRef.current.intensity = 0;
            }
        }
    });

    // Simple gun geometry (low-poly)
    const gunGeometry = useMemo(() => {
        const group = new THREE.Group();

        // Barrel
        const barrelGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.4);
        const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.position.z = -0.2;
        group.add(barrel);

        // Handle
        const handleGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.1);
        const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.y = -0.1;
        handle.position.z = 0.05;
        group.add(handle);

        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.1, 0.08, 0.15);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.z = 0.05;
        group.add(body);

        return group;
    }, []);

    return (
        <group ref={meshRef} position={[0.3, -0.5, -0.8]} rotation={[0, 0, 0]}>
            <primitive object={gunGeometry} />

            {/* Muzzle flash light */}
            <pointLight
                ref={muzzleFlashRef}
                position={[0, 0, -0.4]}
                color="#ff6600"
                intensity={0}
                distance={3}
            />

            {/* Muzzle flash sprite */}
            {Date.now() - lastFireTime < 50 && (
                <sprite position={[0, 0, -0.4]} scale={[0.2, 0.2, 1]}>
                    <spriteMaterial color="#ffaa00" opacity={0.8} />
                </sprite>
            )}
        </group>
    );
};
