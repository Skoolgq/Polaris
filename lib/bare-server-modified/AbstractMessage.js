"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeResponse = exports.Response = exports.Request = void 0;
const node_stream_1 = require("node:stream");
const headers_polyfill_1 = require("headers-polyfill");
/**
 * Abstraction for the data read from IncomingMessage
 */
class Request {
    body;
    method;
    headers;
    url;
    constructor(body, init) {
        this.body = body;
        this.method = init.method;
        this.headers = new headers_polyfill_1.Headers(init.headers);
        // Parse the URL pathname. Host doesn't matter.
        this.url = new URL(init.path, 'http://bare-server-node');
    }
}
exports.Request = Request;
class Response {
    body;
    status;
    statusText;
    headers;
    constructor(body, init = {}) {
        if (body) {
            this.body = body instanceof node_stream_1.Stream ? body : Buffer.from(body);
        }
        if (typeof init.status === 'number') {
            this.status = init.status;
        }
        else {
            this.status = 200;
        }
        if (typeof init.statusText === 'string') {
            this.statusText = init.statusText;
        }
        this.headers = new headers_polyfill_1.Headers(init.headers);
    }
}
exports.Response = Response;
function writeResponse(response, res) {
    for (const [header, value] of response.headers)
        res.setHeader(header, value);
    res.writeHead(response.status, response.statusText);
    if (response.body instanceof node_stream_1.Stream) {
        const { body } = response;
        res.on('close', () => body.destroy());
        body.pipe(res);
    }
    else if (response.body instanceof Buffer)
        res.end(response.body);
    else
        res.end();
    return true;
}
exports.writeResponse = writeResponse;
//# sourceMappingURL=AbstractMessage.js.map