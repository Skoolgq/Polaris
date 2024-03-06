import Dexie from 'https://esm.sh/dexie@latest/dist/modern/dexie.mjs';

import { isScrollable, storage, indexedDBExporter, cookie, EventEmitter, PolarisError } from './utils.js';
import Theme from './themes.js';

const settingsStorage = storage('settings');

const loadSidebarInterface = () => {
    if (settingsStorage.get('prevent_close')) document.querySelector('#prevent_close').checked = Boolean(settingsStorage.get('prevent_close'));
    if (settingsStorage.get('panic_key')) document.querySelector('#panic_key').value = settingsStorage.get('panic_key');
    if (settingsStorage.get('panic_url')) document.querySelector('#panic_url').value = settingsStorage.get('panic_url');

    document.querySelector('#prevent_close').addEventListener('change', () => settingsStorage.set('prevent_close', document.querySelector('#prevent_close').checked));

    if (settingsStorage.get('cloak')) {
        document.querySelector('#cloak_select').value = settingsStorage.get('cloak');

        if (settingsStorage.get('cloak') == 'custom') {
            document.querySelector('#custom_cloak').classList.remove('hidden');

            document.querySelector('#title').addEventListener('input', () => {
                if (document.querySelector('#title').value) {
                    settingsStorage.set('cloak_title', document.querySelector('#title').value);
                    document.querySelector('title').dataset.value = document.title;
                    document.title = document.querySelector('#title').value;
                } else document.title = document.querySelector('title').dataset.value;
            });

            document.querySelector('#domain').addEventListener('input', () => {
                if (document.querySelector('#domain').value) {
                    settingsStorage.set('cloak_website', document.querySelector('#domain').value);
                    document.querySelector('link[rel=\'shortcut icon\']').href = '/api/favicon?domain=' + document.querySelector('#domain').value;
                } else document.querySelector('link[rel=\'shortcut icon\']').href = '/favicon.ico';
            });

            if (settingsStorage.get('cloak_title')) document.querySelector('#title').value = settingsStorage.get('cloak_title');
            if (settingsStorage.get('cloak_website')) document.querySelector('#domain').value = settingsStorage.get('cloak_website');
        }
    }

    document.querySelector('#proxy_select').addEventListener('change', () => settingsStorage.set('proxy', document.querySelector('#proxy_select').value));

    if (settingsStorage.get('proxy')) document.querySelector('#proxy_select').value = settingsStorage.get('proxy');
    if (navigator.userAgent.includes('Firefox')) document.querySelector('#export_error').innerHTML = 'Your browser does not fully support this feature. Some data may not export.<br><br>';

    document.querySelector('#clear').addEventListener('click', () => {
        const clearEvents = new EventEmitter();
        var clearsFinished = 0;

        const clearData = () => {
            clearsFinished += 1;

            if (clearsFinished === 1) location.reload();
        }

        clearEvents.on('indexedDB', clearData);

        if (!navigator.userAgent.includes('Firefox')) indexedDB.databases()
            .then(dbs => {
                if (dbs.length !== 0) for (let i = 0; i < dbs.length; i++) {
                    const dbInfo = dbs[i];
                    const db = new Dexie(dbInfo.name);

                    db.open()
                        .then(() => indexedDBclearer.clearDatabase(db.backendDB())
                            .then((result) => {
                                if (i + 1 === dbs.length) clearEvents.emit('indexedDB');
                            }));
                } else clearEvents.emit('indexedDB');
            });
        else clearEvents.emit('indexedDB');

        localStorage.clear();
        sessionStorage.clear();
        document.cookie = '';
    });

    document.querySelector('#export').addEventListener('click', () => {
        const CryptoJSScript = document.createElement('script');
        CryptoJSScript.src = 'https://unpkg.com/crypto-js@latest/crypto-js.js';
        document.body.appendChild(CryptoJSScript);

        CryptoJSScript.addEventListener('load', () => {
            const exportEvents = new EventEmitter();
            var exportsFinished = 0;
            /**
             * @type {{ indexedDB: Array<{name: string, data: any}>, cookies: Array<{name: string, data: any}>, localStorage: Array<{name: string, data: any}> }}
             */
            const saveData = {
                indexedDB: [],
                cookies: [],
                localStorage: []
            };

            const exportData = () => {
                exportsFinished += 1;

                if (exportsFinished === 3) {
                    const blobURL = URL.createObjectURL(new Blob([CryptoJS.AES.encrypt(JSON.stringify(saveData), 'polaris')]));

                    const download = document.createElement('a');
                    download.href = blobURL;
                    download.download = `${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getFullYear()}.polarissave`;
                    document.body.appendChild(download);

                    download.click();
                    download.remove();
                    URL.revokeObjectURL(blobURL);
                };
            };

            exportEvents.on('cookies', exportData);
            exportEvents.on('indexedDB', exportData);
            exportEvents.on('localStorage', exportData);

            if (!navigator.userAgent.includes('Firefox')) indexedDB.databases()
                .then(dbs => {
                    if (dbs.length !== 0) for (let i = 0; i < dbs.length; i++) {
                        const dbInfo = dbs[i];
                        const db = new Dexie(dbInfo.name);

                        db.open()
                            .then(() => indexedDBExporter.exportToJsonString(db.backendDB())
                                .then((result) => {
                                    try {
                                        saveData.indexedDB.push({
                                            name: dbInfo.name,
                                            data: result
                                        });
                                    } catch { }

                                    if (i + 1 === dbs.length) exportEvents.emit('indexedDB');
                                }));
                    } else exportEvents.emit('indexedDB');
                });
            else exportEvents.emit('indexedDB');

            if (Object.keys(localStorage).length !== 0) for (let i = 0; i < Object.keys(localStorage).length; i++) {
                saveData.localStorage.push({
                    name: Object.keys(localStorage)[i],
                    data: localStorage.getItem(Object.keys(localStorage)[i])
                });

                if (i + 1 === Object.keys(localStorage).length) exportEvents.emit('localStorage');
            } else exportEvents.emit('localStorage');

            if (Object.keys(cookie.all()).length !== 0) for (let i = 0; i < Object.keys(cookie.all()).length; i++) {
                saveData.localStorage.push({
                    name: Object.keys(cookie.all())[i],
                    data: cookie.get(Object.keys(cookie.all())[i])
                });

                if (i + 1 === Object.keys(cookie.all()).length) exportEvents.emit('cookies');
            } else exportEvents.emit('cookies');
        });
    });

    document.querySelector('#import').addEventListener('click', () => {
        const CryptoJSScript = document.createElement('script');
        CryptoJSScript.src = 'https://unpkg.com/crypto-js@latest/crypto-js.js';
        document.body.appendChild(CryptoJSScript);

        CryptoJSScript.addEventListener('load', () => {
            const uploadInput = document.createElement('input');
            uploadInput.type = 'file';
            uploadInput.style.display = 'none';
            uploadInput.accept = '.polarissave';
            document.body.appendChild(uploadInput);

            uploadInput.click();

            uploadInput.addEventListener('change', (e) => {
                uploadInput.remove();

                const file = e.target.files[0];

                if (!file) {
                    uploadInput.remove();
                    return;
                }

                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        const importEvents = new EventEmitter();
                        var importsFinished = 0;
                        /**
                         * @type {{ indexedDB: Array<{name: string, data: any}>, cookies: Array<{name: string, data: any}>, localStorage: Array<{name: string, data: any}> }}
                         */
                        const saveData = JSON.parse(CryptoJS.AES.decrypt(e.target.result, 'polaris').toString(CryptoJS.enc.Utf8));

                        const importData = () => {
                            importsFinished += 1;

                            location.reload();
                        };

                        importEvents.on('cookies', importData);
                        importEvents.on('indexedDB', importData);
                        importEvents.on('localStorage', importData);

                        if (saveData.indexedDB.length !== 0) for (let i = 0; i < saveData.indexedDB.length; i++) {
                            const dbInfo = saveData.indexedDB[i];
                            const db = new Dexie(dbInfo.name);

                            db.open()
                                .then(() => indexedDBExporter.importFromJsonString(db.backendDB(), dbInfo.data)
                                    .then((result) => {
                                        if (i + 1 === dbs.length) importEvents.emit('indexedDB');
                                    }));
                        } else importEvents.emit('indexedDB');

                        if (saveData.localStorage.length !== 0) for (let i = 0; i < saveData.localStorage.length; i++) {
                            localStorage.setItem(saveData.localStorage[i].name, saveData.localStorage[i].data);

                            if (i + 1 === saveData.localStorage.length) importEvents.emit('localStorage');
                        } else importEvents.emit('localStorage');

                        if (saveData.cookies.length !== 0) for (let i = 0; i < saveData.cookies.length; i++) {
                            cookie.set(saveData.cookies[i].name, saveData.cookies[i].data);

                            if (i + 1 === Object.keys(cookie.all()).length) importEvents.emit('cookies');
                        } else importEvents.emit('cookies');
                    } catch {
                        new PolarisError('Failed to load save file');
                    }
                };

                reader.readAsText(file);
            });
        });
    });

    fetch('/assets/JSON/cloaks.json').then(res => res.json()).then(cloaks => {
        document.querySelector('#cloak_select').addEventListener('change', () => {
            if (document.querySelector('#cloak_select').value == 'custom') {
                settingsStorage.set('cloak', document.querySelector('#cloak_select').value);
                document.querySelector('#custom_cloak').classList.remove('hidden');

                document.querySelector('#title').addEventListener('input', () => {
                    if (document.querySelector('#title').value) {
                        settingsStorage.set('cloak_title', document.querySelector('#title').value);
                        document.querySelector('title').dataset.value = document.title;
                        document.title = document.querySelector('#title').value;
                    } else document.title = document.querySelector('title').dataset.value;
                });

                document.querySelector('#domain').addEventListener('input', () => {
                    if (document.querySelector('#domain').value) {
                        settingsStorage.set('cloak_website', document.querySelector('#domain').value);
                        document.querySelector('link[rel=\'shortcut icon\']').href = '/api/favicon?domain=' + document.querySelector('#domain').value;
                    } else document.querySelector('link[rel=\'shortcut icon\']').href = '/favicon.ico';
                });
            } else if (document.querySelector('#cloak_select').value == 'none') {
                settingsStorage.set('cloak', document.querySelector('#cloak_select').value);

                document.title = document.querySelector('title').dataset.value;
                document.querySelector('link[rel=\'shortcut icon\']').href = '/favicon.ico';
                document.querySelector('#custom_cloak').classList.add('hidden');
            } else {
                if (cloaks[document.querySelector('#cloak_select').value]) {
                    document.querySelector('title').dataset.value = document.title;
                    document.title = cloaks[document.querySelector('#cloak_select').value].title;
                    document.querySelector('link[rel=\'shortcut icon\']').href = cloaks[document.querySelector('#cloak_select').value].icon;
                    settingsStorage.set('cloak', document.querySelector('#cloak_select').value);
                } else new PolarisError(`The cloak ${document.querySelector('#cloak_select').value} does not exist`);

                document.querySelector('#custom_cloak').classList.add('hidden');
            }
        });
    });

    document.querySelector('#reset_panic').addEventListener('click', (e) => {
        settingsStorage.set('panic_key', '');
        document.querySelector('#panic_key').value = 'No Key Selected';
    });

    document.querySelector('#panic_url').addEventListener('input', (e) => settingsStorage.set('panic_url', document.querySelector('#panic_url').value));

    window.addEventListener('keydown', (e) => {
        if (document.querySelector('#panic_key') == document.activeElement) {
            document.querySelector('#panic_key').value = e.key;
            settingsStorage.set('panic_key', document.querySelector('#panic_key').value);
        }
    });

    document.querySelector('#themes').querySelectorAll('button').forEach(el => el.onclick = () => Theme.set(el.innerText.toLocaleLowerCase()));

    if (window.location.hash.slice(1)) {
        document.querySelector('.sidebar').style.transition = 'all 0s ease';
        document.querySelector('.sidebar').classList.add('active');

        setInterval(() => document.querySelector('.sidebar').removeAttribute('style'), 1000);
    }

    if (sessionStorage.getItem('settings-open') === 'true') {
        document.querySelector('.sidebar').style.transition = 'all 0s ease';
        document.querySelector('.sidebar').classList.add('active');

        setInterval(() => document.querySelector('.sidebar').removeAttribute('style'), 1000);

        window.history.pushState({}, '', '#settings');
    }

    document.querySelectorAll('[data-attr=\'sidebar_trigger\']').forEach(el => {
        el.addEventListener('click', (e) => {
            if (document.querySelector('.sidebar').classList.contains('active')) {
                document.querySelector('.sidebar').classList.remove('active');

                setTimeout(() => window.history.pushState({}, '', location.href.split('#')[0]), 50);

                sessionStorage.setItem('settings-open', false);
            } else {
                document.querySelector('.sidebar').classList.add('active');
                sessionStorage.setItem('settings-open', true);
            }
        });
    });

    if (isScrollable(document.querySelector('.sidebar'))) document.querySelector('.scroll').classList.add('active');

    document.querySelector('.scroll').addEventListener('click', () => document.querySelector('.sidebar').scrollTop = document.querySelector('.sidebar').scrollHeight);

    document.querySelector('.sidebar').addEventListener('scroll', () => {
        if (document.querySelector('.sidebar').scrollTop + document.querySelector('.sidebar').clientHeight >= document.querySelector('.sidebar').scrollHeight - 1) document.querySelector('.scroll').classList.remove('active');
        else document.querySelector('.scroll').classList.add('active');
    });

    loadSettings();
};

