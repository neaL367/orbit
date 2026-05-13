/**
 * A lightweight, zero-dependency IndexedDB wrapper for React Query cache persistence.
 */
export function createIndexedDBStorage(dbName = 'orbit-query-cache', storeName = 'query-store') {
    // Only run in the browser
    if (typeof window === 'undefined') {
        return undefined
    }

    const getDB = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
        const request = window.indexedDB.open(dbName, 1)
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(storeName)) {
                request.result.createObjectStore(storeName)
            }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })

    return {
        async getItem(key: string): Promise<string | null> {
            try {
                const db = await getDB()
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(storeName, 'readonly')
                    const store = tx.objectStore(storeName)
                    const req = store.get(key)
                    req.onsuccess = () => resolve(req.result || null)
                    req.onerror = () => reject(req.error)
                })
            } catch {
                return null
            }
        },
        async setItem(key: string, value: string): Promise<void> {
            try {
                const db = await getDB()
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(storeName, 'readwrite')
                    const store = tx.objectStore(storeName)
                    const req = store.put(value, key)
                    req.onsuccess = () => resolve()
                    req.onerror = () => reject(req.error)
                })
            } catch {
                // Ignore errors
            }
        },
        async removeItem(key: string): Promise<void> {
            try {
                const db = await getDB()
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(storeName, 'readwrite')
                    const store = tx.objectStore(storeName)
                    const req = store.delete(key)
                    req.onsuccess = () => resolve()
                    req.onerror = () => reject(req.error)
                })
            } catch {
                // Ignore errors
            }
        }
    }
}
