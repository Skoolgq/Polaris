/**
 * The storage interface for polaris
 * @param {string} containerName 
 */
const storage = (containerName) => {
    return {
        /**
         * Get a value from the storage container
         * @param {string} name The name of the value
         * @returns {string}
         */
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
         */
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

/**
 * Register a proxy service worker
 * @param {'uv' | 'dynamic'} proxy 
 */
const loadProxyWorker = async (proxy) => await navigator.serviceWorker.register(`/${proxy}/sw.js`, {
    scope: `/${proxy}/service/`
});

/**
 * Load the page javascript
 */
const loadPageScript = () => {
    if (location.href) {

    }
};

export default {
    storage,
    loadProxyWorker
};
export {
    storage,
    loadProxyWorker
};