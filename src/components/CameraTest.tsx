import React, { useRef, useEffect, useState } from 'react';
import { useAR } from '../contexts/ARContext';
import '../styles/CameraTest.css';

interface CameraTestProps {
    onTestComplete: () => void;
}

export const CameraTest: React.FC<CameraTestProps> = ({ onTestComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { stream, cameraError, requestCamera, orientation, orientationError, requestPermission } = useAR();
    const [cameraReady, setCameraReady] = useState(false);
    const [gyroReady, setGyroReady] = useState(false);
    const [testing, setTesting] = useState(false);

    // Start test on mount
    useEffect(() => {
        const runTest = async () => {
            setTesting(true);

            // Test camera
            console.log('Testing camera...');
            await requestCamera();

            // Test gyroscope
            console.log('Testing gyroscope...');
            await requestPermission();
        };

        runTest();
    }, [requestCamera, requestPermission]);

    // Update video feed
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().then(() => {
                setCameraReady(true);
                console.log('Camera feed playing');
            }).catch(err => {
                console.error('Error playing video:', err);
            });
        }
    }, [stream]);

    // Check gyroscope
    useEffect(() => {
        if (orientation.beta !== null && orientation.gamma !== null) {
            setGyroReady(true);
            console.log('Gyroscope working:', orientation);
        }
    }, [orientation]);

    const allTestsPassed = cameraReady && gyroReady;

    console.log('[CameraTest] Status:', {
        cameraReady,
        gyroReady,
        allTestsPassed,
        hasStream: !!stream,
        streamId: stream?.id,
        orientation
    });

    return (
        <div className="camera-test">
            <div className="test-container">
                <h1 className="test-title">AR System Test</h1>
                <p className="test-subtitle">Testing camera and sensors...</p>

                {/* Camera Feed Test */}
                <div className="test-section">
                    <div className="test-header">
                        <span className="test-label">📷 Camera Feed</span>
                        <span className={`test-status ${cameraReady ? 'success' : 'pending'}`}>
                            {cameraReady ? '✓ Working' : testing ? '⏳ Testing...' : '✗ Not Ready'}
                        </span>
                    </div>

                    <div className="camera-preview">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="test-video"
                        />
                        {!stream && (
                            <div className="camera-placeholder">
                                <div>Waiting for camera...</div>
                                {cameraError && <div className="error-text">{cameraError}</div>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Gyroscope Test */}
                <div className="test-section">
                    <div className="test-header">
                        <span className="test-label">🎯 Gyroscope</span>
                        <span className={`test-status ${gyroReady ? 'success' : 'pending'}`}>
                            {gyroReady ? '✓ Working' : testing ? '⏳ Testing...' : '✗ Not Ready'}
                        </span>
                    </div>

                    <div className="gyro-data">
                        <div className="gyro-row">
                            <span className="gyro-label">Alpha (Compass):</span>
                            <span className="gyro-value">{orientation.alpha?.toFixed(1) ?? '--'}°</span>
                        </div>
                        <div className="gyro-row">
                            <span className="gyro-label">Beta (Tilt Front/Back):</span>
                            <span className="gyro-value">{orientation.beta?.toFixed(1) ?? '--'}°</span>
                        </div>
                        <div className="gyro-row">
                            <span className="gyro-label">Gamma (Tilt Left/Right):</span>
                            <span className="gyro-value">{orientation.gamma?.toFixed(1) ?? '--'}°</span>
                        </div>
                        {orientationError && <div className="error-text">{orientationError}</div>}
                    </div>

                    {gyroReady && (
                        <div className="gyro-instruction">
                            <p>✓ Move your phone around to see the values change</p>
                        </div>
                    )}
                </div>

                {/* Error Messages */}
                {(cameraError || orientationError) && (
                    <div className="test-errors">
                        {cameraError && <div className="error-message">Camera: {cameraError}</div>}
                        {orientationError && <div className="error-message">Gyroscope: {orientationError}</div>}
                    </div>
                )}

                {/* Continue Button */}
                <button
                    className={`continue-button ${allTestsPassed ? 'enabled' : 'disabled'}`}
                    onClick={onTestComplete}
                    disabled={!allTestsPassed}
                >
                    {allTestsPassed ? 'START GAME ▶' : 'Waiting for tests to pass...'}
                </button>

                {!allTestsPassed && (
                    <div className="test-help">
                        <p>💡 Make sure to:</p>
                        <ul>
                            <li>Grant camera permission when prompted</li>
                            <li>Grant motion/orientation permission when prompted</li>
                            <li>Use HTTPS (required for camera and sensors)</li>
                            <li>Test on a real mobile device (not desktop)</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
