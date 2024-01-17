import { Worker } from './ctc.js';

const worker = new Worker();

addEventListener('message', ({ data: message }) => worker.emit('message', message));