import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAR } from '../contexts/ARContext';
import { Gun } from './Gun';
import { Zombie } from './Zombie';
import { useGameStore } from '../store/gameStore';
import { debugLog } from './DebugOverlay';
import '../styles/ARScene.css';

export const ARScene: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const { stream, orientation } = useAR();
    const zombies = useGameStore(state => state.zombies);
    const removeZombie = useGameStore(state => state.removeZombie);

    // Only log when stream changes
    const streamId = stream?.id;
    useEffect(() => {
        debugLog.info(`ARScene: stream=${streamId || 'NONE'}, active=${stream?.active}`);
    }, [streamId, stream?.active]);

    // Update camera feed as background
    useEffect(() => {
        debugLog.info(`ARScene effect: hasVideo=${!!videoRef.current}, hasStream=${!!stream}, streamId=${stream?.id}`);

        if (videoRef.current && stream) {
            debugLog.info('ARScene: Setting video srcObject');
            videoRef.current.srcObject = stream;
            videoRef.current.play().then(() => {
                debugLog.success('ARScene: ✅ Video playing!');
            }).catch(err => {
                debugLog.error(`ARScene: ❌ Video error: ${err.message}`);
            });
        } else {
            debugLog.warning(`ARScene: ⚠️ Missing ${!videoRef.current ? 'videoRef' : 'stream'}`);
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
                style={{ backgroundColor: stream ? 'transparent' : '#1a1a1a' }}
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

            {/* Loading indicator */}
            {!stream && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#fff',
                    fontSize: '1.2rem',
                    textAlign: 'center',
                    zIndex: 100
                }}>
                    <div>Initializing AR Camera...</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.7 }}>
                        Please grant camera permission
                    </div>
                </div>
            )}
        </div>
    );
};
