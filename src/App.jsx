import { useState } from 'react'
import Camera from './components/Camera'
import Bluetooth from './components/Bluetooth'
import Location from './components/Location'
import Gyroscope from './components/Gyroscope'
import FilePicker from './components/FilePicker'
import Notes from './components/Notes'

function App() {
    const [activeTab, setActiveTab] = useState('camera')

    const tabs = [
        { id: 'camera', label: 'Camera', component: Camera },
        { id: 'bluetooth', label: 'Bluetooth', component: Bluetooth },
        { id: 'location', label: 'Location', component: Location },
        { id: 'gyroscope', label: 'Gyroscope', component: Gyroscope },
        { id: 'files', label: 'Files', component: FilePicker },
        { id: 'notes', label: 'Notes', component: Notes }
    ]

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

    return (
        <div className="app">
            <header className="header">
                <h1>React PWA Demo</h1>
            </header>

            <nav className="nav">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <main className="main">
                {ActiveComponent && <ActiveComponent />}
            </main>
        </div>
    )
}

export default App
