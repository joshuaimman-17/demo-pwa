import { useState, useEffect } from 'react'
import { useIndexedDB } from '../hooks/useIndexedDB'

function Notes() {
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState('')
    const [error, setError] = useState('')
    const { getAllNotes, addNote, deleteNote, initDB } = useIndexedDB()

    useEffect(() => {
        loadNotes()
    }, [])

    const loadNotes = async () => {
        try {
            await initDB()
            const allNotes = await getAllNotes()
            setNotes(allNotes)
        } catch (err) {
            setError(`Failed to load notes: ${err.message}`)
        }
    }

    const handleAddNote = async () => {
        if (!newNote.trim()) return

        try {
            setError('')
            const note = {
                text: newNote,
                timestamp: Date.now(),
                date: new Date().toLocaleString()
            }
            await addNote(note)
            setNewNote('')
            await loadNotes()
        } catch (err) {
            setError(`Failed to add note: ${err.message}`)
        }
    }

    const handleDeleteNote = async (id) => {
        try {
            setError('')
            await deleteNote(id)
            await loadNotes()
        } catch (err) {
            setError(`Failed to delete note: ${err.message}`)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleAddNote()
        }
    }

    return (
        <div className="feature-card">
            <h2>Notes Storage</h2>

            <div className="note-input-group">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your note..."
                    className="note-input"
                    rows="3"
                />
                <button
                    onClick={handleAddNote}
                    className="btn btn-primary"
                    disabled={!newNote.trim()}
                >
                    Add Note
                </button>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="notes-list">
                <h3>Saved Notes ({notes.length})</h3>
                {notes.length === 0 ? (
                    <p className="empty-state">No notes saved. Add one above!</p>
                ) : (
                    <ul>
                        {notes.map((note) => (
                            <li key={note.id} className="note-item">
                                <div className="note-content">
                                    <p className="note-text">{note.text}</p>
                                    <span className="note-date">{note.date}</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="btn-delete"
                                    aria-label="Delete note"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <p className="info-text">Notes are stored in IndexedDB and persist offline</p>
        </div>
    )
}

export default Notes
