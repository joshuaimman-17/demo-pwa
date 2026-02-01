import { useState } from 'react'

function Bluetooth() {
    const [devices, setDevices] = useState([])
    const [error, setError] = useState('')
    const [scanning, setScanning] = useState(false)

    const scanDevices = async () => {
        try {
            setError('')
            setScanning(true)

            if (!navigator.bluetooth) {
                throw new Error('Web Bluetooth API not supported')
            }

            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['battery_service', 'device_information']
            })

            setDevices(prev => {
                const exists = prev.find(d => d.id === device.id)
                if (exists) return prev
                return [...prev, { id: device.id, name: device.name || 'Unknown Device' }]
            })
        } catch (err) {
            if (err.name !== 'NotFoundError') {
                setError(`Bluetooth error: ${err.message}`)
            }
        } finally {
            setScanning(false)
        }
    }

    const clearDevices = () => {
        setDevices([])
        setError('')
    }

    return (
        <div className="feature-card">
            <h2>Bluetooth Scanner</h2>

            <div className="button-group">
                <button
                    onClick={scanDevices}
                    disabled={scanning}
                    className="btn btn-primary"
                >
                    {scanning ? 'Scanning...' : 'Scan Devices'}
                </button>
                <button
                    onClick={clearDevices}
                    className="btn btn-secondary"
                >
                    Clear List
                </button>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="device-list">
                <h3>Found Devices ({devices.length})</h3>
                {devices.length === 0 ? (
                    <p className="empty-state">No devices found. Click scan to search.</p>
                ) : (
                    <ul>
                        {devices.map(device => (
                            <li key={device.id} className="device-item">
                                <span className="device-name">{device.name}</span>
                                <span className="device-id">{device.id}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default Bluetooth
