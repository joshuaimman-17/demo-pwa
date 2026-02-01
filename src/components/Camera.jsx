import { useState, useRef, useEffect } from 'react'

function Camera() {
    const [isActive, setIsActive] = useState(false)
    const [error, setError] = useState('')
    const videoRef = useRef(null)
    const streamRef = useRef(null)

    const startCamera = async () => {
        try {
            setError('')
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
            setIsActive(true)
        } catch (err) {
            setError(`Camera error: ${err.message}`)
        }
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setIsActive(false)
    }

    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    return (
        <div className="feature-card">
            <h2>Camera Access</h2>

            <div className="video-container">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="video-preview"
                />
            </div>

            <div className="button-group">
                <button
                    onClick={startCamera}
                    disabled={isActive}
                    className="btn btn-primary"
                >
                    Start Camera
                </button>
                <button
                    onClick={stopCamera}
                    disabled={!isActive}
                    className="btn btn-secondary"
                >
                    Stop Camera
                </button>
            </div>

            {error && <div className="error">{error}</div>}
            {isActive && <div className="status">Camera is active</div>}
        </div>
    )
}

export default Camera
