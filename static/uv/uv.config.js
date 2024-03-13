self.__uv$config = {
    prefix: '/uv/service/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    client: '/uv/uv.client.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js'
};

/**
 * The storage interface for polaris
 * @param {string} containerName 
 *
const storage = (containerName) => {
    return {
        /**
         * Get a value from the storage container
         * @param {string} name The name of the value
         * @returns {string}
         *
        get: (name) => {
            if (!localStorage.getItem(containerName)) localStorage.setItem(containerName, JSON.stringify({}));
            else {
                try {
                    JSON.parse(localStorage.getItem(containerName));
                } catch (e) {
                    localStorage.setItem(containerName, JSON.stringify({}));
                }
            }

            const container = JSON.parse(localStorage.getItem(containerName));
            return container[name];
        },
        /**
         * Set a value from a storage container
         * @param {string} name The name of the value
         * @param {string | object} value The value to be set
         *
        set: (name, value) => {
            if (!localStorage.getItem(containerName)) localStorage.setItem(containerName, JSON.stringify({}));
            else {
                try {
                    JSON.parse(localStorage.getItem(containerName));
                } catch (e) {
                    localStorage.setItem(containerName, JSON.stringify({}));
                }
            }

            const container = JSON.parse(localStorage.getItem(containerName));
            container[name] = value;

            localStorage.setItem(containerName, JSON.stringify(container));
        }
    };
};

const setTransport = (name, options) => {
    const transports = {
        'epoxy': {
            src: '/epoxy/index.js',
            id: 'EpxMod.EpoxyClient',
            options: {
                wisp: location.origin.replace('http', 'ws') + '/wisp/'
            }
        },
        'libcurl': {
            src: '/libcurl/index.cjs',
            id: 'CurlMod.LibcurlClient',
            options: {
                wisp: location.origin.replace('http', 'ws') + '/wisp/',
                wasm: location.origin + '/libcurl/libcurl.wasm'
            }
        },
        'bare': {
            src: '/assets/js/bare-transport.js',
            id: 'BareMod.BareClient',
            options: location.origin + '/bare/'
        }
    };

    if (!Object.keys(transports).includes(name)) throw 'Invalid Transport';

    const transport = transports[name];

    BareMux.SetTransport(transport.id, options || transport.options);
}

const settingsStorage = storage('settings');

setTransport((settingsStorage.get('proxy') || '').split(':')[1] || 'libcurl');*/