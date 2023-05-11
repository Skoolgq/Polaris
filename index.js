import http from 'node:http';
import express from 'express';
import * as url from 'url';
import * as path from 'node:path';

//Import proxy scripts
import createBareServer from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';

const app = express();
const server = http.createServer();
const bare = createBareServer('/bare/');
const port = process.env.PORT || process.argv[2] || 8080;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

app.use(express.static(path.join(__dirname, '/static'), { extensions: ['html'] }));
app.use('/uv/', express.static(uvPath));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, './static/', '404.html')));
app.use((e, req, res, next) => res.status(500).send(`Something Broke \n\n The error was: ${e.stack}`));

server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
        bare.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, res) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Polaris is running on port ${server.address().port}, using nodejs ${process.version}`);
});