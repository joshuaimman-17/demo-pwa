import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAR } from '../contexts/ARContext';
import { Gun } from './Gun';
import { Zombie } from './Zombie';
import { useGameStore } from '../store/gameStore';
import { ZombieManager } from '../systems/ZombieManager';
import { WeaponSystem } from '../systems/WeaponSystem';
import { debugLog } from './DebugOverlay';
import '../styles/ARScene.css';

export const ARScene: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const { stream, orientation, yawOffset } = useAR();
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
        if (!cameraRef.current || !orientation.alpha || !orientation.beta || !orientation.gamma) return;

        // Convert degrees to radians
        const alpha = orientation.alpha ? THREE.MathUtils.degToRad(orientation.alpha) : 0; // Z
        const beta = orientation.beta ? THREE.MathUtils.degToRad(orientation.beta) : 0;   // X'
        const gamma = orientation.gamma ? THREE.MathUtils.degToRad(orientation.gamma) : 0; // Y''

        // Orientation from device sensors
        // Device Coordinate System:
        // alpha: rotation around Z axis
        // beta: rotation around X axis
        // gamma: rotation around Y axis
        // Three.js Coordinate System:
        // Y is up, Z is forward (or backward depending on camera)

        // Create Euler from device orientation
        // Order 'ZXY' is typically used for device orientation
        const euler = new THREE.Euler(beta, alpha, -gamma, 'YXZ');

        const q0 = new THREE.Quaternion();
        q0.setFromEuler(euler);

        // Adjust for Landscape Mode (-90 degrees around Z axis)
        const q1 = new THREE.Quaternion();
        q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);

        // Apply rotation to align device frame with world frame (if needed)
        // Usually we need to rotate -90 around X to make phone flat match world flat
        // But for "Holding up like a camera", the frame is different.

        // Standard Mapping for "Holding phone up in Landscape":
        // This is complex. Let's align specifically for the user's "Turn left/right to shoot" request.
        // We want: 
        // - Heading (Compass) -> World Y Rotation
        // - Tilt Up/Down -> World X Rotation
        // - Tilt Side/Side -> World Z Rotation

        // Let's use a simplified logical mapping for AR Shooter specifically
        // This forces the "feeling" of alignment rather than strict physics which can feel wonky if sensors drift

        // Landscape Mode Mapping:
        // Yaw (Turning) = Alpha (Compass)
        // Pitch (Looking Up/Down) = Gamma (Device Roll in portrait, Pitch in landscape)
        // Roll (Tilting Head) = Beta (Device Pitch in portrait, Roll in landscape)

        // Correction offsets
        const yawOffset = THREE.MathUtils.degToRad(0); // Calibrate north if needed

        // Apply to camera
        // Invert some axes to match Three.js camera looking down -Z

        // Yaw: Alpha is 0=North, 90=East. Three.js is CCW.
        // We want turning LEFT (decreasing Alpha) to look LEFT (Positive rotation around Y?)
        // Standard compass: N=0, E=90, S=180, W=270.
        // To look "right", we rotate camera Right (Negative Y).

        // Let's try direct Euler application with specific order for AR Shooter feel
        // Y = Alpha (Yaw)
        // X = Gamma (Pitch)
        // Z = Beta (Roll)

        // Important: Device alpha increases CCW from North? Check spec. 
        // Android: 0=North, increases as you turn LEFT? No, increases as you turn RIGHT usually (CW?).
        // Actually DeviceOrientation Spec says East is X, North is Y.

        // Robust approach:
        // 1. Create quaternion from Alpha/Beta/Gamma
        const zee = new THREE.Vector3(0, 0, 1);
        const euler2 = new THREE.Euler();
        const q2 = new THREE.Quaternion();
        const q3 = new THREE.Quaternion();

        // Specific 'ZXY' order for device orientation
        // beta (x), alpha (z), -gamma (y) 
        // This is standard WebXR/Three.js device orientation mapping
        euler2.set(beta, alpha, -gamma, 'YXZ');
        q2.setFromEuler(euler2);

        // Rotate for screen orientation (-90 for landscape left)
        q3.setFromAxisAngle(zee, -Math.PI / 2);
        q2.multiply(q3);

        // Rotate -90 around X to bring "flat on table" to "looking forward"
        const q4 = new THREE.Quaternion();
        q4.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        q2.multiply(q4);

        // Apply Calibration Offset (Yaw adjustment)
        if (yawOffset !== 0) {
            const qOffset = new THREE.Quaternion();
            qOffset.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yawOffset);
            q2.premultiply(qOffset);
        }

        cameraRef.current.quaternion.copy(q2);

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

                {/* Game Systems */}
                <ZombieManager />
                <WeaponSystem />

                {/* Ground plane & Grid */}
                <group position={[0, 0, 0]}>
                    <gridHelper args={[100, 100, 0x444444, 0x222222]} />
                    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <planeGeometry args={[100, 100]} />
                        <meshStandardMaterial
                            color="#111111"
                            transparent
                            opacity={0.4}
                            roughness={0.8}
                        />
                    </mesh>
                </group>
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
