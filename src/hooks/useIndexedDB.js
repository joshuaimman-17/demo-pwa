import { openDB } from 'idb'

const DB_NAME = 'NotesDB'
const STORE_NAME = 'notes'
const DB_VERSION = 1

export const useIndexedDB = () => {
    const initDB = async () => {
        return await openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
                }
            }
        })
    }

    const getAllNotes = async () => {
        const db = await initDB()
        return await db.getAll(STORE_NAME)
    }

    const addNote = async (note) => {
        const db = await initDB()
        return await db.add(STORE_NAME, note)
    }

    const deleteNote = async (id) => {
        const db = await initDB()
        return await db.delete(STORE_NAME, id)
    }

    const clearAllNotes = async () => {
        const db = await initDB()
        return await db.clear(STORE_NAME)
    }

    return {
        initDB,
        getAllNotes,
        addNote,
        deleteNote,
        clearAllNotes
    }
}
