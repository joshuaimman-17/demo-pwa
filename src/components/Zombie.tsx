import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Zombie as ZombieType } from '../store/gameStore';

interface ZombieProps {
    zombie: ZombieType;
    onDeath?: (id: string) => void;
}

export const Zombie: React.FC<ZombieProps> = ({ zombie, onDeath }) => {
    const meshRef = useRef<THREE.Group>(null);
    const isDead = zombie.state === 'dead';

    useEffect(() => {
        if (isDead && onDeath) {
            const timeout = setTimeout(() => {
                onDeath(zombie.id);
            }, 1000); // Remove after death animation
            return () => clearTimeout(timeout);
        }
    }, [isDead, zombie.id, onDeath]);

    // Walking animation
    useFrame((state) => {
        if (!meshRef.current || isDead) return;

        const time = state.clock.getElapsedTime();

        // Walking bob
        meshRef.current.position.y = zombie.position[1] + Math.abs(Math.sin(time * 4)) * 0.1;

        // Arm swing
        meshRef.current.rotation.z = Math.sin(time * 4) * 0.1;

        // Death animation
        if (isDead) {
            meshRef.current.rotation.x += 0.05;
            meshRef.current.position.y -= 0.02;
        }
    });

    // Simple zombie geometry (low-poly)
    const zombieGeometry = useMemo(() => {
        const group = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.3);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: isDead ? 0x555555 : 0x4a7c4a,
            roughness: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        group.add(body);

        // Head
        const headGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: isDead ? 0x666666 : 0x6b8e6b,
            roughness: 0.7
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.05;
        group.add(head);

        // Eyes (red glow)
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: isDead ? 0x000000 : 0xff0000 });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08, 1.1, 0.12);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08, 1.1, 0.12);
        group.add(rightEye);

        // Arms
        const armGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: isDead ? 0x555555 : 0x4a7c4a
        });

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.275, 0.5, 0);
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.275, 0.5, 0);
        group.add(rightArm);

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: isDead ? 0x444444 : 0x3a6c3a
        });

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.1, 0.15, 0);
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.1, 0.15, 0);
        group.add(rightLeg);

        return group;
    }, [isDead]);

    // Scale based on distance
    const scale = useMemo(() => {
        const baseScale = 1;
        const distanceScale = Math.max(0.5, 1 - zombie.distance / 20);
        return baseScale * distanceScale;
    }, [zombie.distance]);

    return (
        <group
            ref={meshRef}
            position={zombie.position}
            scale={[scale, scale, scale]}
        >
            <primitive object={zombieGeometry} />

            {/* Shadow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <circleGeometry args={[0.3, 16]} />
                <meshBasicMaterial color="#000000" opacity={0.3} transparent />
            </mesh>

            {/* Health indicator */}
            {!isDead && zombie.health < 100 && (
                <sprite position={[0, 1.5, 0]} scale={[0.5, 0.1, 1]}>
                    <spriteMaterial color="#ff0000" opacity={0.8} />
                </sprite>
            )}
        </group>
    );
};
