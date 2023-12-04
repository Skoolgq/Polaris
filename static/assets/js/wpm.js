const loadWorker = async (proxy) => await navigator.serviceWorker.register(`/${proxy}/sw.js`, {
    scope: `/${proxy}/service/`,
});

export {
    loadWorker
};
