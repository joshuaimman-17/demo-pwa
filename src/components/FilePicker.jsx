import { useState } from 'react'

function FilePicker() {
    const [files, setFiles] = useState([])
    const [error, setError] = useState('')

    const openFilePicker = async () => {
        try {
            setError('')

            if ('showOpenFilePicker' in window) {
                const fileHandles = await window.showOpenFilePicker({
                    multiple: true,
                    types: [
                        {
                            description: 'All Files',
                            accept: { '*/*': [] }
                        }
                    ]
                })

                const fileData = await Promise.all(
                    fileHandles.map(async (handle) => {
                        const file = await handle.getFile()
                        return {
                            name: file.name,
                            size: file.size,
                            type: file.type || 'unknown',
                            lastModified: new Date(file.lastModified).toLocaleString()
                        }
                    })
                )

                setFiles(prev => [...prev, ...fileData])
            } else {
                throw new Error('File System Access API not supported. Use file input fallback.')
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(`File picker error: ${err.message}`)
            }
        }
    }

    const handleFileInput = (event) => {
        const selectedFiles = Array.from(event.target.files)
        const fileData = selectedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type || 'unknown',
            lastModified: new Date(file.lastModified).toLocaleString()
        }))
        setFiles(prev => [...prev, ...fileData])
    }

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const clearFiles = () => {
        setFiles([])
        setError('')
    }

    return (
        <div className="feature-card">
            <h2>File Access</h2>

            <div className="button-group">
                <button
                    onClick={openFilePicker}
                    className="btn btn-primary"
                >
                    Open File Picker
                </button>
                <label className="btn btn-secondary file-input-label">
                    Choose Files
                    <input
                        type="file"
                        multiple
                        onChange={handleFileInput}
                        className="file-input-hidden"
                    />
                </label>
                <button
                    onClick={clearFiles}
                    className="btn btn-secondary"
                >
                    Clear List
                </button>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="file-list">
                <h3>Selected Files ({files.length})</h3>
                {files.length === 0 ? (
                    <p className="empty-state">No files selected</p>
                ) : (
                    <ul>
                        {files.map((file, index) => (
                            <li key={index} className="file-item">
                                <div className="file-name">{file.name}</div>
                                <div className="file-meta">
                                    <span>{formatSize(file.size)}</span>
                                    <span>{file.type}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default FilePicker
