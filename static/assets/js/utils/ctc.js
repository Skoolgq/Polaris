import { uuid } from '../utils.js';
import EventEmitter from './events.js';

class CrossTabCommunication extends EventEmitter {
    constructor() {
        super();

        this.registrationData = localStorage.getItem('ctc_registration') ? JSON.parse(localStorage.getItem('ctc_registration')) : {};
        this.openConnections = [];
        this.id = uuid();

        this.registrationData[this.id] = {
            location: location.href
        };

        localStorage.setItem('ctc_registration', JSON.stringify(this.registrationData));
        localStorage.setItem('ctc_' + this.id, 'open');

        window.addEventListener('beforeunload', (e) => {
            this.registrationData = localStorage.getItem('ctc_registration') ? JSON.parse(localStorage.getItem('ctc_registration')) : {};

            if (!Object.keys(this.registrationData).length < 0) {
                localStorage.setItem('ctc_registration', JSON.stringify(this.registrationData));
                const storage = localStorage;

                localStorage.clear();

                for (let i = 0; i < Object.keys(storage).filter(data => !data.startsWith('ctc') && data === 'ctc_registration').length; i++) localStorage.setItem(Object.keys(storage)[i], storage[Object.keys(storage)[Object.keys(storage)[i]]]);
            }
        });

        const listener = this.listen(this.id, 'public');

        listener.on('message', (message) => {
            if (message.startsWith('ctc:connection:')) {
                const connection = this.interfaceConnection(message.replace('ctc:connection:', ''));

                this.emit('open', connection);
            }
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
        } else {
            console.log(remoteID, type);

            throw new Error('Invalid channel');
        }
    }

    /**
     * Connect to a tab
     * @param {string} remoteID The remote client id
     * @returns {{ on: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, addEventListener: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, once: (event: 'message' | 'disconnect', callback: (...any) => any) => {}, send: (data: string) => {}, disconnect: () => {} }}
     */
    connect = (remoteID) => {
        if (this.exists(remoteID)) {
            localStorage.setItem('ctc_' + remoteID, 'ctc:connection:' + this.id);
            localStorage.setItem('ctc_connection' + this.id + '>' + remoteID, 'p[em');

            const channel = 'ctc_connection' + this.id + '>' + remoteID;
            const listener = this.listen(remoteID, 'private');
            const events = new EventEmitter();
            var connected = true;

            listener.on('message', (message) => {
                if (message === 'ctc:disconnect') {
                    localStorage.setItem(channel, '');
                    events.emit('disconnect');
                    clearInterval(listener);

                    connected = false;

                    return;
                }

                events.emit('message', localStorage.getItem(channel));
            });

            listener.on('disconnect', () => {
                events.emit('disconnect');

                connected = false;
            });

            return {
                ...events,
                send: (data) => {
                    if (connected) localStorage.setItem(channel, data);
                    else throw new Error('Not connected to channel');
                },
                disconnect: () => {
                    if (connected) {
                        listener.disconnect();
                        localStorage.setItem(channel, 'ctc:disconnect');
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

            listener.on('message', (message) => {
                if (message === 'ctc:disconnect') {
                    localStorage.setItem(channel, '');
                    events.emit('disconnect');
                    clearInterval(listener);

                    connected = false;

                    return;
                }

                events.emit('message', localStorage.getItem(channel));
            });

            listener.on('disconnect', () => {
                events.emit('disconnect');

                connected = false;
            });

            return {
                ...events,
                send: (data) => {
                    if (connected) localStorage.setItem(channel, data);
                    else throw new Error('Not connected to channel');
                },
                disconnect: () => {
                    if (connected) {
                        listener.disconnect();
                        localStorage.setItem(channel, 'ctc:disconnect');
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

export default CrossTabCommunication;
export { CrossTabCommunication };