import { create } from 'zustand';

export type CalibrationStep =
    | 'intro'           // "Welcome, let's calibrate"
    | 'ground-scan'     // "Point at floor and tap"
    | 'rotate-right'    // "Rotate right"
    | 'rotate-left'     // "Rotate left"
    | 'tilt-up'         // "Tilt up"
    | 'tilt-down'       // "Tilt down"
    | 'processing'      // "Calibrating..."
    | 'complete';       // "Ready"

interface CalibrationState {
    step: CalibrationStep;
    isCalibrated: boolean;

    // Calibration Data
    groundY: number;
    yawOffset: number;
    pitchOffset: number;

    // Actions
    setStep: (step: CalibrationStep) => void;
    completeCalibration: () => void;
    resetCalibration: () => void;
    setYawOffset: (offset: number) => void;
}

export const useCalibrationStore = create<CalibrationState>((set) => ({
    step: 'intro',
    isCalibrated: false,
    groundY: 0,
    yawOffset: 0,
    pitchOffset: 0,

    setStep: (step) => set({ step }),

    completeCalibration: () => set({
        step: 'complete',
        isCalibrated: true
    }),

    resetCalibration: () => set({
        step: 'intro',
        isCalibrated: false,
        yawOffset: 0
    }),

    setYawOffset: (offset) => set({ yawOffset: offset })
}));
