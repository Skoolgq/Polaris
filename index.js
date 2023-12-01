import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import mime from 'mime';
import cors from 'cors';

import url from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const app = express();
const server = http.createServer();
const bareServer = createBareServer('/bare/');

const port = process.env.PORT || process.argv[2] || 8080;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

let navbar = fs.readFileSync(path.join(__dirname, './templates/navbar.html'), 'utf-8');
let meta = fs.readFileSync(path.join(__dirname, './templates/meta.html'), 'utf-8');

fs.readdirSync('./pages').forEach(file => {
    let fileData = fs.readFileSync(path.join(__dirname, './pages/', file), 'utf-8');
    fileData = fileData.replace('<body>', '<body> ' + navbar).replace('</head>', meta + '</head>');
    app.get(`/${file.split('.')[0] === 'index' ? '' : file.split('.')[0]}`, (req, res) => res.status(200).send(fileData));
});

app.use(express.static(path.join(__dirname, '/static')));

app.get('/cdn/*', cors({
    origin: false
}), async (req, res, next) => {
    let reqTarget = `https://raw.githubusercontent.com/Skoolgq/Polaris-Assets/main/${req.path.replace('/cdn/', '')}`;

    const asset = await fetch(reqTarget);
    if (asset.status == 200) {
        var data = Buffer.from(await asset.arrayBuffer());

        const noRewrite = ['.unityweb'];
        if (!noRewrite.includes(mime.getExtension(reqTarget))) res.writeHead(200, {
            'content-type': mime.getType(reqTarget)
        });

        if (mime.getType(reqTarget) === 'text/html') data = data + '<script src=\'/assets/js/cdn_inject.js\' preload=\'true\'></script>';

        res.end(data);
    } else next();
});

let notFoundFile = fs.readFileSync(path.join(__dirname, './pages/404.html'), 'utf-8');
notFoundFile = notFoundFile.replace('<body>', '<body> ' + navbar).replace('</head>', meta + '</head>');
app.use((req, res, next) => res.status(404).send(notFoundFile));

server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) bareServer.routeRequest(req, res);
    else app(req, res);
});

server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) bareServer.routeUpgrade(req, socket, head);
    else socket.end();
});

server.on('listening', () => {
    console.log(`Polaris started! http://localhost:${port}`);
});

server.listen({
    port
});

export default app;
