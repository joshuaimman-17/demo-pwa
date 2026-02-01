import React, { useEffect, useState } from 'react';
import { useCalibrationStore, CalibrationStep } from '../store/calibrationStore';
import { useAR } from '../contexts/ARContext';
import * as THREE from 'three';
import '../styles/Calibration.css';

export const CalibrationOverlay: React.FC = () => {
    const { step, setStep, completeCalibration, setYawOffset } = useCalibrationStore();
    const { orientation, setYawOffset: setContextYawOffset } = useAR();
    const [instruction, setInstruction] = useState('');

    // Update instruction text based on step
    useEffect(() => {
        switch (step) {
            case 'intro':
                setInstruction("Welcome Agent. Let's calibrate your AR gear.");
                break;
            case 'ground-scan':
                setInstruction("Point your camera at the ground and TAP the screen to lock the floor.");
                break;
            case 'rotate-right':
                setInstruction("Slowly rotate your device to the RIGHT ➡️");
                break;
            case 'rotate-left':
                setInstruction("Now rotate to the LEFT ⬅️");
                break;
            case 'tilt-up':
                setInstruction("Tilt your device UP ⬆️");
                break;
            case 'tilt-down':
                setInstruction("Tilt your device DOWN ⬇️");
                break;
            case 'processing':
                setInstruction("Analyzing sensor data...");
                break;
            case 'complete':
                setInstruction("Calibration Complete. Systems Online.");
                break;
        }
    }, [step]);

    // Handle Tap for Ground Scan (and progression for now)
    const handleTap = () => {
        if (step === 'intro') {
            setStep('ground-scan');
        } else if (step === 'ground-scan') {
            // Set "Forward" direction here
            if (orientation.alpha !== null) {
                const currentRad = THREE.MathUtils.degToRad(orientation.alpha);
                // We set the offset in BOTH stores for now (local for calib, context for ARScene)
                setYawOffset(-currentRad);
                setContextYawOffset(-currentRad);
            }
            setStep('rotate-right');
        } else if (step === 'complete') {
            // Finished
        }
    };

    // Auto-progress simulation for rotation steps (Real implementation would check sensor delta)
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (['rotate-right', 'rotate-left', 'tilt-up', 'tilt-down', 'processing'].includes(step)) {
            timeout = setTimeout(() => {
                if (step === 'rotate-right') setStep('rotate-left');
                else if (step === 'rotate-left') setStep('tilt-up');
                else if (step === 'tilt-up') setStep('tilt-down');
                else if (step === 'tilt-down') setStep('processing');
                else if (step === 'processing') completeCalibration();
            }, 2000); // 2 seconds per step for demo
        }
        return () => clearTimeout(timeout);
    }, [step, setStep, completeCalibration]);

    if (step === 'complete') return null; // Hide when done (or handle in Game.tsx)

    return (
        <div className="calibration-overlay" onClick={handleTap}>
            <div className="calibration-content">
                <div className="calibration-icon">
                    {step === 'ground-scan' && '🦶'}
                    {step === 'rotate-right' && '↪️'}
                    {step === 'rotate-left' && '↩️'}
                    {step === 'tilt-up' && '🔼'}
                    {step === 'tilt-down' && '🔽'}
                    {step === 'processing' && '⚙️'}
                    {step === 'intro' && '👋'}
                </div>
                <h2>SYSTEM CALIBRATION</h2>
                <p className="instruction-text">{instruction}</p>
                <div className="step-indicator">
                    Step: {step.toUpperCase()}
                </div>
                {step === 'intro' && <div className="tap-hint">(Tap to Begin)</div>}
                {step === 'ground-scan' && <div className="tap-hint">(Tap Set Ground)</div>}
            </div>
        </div>
    );
};
