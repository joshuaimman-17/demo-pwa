import React, { createContext, useContext, ReactNode } from 'react';
import { useCameraFeed } from '../hooks/useCameraFeed';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';

interface ARContextType {
    stream: MediaStream | null;
    cameraError: string | null;
    requestCamera: () => Promise<void>;
    orientation: {
        alpha: number | null;
        beta: number | null;
        gamma: number | null;
    };
    orientationError: string | null;
    requestPermission: () => Promise<void>;
}

const ARContext = createContext<ARContextType | undefined>(undefined);

export const ARProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const cameraData = useCameraFeed();
    const orientationData = useDeviceOrientation();

    console.log('[ARProvider] Rendering with:', {
        hasStream: !!cameraData.stream,
        streamId: cameraData.stream?.id,
        cameraError: cameraData.error,
        orientation: orientationData.orientation,
        orientationError: orientationData.error
    });

    const value: ARContextType = {
        stream: cameraData.stream,
        cameraError: cameraData.error,
        requestCamera: async () => {
            console.log('[ARProvider] requestCamera called');
            await cameraData.requestCamera();
        },
        orientation: orientationData.orientation,
        orientationError: orientationData.error,
        requestPermission: async () => {
            console.log('[ARProvider] requestPermission called');
            await orientationData.requestPermission();
        },
    };

    return <ARContext.Provider value={value}>{children}</ARContext.Provider>;
};

export const useAR = () => {
    const context = useContext(ARContext);
    if (!context) {
        throw new Error('useAR must be used within ARProvider');
    }
    return context;
};
