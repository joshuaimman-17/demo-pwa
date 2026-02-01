import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
    url?: string;
    size?: number;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
    url = window.location.href,
    size = 200
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, url, {
                width: size,
                margin: 2,
                color: {
                    dark: '#8B0000',
                    light: '#FFFFFF'
                }
            });
        }
    }, [url, size]);

    return <canvas ref={canvasRef} />;
};
