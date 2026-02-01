import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useCameraFeed } from '../hooks/useCameraFeed';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { Gun } from './Gun';
import { Zombie } from './Zombie';
import { useGameStore } from '../store/gameStore';
import '../styles/ARScene.css';

export const ARScene: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const { stream } = useCameraFeed();
    const { orientation } = useDeviceOrientation();
    const zombies = useGameStore(state => state.zombies);
    const removeZombie = useGameStore(state => state.removeZombie);

    // Update camera feed as background
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
    }, [stream]);

    // Update camera rotation based on device orientation
    useEffect(() => {
        if (!cameraRef.current || !orientation.beta || !orientation.gamma) return;

        // Convert device orientation to camera rotation
        // Beta: front-to-back tilt (-180 to 180)
        // Gamma: left-to-right tilt (-90 to 90)
        // Alpha: compass direction (0 to 360)

        const beta = THREE.MathUtils.degToRad(orientation.beta || 0);
        const gamma = THREE.MathUtils.degToRad(orientation.gamma || 0);
        const alpha = THREE.MathUtils.degToRad(orientation.alpha || 0);

        // Apply rotation to camera
        cameraRef.current.rotation.x = beta - Math.PI / 2;
        cameraRef.current.rotation.y = gamma;
        cameraRef.current.rotation.z = alpha;
    }, [orientation]);

    return (
        <div className="ar-scene">
            {/* Camera feed background */}
            <video
                ref={videoRef}
                className="camera-feed"
                autoPlay
                playsInline
                muted
            />

            {/* Three.js AR overlay */}
            <Canvas
                className="ar-canvas"
                gl={{
                    alpha: true,
                    antialias: false,
                    powerPreference: 'high-performance'
                }}
            >
                <PerspectiveCamera
                    ref={cameraRef}
                    makeDefault
                    fov={75}
                    near={0.1}
                    far={100}
                    position={[0, 1.6, 0]} // Eye level
                />

                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={0.8}
                    castShadow
                />
                <hemisphereLight
                    color="#ffffff"
                    groundColor="#444444"
                    intensity={0.4}
                />

                {/* Fog for depth */}
                <fog attach="fog" args={['#000000', 5, 20]} />

                {/* Gun */}
                <Gun />

                {/* Zombies */}
                {zombies.map(zombie => (
                    <Zombie
                        key={zombie.id}
                        zombie={zombie}
                        onDeath={removeZombie}
                    />
                ))}

                {/* Ground plane (invisible, for reference) */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial transparent opacity={0} />
                </mesh>
            </Canvas>
        </div>
    );
};
