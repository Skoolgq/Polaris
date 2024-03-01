import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import mime from 'mime';
import cors from 'cors';

import { pathToFile, TokenManager, rewriter } from './utils.js';
import config from '../polaris.config.js';
import api from './api.js';

import childProcess from 'node:child_process';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';
import fs from 'node:fs';

const app = express();
const server = http.createServer();
const bareServer = createBareServer('/bare/');
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const packageFile = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));

const swPaths = [
    '/uv/sw.js',
    '/assets/js/offline.js'
];

app.use(express.json());

api(app);

app.get('/cdn/*', cors({
    origin: false
}), async (req, res, next) => {
    const reqTarget = req.path.startsWith('/cdn/3kh0/') ? `https://player.work/${req.path.replace('/cdn/3kh0/', '')}` : `https://raw.githubusercontent.com/Skoolgq/Polaris-Assets/main/${req.path.replace('/cdn/', '')}`;

    try {
        const asset = await fetch(reqTarget);

        if (asset.status == 200) {
            var data = Buffer.from(await asset.arrayBuffer());

            const noRewrite = ['.unityweb'];
            if (!noRewrite.includes(mime.getExtension(reqTarget))) res.writeHead(200, {
                'content-type': mime.getType(reqTarget)
            });

            if (mime.getType(reqTarget) === 'text/html') data = data + '<script src=\'/assets/js/cdn.inject.js\' preload=\'true\'></script>';

            res.end(data);
        } else next();
    } catch {
        res.setHeader('content-type', 'text/html');
        res.status(404).end(await rewriter.html(fs.readFileSync(path.join(__dirname, '../pages/404.html'))));
    }
});

app.get('*', (req, res, next) => {
    if (swPaths.includes(req.path)) res.setHeader('Service-Worker-Allowed', '/');

    next();
});

app.get('/asset', (req, res, next) => {
    if (req.query.asset) {
        const {
            exists,
            path: filePath
        } = pathToFile(req.query.asset, path.join(__dirname, '../static/assets'));

        if (exists) {
            if (filePath.startsWith(path.join(__dirname, '../static/assets'))) res.setHeader('content-type', mime.getType(filePath)).end(fs.readFileSync(filePath));
            else next();
        } else next();
    } else next();
});

app.get('/asset/:token', async (req, res, next) => {
    if (req.params.token && !req.query.asset) {
        if (TokenManager.exists(req.params.token)) {
            const token = TokenManager.get(req.params.token);

            if (TokenManager.get(req.params.token).type === 'asset') {
                TokenManager.delete(req.params.token);

                res.setHeader('content-type', token.data.type);
                res.end(await rewriter.auto(fs.readFileSync(token.data.asset), token.data.type, token.data.asset.replace(path.join(__dirname, '../static'), '')));
            } else next();
        } else next();
    }
});

app.get('/uv/service/*', async (req, res) => res.end(await rewriter.html(fs.readFileSync(path.join(__dirname, '../pages/proxy_404.html')))));
app.get('/dynamic/service/*', async (req, res) => res.end(await rewriter.html(fs.readFileSync(path.join(__dirname, '../pages/proxy_404.html')))));

app.use(async (req, res, next) => {
    if (req.path === '/index') res.redirect('/');
    else {
        const {
            exists,
            path: filePath
        } = pathToFile(req.path, path.join(__dirname, '../static'));

        if (exists) {
            if (req.path.endsWith('.html')) res.redirect(req.path.slice(0, -5));
            else {
                res.setHeader('content-type', mime.getType(filePath));

                if (mime.getType(filePath) === 'text/html') res.end(await rewriter.html(fs.readFileSync(filePath), req.path));
                else if (mime.getType(filePath) === 'text/javascript') res.end(await rewriter.javascript(fs.readFileSync(filePath), req.path));
                else if (mime.getType(filePath) === 'text/css') res.end(await rewriter.css(fs.readFileSync(filePath), req.path));
                else res.sendFile(filePath);
            }
        } else {
            res.setHeader('content-type', 'text/html');
            res.status(404).end(await rewriter.html(fs.readFileSync(path.join(__dirname, '../pages/404.html'))));
        }
    }
});

server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) bareServer.routeRequest(req, res);
    else app(req, res);
});

server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) bareServer.routeUpgrade(req, socket, head);
    else socket.end();
});

server.listen(config.port, () => console.log(`Polaris running\n\nPort: ${server.address().port}\nVersion: ${packageFile.version + (Number(packageFile.version.split('.')[0]) <= 1 ? ' Beta' : '') || 'Unknown'} ${childProcess.execSync('git rev-parse HEAD').toString().trim().slice(0, 7) || 'Unknown'}\nMode: ${config.mode === 'dev' ? 'development' : 'production'}\nAPI Server: ${config.options.api.domain}\nNode.js: ${process.version}`));