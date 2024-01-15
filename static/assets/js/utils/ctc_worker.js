import { Worker } from './ctc.js';

const worker = new Worker();

addEventListener('message', ({ data: message }) => worker.emit('message', message));

console.log(await worker.localStorage.getItem('settings'));