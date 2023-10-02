let workerLoaded = false;
let chosenProxy = 'uv'; // 'dynamic';

let loadWorker = async () => {
    let allWorkers = await navigator.serviceWorker.getRegistrations();
    allWorkers.forEach(worker => worker.unregister());
    await navigator.serviceWorker.register(`/${chosenProxy}-sw.js`, {
        scope: `/${chosenProxy}/service`,
    });    
}

(async () => {
    await loadWorker();
    workerLoaded = true;
})();

export {
    workerLoaded,
    loadWorker,
    chosenProxy
}