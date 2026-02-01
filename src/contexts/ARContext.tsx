import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useCameraFeed } from '../hooks/useCameraFeed';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { debugLog } from '../components/DebugOverlay';

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

    // Only log when stream changes, not on every render
    const streamId = cameraData.stream?.id;
    React.useEffect(() => {
        debugLog.info(`ARProvider: stream=${streamId || 'none'}, error=${cameraData.error || 'none'}`);
    }, [streamId, cameraData.error]);

    // Memoize callbacks to prevent re-renders
    const handleRequestCamera = useCallback(async () => {
        debugLog.info('ARProvider: requestCamera called');
        await cameraData.requestCamera();
    }, [cameraData.requestCamera]);

    const handleRequestPermission = useCallback(async () => {
        debugLog.info('ARProvider: requestPermission called');
        await orientationData.requestPermission();
    }, [orientationData.requestPermission]);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo<ARContextType>(() => ({
        stream: cameraData.stream,
        cameraError: cameraData.error,
        requestCamera: handleRequestCamera,
        orientation: orientationData.orientation,
        orientationError: orientationData.error,
        requestPermission: handleRequestPermission,
    }), [
        cameraData.stream,
        cameraData.error,
        handleRequestCamera,
        orientationData.orientation,
        orientationData.error,
        handleRequestPermission
    ]);

    return <ARContext.Provider value={value}>{children}</ARContext.Provider>;
};

export const useAR = () => {
    const context = useContext(ARContext);
    if (!context) {
        throw new Error('useAR must be used within ARProvider');
    }
    return context;
};
