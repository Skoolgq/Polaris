class EventEmitter {
    constructor() {
        this.listeners = {};
    };

    addListener = (eventName, handler) => {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(handler);

        return this;
    };

    on = (eventName, handler) => this.addListener(eventName, handler);

    once = (eventName, handler) => {
        this.listeners[eventName] = this.listeners[eventName] || [];

        const onceWrapper = () => {
            handler();

            this.off(eventName, onceWrapper);
        };

        this.listeners[eventName].push(onceWrapper);

        return this;
    };

    off = (eventName, handler) => this.removeListener(eventName, handler);

    removeListener = (eventName, handler) => {
        let lis = this.listeners[eventName];

        if (!lis) return this;

        for (let i = lis.length; i > 0; i--) {
            if (lis[i] === handler) {
                lis.splice(i, 1);

                break;
            }
        }

        return this;
    };

    emit = (eventName, ...args) => {
        let handlers = this.listeners[eventName];

        if (!handlers) return false;

        handlers.forEach(handler => handler(...args));

        return true;
    };

    listenerCount = (eventName) => {
        let handlers = this.listeners[eventName] || [];

        return handlers.length;
    };

    rawListeners = (eventName) => this.listeners[eventName];
};

export default EventEmitter;
export { EventEmitter };