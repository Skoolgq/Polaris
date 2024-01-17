import EventEmitter from './events.js';
import { uuid } from '../utils.js';

class CrossTabCommunication extends EventEmitter {
    constructor(data) {
        super();

        this.openConnections = {};
        this.id = this.registrar.register({
            location: location.href,
            ...data
        });

        // Worker stuff
        this.worker.worker.addEventListener('message', async ({ data: message }) => {
            if (this.worker.handlers[message.action]) this.worker.respond(message.transactionID, await this.worker.handlers[message.action](message.data));
        });

        this.worker.handleRequest('init', (message) => {
            return {
                id: this.id
            };
        });

        this.worker.handleRequest('localstorage', (data) => localStorage[data.action](...data.params));
        this.worker.handleRequest('eval', (data) => eval(data));

        localStorage.setItem('ctc_' + this.id, 'open');

        window.addEventListener('beforeunload', (e) => {
            this.registrar.registrationData = localStorage.getItem('ctc_registration') ? JSON.parse(localStorage.getItem('ctc_registration')) : {};

            delete this.registrar.registrationData[this.id];

            localStorage.setItem('ctc_registration', JSON.stringify(this.registrar.registrationData));

            console.log('a');
        });

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('ctc_')) {
                this.registrationData = localStorage.getItem('ctc_registration') ? JSON.parse(localStorage.getItem('ctc_registration')) : {};

                if (key.includes('>')) {
                    if (!Object.keys(this.registrationData).includes(key.replace('ctc_', '').split('>')[0]) || Object.keys(this.registrationData).includes(key.replace('ctc_', '').split('>')[1])) delete this.registrationData[Object.keys(this.registrationData)[key]];
                    else if (!Object.keys(this.registrationData).includes(key.replace('ctc_', '').split('>')[1])) delete this.registrationData[Object.keys(this.registrationData)[key]];
                } else if (!Object.keys(this.registrationData).includes(key.replace('ctc_', ''))) delete this.registrationData[Object.keys(this.registrationData)[key]];


            }
        });
    }

    registrar = {
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

    worker = {
        worker: new window.Worker('/assets/js/utils/ctc_worker.js', {
            type: 'module'
        }),
        handlers: {},
        /**
         * Handle a request
         * @param {string} action The request type
         * @param {(data: any) => {}} handler The handler
         */
        handleRequest: (action, handler) => this.worker.handlers[action] = handler,
        send: (action, data) => {
            const transactionID = uuid();

            postMessage({
                transactionID,
                action,
                data: data
            });

            return transactionID;
        },
        /**
         * Get a response
         * @param {string} transactionID The transaction id
         * @returns {Promise.<any>}
         */
        response: (transactionID) => new Promise((resolve, reject) => {
            const listener = this.worker.worker.addEventListener('message', (data) => {
                if (data.transactionID === transactionID && data.action === 'response') {
                    resolve(data.data);
                    this.worker.worker.removeEventListener('message', listener);
                }
            });
        }),
        /**
         * Respond to a request
         * @param {string} transactionID The transaction id
         * @param {any} data The data to be sent
         */
        respond: (transactionID, data) => this.worker.worker.postMessage({
            action: 'response',
            transactionID,
            data
        })
    }

    destroy = () => {
        this.worker.worker.terminate();
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
    channelExists = (remoteID, type) => Boolean(localStorage.getItem(type === 'private' ? 'ctc_connection' + this.id + '>' + remoteID : 'ctc_' + remoteID));

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

        this.handlers = {};

        this.on('message', async (message) => {
            if (this.handlers[message.action]) this.respond(message.transactionID, await this.handlers[message.action](message.data));
        });

        this.response(this.send('init'))
            .then(message => {
                /**
                 * @type {number}
                 */
                this.id = message.id;

                console.log(this.id);

                this.listen(this.id, 'public')
                    .then((listener) => listener.on('message', (message) => {
                        if (message.startsWith('ctc:connection:')) {
                            const connection = this.interfaceConnection(message.replace('ctc:connection:', ''));

                            this.emit('open', connection);
                        }
                    }));
            });
    }

    localStorage = {
        /**
         * Clear localstorage
         */
        clear: () => this.send('localstorage', {
            action: 'clear',
            params: []
        }),
        /**
         * Get a value from localstorage
         * @param {string} key 
         * @returns {Promise.<string>}
         */
        getItem: async (key) => await this.response(this.send('localstorage', {
            action: 'getItem',
            params: [
                key
            ]
        })),
        /**
         * Set a value in localstorage
         * @param {string} key 
         * @param {string} value 
         */
        setItem: async (key, value) => this.send('localstorage', {
            action: 'setItem',
            params: [
                key,
                value
            ]
        }),
        /**
         * Remove a value from localstorage
         * @param {string} key 
         */
        removeItem: async (key, value) => this.send('localstorage', {
            action: 'removeItem',
            params: [
                key
            ]
        }),
        /**
         * Get the name of a localstorage item by it's numerical id
         * @param {string} key 
         * @returns {Promise.<string>}
         */
        key: async (key) => await this.response(this.send('localstorage', {
            action: 'key',
            params: [
                key
            ]
        }))
    };

    /**
     * Check if a channel exists
     * @param {string} remoteID The remote client id
     * @param {'public' | 'private'} type The type of channel
     * @returns {Promise.<boolean>}
     */
    channelExists = async (remoteID, type) => Boolean(await this.localStorage.getItem(type === 'private' ? 'ctc_connection' + this.id + '>' + remoteID : 'ctc_' + remoteID));

    /**
     * Listen for messages on a channel
     * @param {string} remoteID The remote client id
     * @param {'public' | 'private'} type The type of channel
     * @returns {{ on: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, once: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, addEventListener: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, disconnect: () => {} }}
     */
    listen = async (remoteID, type) => {
        if (await this.channelExists(remoteID, type)) {
            const channel = type === 'private' ? 'ctc_connection' + this.id + '>' + remoteID : 'ctc_' + remoteID;
            var prev = await this.localStorage.getItem(channel);
            const events = new EventEmitter();

            const listener = setInterval(async () => {
                if (await this.localStorage.getItem(channel)) {
                    if (prev !== await this.localStorage.getItem(channel)) {
                        prev = await this.localStorage.getItem(channel);

                        events.emit('message', await this.localStorage.getItem(channel));
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
            data: data
        });

        return transactionID;
    }

    /**
     * Get a response
     * @param {string} transactionID The transaction id
     * @returns {Promise}
     */
    response = (transactionID) => new Promise((resolve, reject) => {
        const listener = this.on('message', (message) => {
            if (message.transactionID === transactionID && message.action === 'response') {
                resolve(message.data);
                this.off('message', listener);
            }
        });
    });

    /**
     * Respond to a request
     * @param {string} transactionID The transaction id
     * @param {any} data The data to be sent
     */
    respond = (transactionID, data) => postMessage({
        action: 'response',
        transactionID,
        data
    });

    /**
     * Handle a request
     * @param {string} action The request type
     * @param {(data: any) => {}} handler The handler
     */
    handleRequest = (action, handler) => this.handlers[action] = handler;
}

export default CrossTabCommunication;
export { CrossTabCommunication, Worker };