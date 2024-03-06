import indexedDBExporter from './utils/indexeddb.js';
import EventEmitter from './utils/events.js';
import PolarisError from './utils/error.js';
import cookie from './utils/cookie.js';
import ctc from './utils/ctc.js';

/**
 * The storage interface for polaris
 * @param {string} containerName 
 */
export const storage = (containerName) => {
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
 * @returns {string}
 */
export const uuid = () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

/**
 * Register a proxy service worker
 * @param {'uv' | 'dynamic'} proxy 
 */
export const loadProxyWorker = async (proxy) => await navigator.serviceWorker.register(`/${proxy}/sw.js`, {
    scope: `/${proxy}/service/`
});

/**
Broken

 * Get the current encoding method
 * @param {'uv' | 'dynamic'} proxy 
 * @returns {Promise.<string>}
const getEncodingMethod = (proxy) => {
    return new Promise(async (resolve, reject) => {
        const config = await(await fetch(`/${proxy}/${proxy}.config.js`)).text();

        const Ultraviolet = {
            codec: {
                xor: {},
                base64: {},
                plain: {}
            }
        };

        eval(config);

        const encodingConfig = String(self[`_${proxy}$config`][proxy === 'uv' ? 'encodeUrl' : (proxy === 'dynamic' ? 'encoding' : '')]);
        
        if (proxy === 'uv') resolve(encodingConfig.replace('Ultraviolet.codec.', '').replace('.encode', ''));
        else if (proxy === 'dynamic') resolve(encodingConfig);
    });
}*/

/**
 * WIP
 * 
 * Load the page javascript
 */
const loadPageScript = () => {
    if (location.href) {

    }
};

export const encoder = {
    b64: {
        encode: (data) => btoa(data),
        decode: (data) => atob(data)
    },
    xor: {
        encode: (data, key = 2) => encodeURIComponent(data.split('').map((e, i) => i % key ? String.fromCharCode(e.charCodeAt(0) ^ key) : e).join('')),
        decode: (data, key = 2) => decodeURIComponent(data).split('').map((e, i) => i % key ? String.fromCharCode(e.charCodeAt(0) ^ key) : e).join('')
    }
};

/**
 * Redirect to an external url
 * @param {string} target 
 * @param {{ trusted: boolean }} options 
 */
export const redirect = (target, options) => location.href = `/view?load=${btoa(JSON.stringify({
    target,
    redirect: true,
    trusted: options.trusted
}))}`;

/**
 * Load a url into the view page
 * @param {{ target: string, title: string, return: string, proxied: boolean }} options 
 */
export const createViewPage = (options) => location.href = `/view?load=${btoa(JSON.stringify({
    return: options.return || location.href,
    proxied: options.proxied,
    target: options.target,
    title: options.title,
    image: options.image
}))}`;

/**
 * Check if a url is valid
 * @param {string} url 
 * @returns {boolean}
 */
export const isValidURL = (url) => /^(http(s)?:\/\/)?([\w-]+\.)+[\w]{2,}(\/.*)?$/.test(url);
/**
 * Get the css vh value
 * @param {*} value 
 * @returns {number}
 */
export const getVH = (value) => (value * Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 100;
export const getVW = (value) => (value * Math.max(document.documentElement.clientWidth, window.innerWidth || 0)) / 100;
export const isScrollable = (element) => element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;

/**
 * @param {() => {}} code 
 * @returns {string}
 */
export const evalify = (code) => '(' + String(code) + ')()';

/**
 * @type {import('./utils/ctc.js').CrossTabCommunication}
 */
var CrossTabCommunication;

try {
    CrossTabCommunication = ctc;
} catch { CrossTabCommunication = () => {}; }

export default {
    storage,
    loadProxyWorker,
    encoder,
    redirect,
    createViewPage,
    isValidURL,
    getVH,
    getVW,
    isScrollable,
    indexedDBExporter,
    EventEmitter,
    cookie,
    uuid,
    CrossTabCommunication,
    PolarisError
};

export {
    indexedDBExporter,
    EventEmitter,
    cookie,
    CrossTabCommunication,
    PolarisError
};