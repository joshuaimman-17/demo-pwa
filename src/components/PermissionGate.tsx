import React, { useState } from 'react';
import { useCameraFeed } from '../hooks/useCameraFeed';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import '../styles/PermissionGate.css';

interface PermissionGateProps {
    children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ children }) => {
    const { requestCamera, permission: cameraPermission, error: cameraError } = useCameraFeed();
    const { requestPermission: requestOrientation, permission: orientationPermission, error: orientationError } = useDeviceOrientation();
    const [step, setStep] = useState<'camera' | 'orientation' | 'complete'>('camera');

    const handleCameraRequest = async () => {
        const stream = await requestCamera();
        if (stream) {
            setStep('orientation');
        }
    };

    const handleOrientationRequest = async () => {
        const granted = await requestOrientation();
        if (granted) {
            setStep('complete');
        }
    };

    if (step === 'complete' && cameraPermission === 'granted' && orientationPermission === 'granted') {
        return <>{children}</>;
    }

    return (
        <div className="permission-gate">
            <div className="permission-content">
                <h1 className="permission-title">AR ZOMBIE SHOOTER</h1>

                {step === 'camera' && (
                    <div className="permission-step">
                        <div className="permission-icon">📷</div>
                        <h2>Camera Access Required</h2>
                        <p>We need access to your back camera to display zombies in the real world.</p>
                        {cameraError && <div className="permission-error">{cameraError}</div>}
                        <button className="permission-button" onClick={handleCameraRequest}>
                            Grant Camera Access
                        </button>
                    </div>
                )}

                {step === 'orientation' && (
                    <div className="permission-step">
                        <div className="permission-icon">📡</div>
                        <h2>Motion Access Required</h2>
                        <p>We need access to your device's gyroscope to aim your weapon.</p>
                        {orientationError && <div className="permission-error">{orientationError}</div>}
                        <button className="permission-button" onClick={handleOrientationRequest}>
                            Grant Motion Access
                        </button>
                    </div>
                )}

                <div className="permission-info">
                    <p>🔒 Your privacy is important. Camera feed stays on your device.</p>
                </div>
            </div>
        </div>
    );
};
