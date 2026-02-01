import { useState, useEffect, useRef } from 'react'

function Location() {
    const [location, setLocation] = useState(null)
    const [error, setError] = useState('')
    const [watching, setWatching] = useState(false)
    const watchIdRef = useRef(null)

    const startWatching = () => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported')
            return
        }

        setError('')
        setWatching(true)

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date(position.timestamp).toLocaleTimeString()
                })
            },
            (err) => {
                setError(`Location error: ${err.message}`)
                setWatching(false)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        )
    }

    const stopWatching = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        setWatching(false)
    }

    useEffect(() => {
        return () => {
            stopWatching()
        }
    }, [])

    return (
        <div className="feature-card">
            <h2>Live Location</h2>

            <div className="button-group">
                <button
                    onClick={startWatching}
                    disabled={watching}
                    className="btn btn-primary"
                >
                    Start Tracking
                </button>
                <button
                    onClick={stopWatching}
                    disabled={!watching}
                    className="btn btn-secondary"
                >
                    Stop Tracking
                </button>
            </div>

            {error && <div className="error">{error}</div>}

            {location && (
                <div className="data-display">
                    <div className="data-row">
                        <span className="label">Latitude:</span>
                        <span className="value">{location.latitude.toFixed(6)}°</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Longitude:</span>
                        <span className="value">{location.longitude.toFixed(6)}°</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Accuracy:</span>
                        <span className="value">{location.accuracy.toFixed(2)} meters</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Last Update:</span>
                        <span className="value">{location.timestamp}</span>
                    </div>
                </div>
            )}

            {watching && !location && (
                <div className="status">Waiting for location...</div>
            )}
        </div>
    )
}

export default Location
