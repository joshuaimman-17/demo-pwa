import { useState, useEffect, useCallback, useRef } from 'react';

export interface CameraStream {
    stream: MediaStream | null;
    videoElement: HTMLVideoElement | null;
    error: string | null;
}

export function useCameraFeed() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const requestCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Back camera
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });

            setStream(mediaStream);
            setPermission('granted');
            setError(null);

            // Attach to video element if it exists
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }

            return mediaStream;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Camera access denied';
            setError(errorMessage);
            setPermission('denied');
            return null;
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [stream]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return {
        stream,
        videoRef,
        error,
        permission,
        requestCamera,
        stopCamera,
        isSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    };
}
