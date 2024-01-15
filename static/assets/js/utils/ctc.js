import EventEmitter from './events.js';
import { uuid } from '../utils.js';

class CrossTabCommunication extends EventEmitter {
    constructor(data) {
        super();

        this.worker = {
            ...new window.Worker('/assets/js/utils/ctc_worker.js', {
                type: 'module'
            }),
            handlers: {},
            handleRequest: (action, handler) => {
                this.worker.handlers[action] = handler;
            },
            send: () => {

            },
            respond: (transactionID, data) => this.worker.postMessage({
                action: 'response',
                transactionID,
                data
            })
        }

        /**
         * @type {{ sync: () => {}, keys: () => Array.<string>, get: (id: string) => { location: string }, register: (data: object) => string, unregister: (id: string) => {} }}
         */
        this.registrar = {
            registrationData: localStorage.getItem('ctc_registration') ? JSON.parse(localStorage.getItem('ctc_registration')) : {},
            sync: () => {
                this.registrar.registrationData = {
                    ...localStorage.getItem('ctc_registration') ? JSON.parse(localStorage.getItem('ctc_registration')) : {},
                    ...this.registrar.registrationData
                };

                localStorage.setItem('ctc_registration', JSON.stringify(this.registrar.registrationData));
            },
            keys: () => Object.keys(this.registrationData.registrationData),
            get: (id) => this.registrar.registrationData[id],
            register: (data) => {
                const id = uuid();

                this.registrar.registrationData[id] = data;

                this.registrar.sync();

                return id;
            },
            unregister: (id) => {
                delete this.registrar.registrationData[id];

                this.registrar.sync();
            }
        };
        this.openConnections = {};
        this.id = this.registrar.register({
            location: location.href,
            ...data || {}
        });

        this.worker.postMessage({
            action: 'id',
            data: this.id
        });

        this.worker.addEventListener('message', async ({ data: message }) => {
            if (this.worker.handlers[message.action]) {
                await this.worker.handlers[message.action]();
            } else throw new Error('Cannot handle ' + message.action);
        });

        localStorage.setItem('ctc_' + this.id, 'open');

        window.addEventListener('beforeunload', (e) => {
            delete this.registrar.registrationData[id];

            this.registrar.registrationData = {
                ...this.registrar.registrationData,
                ...localStorage.getItem('ctc_registration') ? JSON.parse(localStorage.getItem('ctc_registration')) : {}
            };

            localStorage.setItem('ctc_registration', JSON.stringify(this.registrar.registrationData));
        });

        const listener = this.listen(this.id, 'public');

        listener.on('message', (message) => {
            if (message.startsWith('ctc:connection:')) {
                const connection = this.interfaceConnection(message.replace('ctc:connection:', ''));

                this.emit('open', connection);
            }
        });

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('ctc_')) {
                this.registrationData = localStorage.getItem('ctc_registration') ? JSON.parse(localStorage.getItem('ctc_registration')) : {};

                if (key.includes('>')) {
                    if (!Object.keys(this.registrationData).includes(key.replace('ctc_', '').split('>')[0]) || Object.keys(this.registrationData).includes(key.replace('ctc_', '').split('>')[1])) {

                    } else if (!Object.keys(this.registrationData).includes(key.replace('ctc_', '').split('>')[1])) {

                    }
                } else if (!Object.keys(this.registrationData).includes(key.replace('ctc_', ''))) {

                }
            }
        });
    }

    destroy = () => {
        this.worker.terminate();
    }

    deleteChannel = (remoteID, type) => {
        if (this.channelExists(remoteID, type)) {
            localStorage.removeItem(type === 'private' ? 'ctc_connection' + this.id + '>' + remoteID : 'ctc_' + remoteID);
        } else throw new Error('Invalid channel');
    }

    connection = (remoteID, type) => {
        Object.keys(this.openConnections).forEach(key => {
            const connection = this.openConnections[key];
            //console.log(key, connection);
        });
    }

    /**
     * Check if a tab exists
     * @param {string} remoteID The remote client id
     * @returns {boolean}
     */
    exists = (remoteID) => Object.keys(localStorage).includes('ctc_' + remoteID);

    /**
     * Check if a channel exists
     * @param {string} remoteID The remote client id
     * @param {'public' | 'private'} type The type of channel
     * @returns {boolean}
     */
    channelExists = (remoteID, type) => Boolean(localStorage.getItem(type === 'private' ? 'ctc_connection' + this.id + '>' + remoteID : 'ctc_' + remoteID))

    /**
     * Listen for messages on a channel
     * @param {string} remoteID The remote client id
     * @param {'public' | 'private'} type The type of channel
     * @returns {{ on: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, once: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, addEventListener: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, disconnect: () => {} }}
     */
    listen = (remoteID, type) => {
        if (this.channelExists(remoteID, type)) {
            const channel = type === 'private' ? 'ctc_connection' + this.id + '>' + remoteID : 'ctc_' + remoteID;
            var prev = localStorage.getItem(channel);
            const events = new EventEmitter();

            const listener = setInterval(() => {
                if (localStorage.getItem(channel)) {
                    if (prev !== localStorage.getItem(channel)) {
                        prev = localStorage.getItem(channel);

                        events.emit('message', localStorage.getItem(channel));
                    }
                } else {
                    clearInterval(listener);
                    events.emit('disconnect');
                }
            }, 1);

            return {
                ...events,
                disconnect: () => {
                    clearInterval(listener);
                    events.emit('disconnect');
                }
            };
        } else throw new Error('Invalid channel');
    }

    /**
     * Connect to a tab
     * @param {string} remoteID The remote client id
     * @returns {{ on: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, addEventListener: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, once: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, send: (data: string) => {}, disconnect: () => {} }}
     */
    connect = (remoteID) => {
        if (this.exists(remoteID)) {
            localStorage.setItem('ctc_' + remoteID, 'ctc:connection:' + this.id);
            localStorage.setItem('ctc_connection' + this.id + '>' + remoteID, 'open');

            const channel = 'ctc_connection' + this.id + '>' + remoteID;
            const listener = this.listen(remoteID, 'private');
            const events = new EventEmitter();
            var connected = true;

            this.openConnections[remoteID] = {
                type: 'private'
            };

            this.connection(remoteID, 'private');

            listener.on('message', (message) => events.emit('message', message.replace(message.split(':')[0] + ':', '', message.split(':')[0])));
            listener.on('disconnect', () => {
                delete this.openConnections[remoteID];
                events.emit('disconnect');

                connected = false;
            });

            return {
                ...events,
                send: (data) => {
                    if (connected) localStorage.setItem(channel, Number(new Date()) + ':' + data);
                    else throw new Error('Not connected to channel');
                },
                disconnect: () => {
                    if (connected) {
                        listener.disconnect();
                        this.deleteChannel(remoteID, 'private');
                    } else throw new Error('Not connected to channel');
                }
            };
        } else throw new Error('Invalid client');
    }

    /**
     * Answer a connection
     * @param {string} remoteID The remote client id
     * @returns {{ on: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, addEventListener: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, once: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, send: (data: string) => {}, disconnect: () => {}, pipeEvents: (EventEmitter: EventEmitter) => {} }}
     */
    interfaceConnection = (remoteID) => {
        if (this.exists(remoteID)) {
            const channel = 'ctc_connection' + remoteID + '>' + this.id;
            const listener = this.listen(remoteID, 'private');
            const events = new EventEmitter();
            var connected = true;

            this.openConnections[remoteID] = {
                type: 'private'
            };

            this.connection(remoteID, 'private');

            listener.on('message', (message) => events.emit('message', message.replace(message.split(':')[0] + ':', '', message.split(':')[0])));
            listener.on('disconnect', () => {
                delete this.openConnections[remoteID];
                events.emit('disconnect');

                connected = false;
            });

            return {
                ...events,
                send: (data) => {
                    if (connected) localStorage.setItem(channel, Number(new Date()) + ':' + data);
                    else throw new Error('Not connected to channel');
                },
                disconnect: () => {
                    if (connected) {
                        listener.disconnect();
                        this.deleteChannel(remoteID, 'private');
                    } else throw new Error('Not connected to channel');
                },
                /**
                 * @param {EventEmitter} EventEmitter 
                 */
                pipeEvents: (EventEmitter) => {
                    const oldEmitter = events;

                    events.emit = (...args) => {
                        EventEmitter.emit(...args);
                        oldEmitter.emit(...args);
                    };
                }
            };
        } else throw new Error('Invalid client');
    }

    brodcast = (message) => {
        this.registrationData = localStorage.getItem('ctc_registration') ? JSON.parse(localStorage.getItem('ctc_registration')) : {};

        Object.keys(this.registrationData)
            .filter(data => data !== this.id)
            .forEach(remoteClient => this.connect(remoteClient).send(message));
    }
}

