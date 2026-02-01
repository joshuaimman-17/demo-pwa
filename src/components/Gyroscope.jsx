import { useState, useEffect } from 'react'

function Gyroscope() {
    const [orientation, setOrientation] = useState(null)
    const [error, setError] = useState('')
    const [active, setActive] = useState(false)

    const handleOrientation = (event) => {
        setOrientation({
            alpha: event.alpha?.toFixed(2) || 0,
            beta: event.beta?.toFixed(2) || 0,
            gamma: event.gamma?.toFixed(2) || 0
        })
    }

    const startGyroscope = async () => {
        try {
            setError('')

            if (typeof DeviceOrientationEvent !== 'undefined' &&
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                const permission = await DeviceOrientationEvent.requestPermission()
                if (permission !== 'granted') {
                    throw new Error('Permission denied')
                }
            }

            window.addEventListener('deviceorientation', handleOrientation)
            setActive(true)
        } catch (err) {
            setError(`Gyroscope error: ${err.message}`)
        }
    }

    const stopGyroscope = () => {
        window.removeEventListener('deviceorientation', handleOrientation)
        setActive(false)
        setOrientation(null)
    }

    useEffect(() => {
        return () => {
            stopGyroscope()
        }
    }, [])

    return (
        <div className="feature-card">
            <h2>Gyroscope / Orientation</h2>

            <div className="button-group">
                <button
                    onClick={startGyroscope}
                    disabled={active}
                    className="btn btn-primary"
                >
                    Start Gyroscope
                </button>
                <button
                    onClick={stopGyroscope}
                    disabled={!active}
                    className="btn btn-secondary"
                >
                    Stop Gyroscope
                </button>
            </div>

            {error && <div className="error">{error}</div>}

            {orientation && (
                <div className="data-display">
                    <div className="data-row">
                        <span className="label">Alpha (Z-axis):</span>
                        <span className="value">{orientation.alpha}°</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Beta (X-axis):</span>
                        <span className="value">{orientation.beta}°</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Gamma (Y-axis):</span>
                        <span className="value">{orientation.gamma}°</span>
                    </div>
                </div>
            )}

            {active && !orientation && (
                <div className="status">Waiting for orientation data...</div>
            )}

            {!active && !orientation && (
                <p className="empty-state">Start gyroscope to see device orientation</p>
            )}
        </div>
    )
}

export default Gyroscope