const loadSettings = () => {
    if (settingsStorage.get('cloak')) {
        if (settingsStorage.get('cloak') == 'custom') {
            if (settingsStorage.get('cloak_title')) {
                document.querySelector('title').dataset.value = document.title;
                document.title = settingsStorage.get('cloak_title');
            }

            if (settingsStorage.get('cloak_website')) document.querySelector('link[rel=\'shortcut icon\']').href = '/api/favicon?domain=' + settingsStorage.get('cloak_website');
        } else fetch('/assets/JSON/cloaks.json')
            .then(res => res.json())
            .then(cloaks => {
                if (cloaks[settingsStorage.get('cloak')]) {
                    document.title = cloaks[settingsStorage.get('cloak')].title;
                    document.querySelector('link[rel=\'shortcut icon\']').href = cloaks[settingsStorage.get('cloak')].icon;
                } else if (settingsStorage.get('cloak') !== 'none') new PolarisError(`The cloak ${settingsStorage.get('cloak')} does not exist`);
            });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === settingsStorage.get('panic_key')) {
            if (settingsStorage.get('panic_url')) window.location.href = settingsStorage.get('panic_url');
        }
    });

    /*if (new URLSearchParams(location.search).get('clickoff')) {

    }*/
};

export default { loadSettings, loadSidebarInterface };
export { loadSettings, loadSidebarInterface };