class Worker extends EventEmitter {
    constructor() {
        super();

        this.on('message', (data) => {
            if (data.action === 'response') this.emit('response', data.transactionID, data.data);
        });

        this.send('ready');
    }

    localStorage = {
        /**
         * Clear localstorage
         */
        clear: () => this.send({
            action: 'localstorage_clear'
        }),
        /**
         * Get a value from localstorage
         * @param {string} key 
         * @returns {Promise.<string>}
         */
        getItem: async (key) => await this.response(this.send('localstorage_get', {
            key
        })),
        /**
         * Set a value in localstorage
         * @param {string} key 
         * @param {string} value 
         */
        setItem: async (key, value) => this.send('localstorage_set', {
            key,
            value
        }),
        /**
         * Remove a value from localstorage
         * @param {string} key 
         */
        removeItem: async (key, value) => this.send('localstorage_remove', {
            key
        }),
        /**
         * Get the name of a localstorage item by it's numerical id
         * @param {string} key 
         * @returns {Promise.<string>}
         */
        key: async (key) => await this.response(this.send('localstorage_key', {
            key
        }))
    };

    /**
     * Send data to the parent process
     * @param {string} action The action
     * @param {any} data The data to be sent
     * @returns {string} The transaction id
     */
    send = (action, data) => {
        const transactionID = uuid();

        postMessage({
            transactionID,
            action,
            data: data || {}
        });

        return transactionID;
    }

    /**
     * Get a response
     * @param {string} transactionID The transaction id
     * @returns {any}
     */
    response = (transactionID) => new Promise((resolve, reject) => {
        const listener = this.on('message', (data) => {
            if (data.transactionID === transactionID) {
                resolve(data.data);
                this.off('message', listener);
            }
        });
    });
}

export default CrossTabCommunication;
export { CrossTabCommunication, Worker };