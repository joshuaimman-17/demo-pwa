import { useState, useEffect, useCallback } from 'react';

export interface DeviceOrientationData {
    alpha: number | null;  // Z-axis rotation (0-360)
    beta: number | null;   // X-axis rotation (-180 to 180)
    gamma: number | null;  // Y-axis rotation (-90 to 90)
    absolute: boolean;
}

export function useDeviceOrientation() {
    const [orientation, setOrientation] = useState<DeviceOrientationData>({
        alpha: null,
        beta: null,
        gamma: null,
        absolute: false
    });
    const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [error, setError] = useState<string | null>(null);

    const requestPermission = useCallback(async () => {
        try {
            // iOS 13+ requires permission
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                const response = await (DeviceOrientationEvent as any).requestPermission();
                if (response === 'granted') {
                    setPermission('granted');
                    return true;
                } else {
                    setPermission('denied');
                    setError('Device orientation permission denied');
                    return false;
                }
            } else {
                // Android and older iOS
                setPermission('granted');
                return true;
            }
        } catch (err) {
            setError('Failed to request device orientation permission');
            setPermission('denied');
            return false;
        }
    }, []);

    useEffect(() => {
        if (permission !== 'granted') return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            setOrientation({
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
                absolute: event.absolute
            });
        };

        window.addEventListener('deviceorientation', handleOrientation);

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [permission]);

    return {
        orientation,
        permission,
        error,
        requestPermission,
        isSupported: 'DeviceOrientationEvent' in window
    };
}
