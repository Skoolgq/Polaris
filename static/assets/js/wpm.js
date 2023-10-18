let workerLoaded = false;
let chosenProxy = 'uv'; // dynamic is broken so dont change this

let loadWorker = async (worker) => {
    let allWorkers = await navigator.serviceWorker.getRegistrations();
    allWorkers.forEach(worker => {
        if (!worker.active?.scriptURL?.includes(chosenProxy)) worker.unregister();
    });

    await navigator.serviceWorker.register(`/${worker || chosenProxy}-sw.js`, {
        scope: `/service/`,
    });
};

(async () => {
    await loadWorker();
    workerLoaded = true;
})();

window.loadWorker = loadWorker;

export {
    workerLoaded,
    loadWorker
};
