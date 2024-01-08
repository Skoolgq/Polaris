/*
Modified version of Polarisation's indexeddb importer and exporter library.
https://github.com/Polarisation/indexeddb-export-import 
*/

/**
 * Export all data from an IndexedDB database
 * @param {IDBDatabase} idbDatabase - to export from
 * @returns {Promise}
 */
const exportToJsonString = (idbDatabase) => new Promise(async (resolve, reject) => {
    const exportObject = {};
    const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
    const size = objectStoreNamesSet.size;

    if (size === 0) resolve(JSON.stringify(exportObject));
    else {
        const objectStoreNames = Array.from(objectStoreNamesSet);
        const transaction = idbDatabase.transaction(objectStoreNames, 'readonly');
        transaction.onerror = (e) => reject(e);

        objectStoreNames.forEach((storeName) => {
            const allObjects = [];

            transaction
                .objectStore(storeName)
                .openCursor()
                .onsuccess = (e) => {
                    const cursor = e.target.result;

                    if (cursor) {
                        allObjects.push(cursor.value);
                        cursor.continue();
                    } else {
                        exportObject[storeName] = allObjects;

                        if (objectStoreNames.length === Object.keys(exportObject).length) resolve(JSON.stringify(exportObject));
                    }
                };
        });
    }
});

/**
 * Import data from JSON into an IndexedDB database. This does not delete any existing data
 *  from the database, so keys could clash.
 *
 * Only object stores that already exist will be imported.
 *
 * @param {IDBDatabase} idbDatabase - to import into
 * @param {string} jsonString - data to import, one key per object store
 * @return {Promise}
 */
const importFromJsonString = (idbDatabase, jsonString) => new Promise(async (resolve, reject) => {
    const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
    const size = objectStoreNamesSet.size;

    if (size === 0) resolve('{}');
    else {
        const objectStoreNames = Array.from(objectStoreNamesSet);
        const transaction = idbDatabase.transaction(objectStoreNames, 'readwrite');

        transaction.onerror = (e) => reject(e);

        const importObject = JSON.parse(jsonString);

        Object.keys(importObject).forEach((storeName) => {
            if (!objectStoreNames.includes(storeName)) delete importObject[storeName];
        });

        if (Object.keys(importObject).length === 0) resolve('{}');

        objectStoreNames.forEach((storeName) => {
            let count = 0;

            const aux = Array.from(importObject[storeName] || []);

            if (importObject[storeName] && aux.length > 0) aux.forEach((toAdd) => {
                const request = transaction.objectStore(storeName).add(toAdd);

                request.onsuccess = () => {
                    count++;

                    if (count === importObject[storeName].length) {
                        delete importObject[storeName];

                        if (Object.keys(importObject).length === 0) resolve('{}');
                    }
                };

                request.onerror = (e) => reject(e);
            });
            else {
                if (importObject[storeName]) {
                    delete importObject[storeName];

                    if (Object.keys(importObject).length === 0) resolve('{}');
                }
            }
        });
    }
});

/**
 * Clears a database of all data.
 *
 * The object stores will still exist but will be empty.
 *
 * @param {IDBDatabase} idbDatabase - to delete all data from
 * @return {Promise}
 */
const clearDatabase = (idbDatabase) => new Promise(async (resolve, reject) => {
    const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
    const size = objectStoreNamesSet.size;

    if (size === 0) resolve('{}');
    else {
        const objectStoreNames = Array.from(objectStoreNamesSet);
        const transaction = idbDatabase.transaction(
            objectStoreNames,
            'readwrite'
        );

        transaction.onerror = (e) => reject(e);

        let count = 0;

        objectStoreNames.forEach((storeName) => transaction
            .objectStore(storeName)
            .clear()
            .onsuccess = () => {
                count++;

                if (count === size) resolve('{}');
            });
    }
});

export default { exportToJsonString, importFromJsonString, clearDatabase };
export { exportToJsonString, importFromJsonString, clearDatabase };