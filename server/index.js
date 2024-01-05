import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import mime from 'mime';
import cors from 'cors';

import { pathToFile, TokenManager, rewriter } from './utils.js';
import config from '../polaris.config.js';

import path from 'node:path';
import http from 'node:http';
import url from 'node:url';
import fs from 'node:fs';

const app = express();
const server = http.createServer();
const bareServer = createBareServer('/bare/');
const mode = (process.argv[2] === 'prod' || process.argv[2] === 'dev' ? process.argv[2] : (process.argv[3] === 'prod' || process.argv[3] === 'dev' ? process.argv[3] : (config.mode === 'prod' || config.mode === 'dev' ? config.mode : 'prod')));
const port = (process.argv[2] !== 'prod' && process.argv[2] !== 'dev' && Boolean(Number(process.argv[2]))) ? process.argv[2] : (Boolean(Number(process.argv[3])) ? process.argv[3] : (Boolean(Number(config.port)) ? config.port : (mode === 'prod' ? 80 : 8080)));
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const swPaths = [
    '/uv/sw.js',
    '/assets/js/offline.js'
];

app.get('/api/favicon', async (req, res) => {
    const request = await fetch(`https://www.google.com/s2/favicons?domain=${req.query.domain}`);
    const imageBuffer = Buffer.from(await request.arrayBuffer());

    res.setHeader('content-type', request.headers.get('content-type'));
    res.end(imageBuffer);
});

app.get('/api/games', (req, res) => {
    /**
     * @type {Array.<{name: string, target: string, image: string, popular: boolean}>}
     */
    const games = JSON.parse(fs.readFileSync(path.join(__dirname, '../static/assets/JSON/games.json')));

    const gamesObject = {
        popular: [],
        all: []
    };

    for (let i = 0; i < games.length; i++) {
        const game = games[i];

        if (game.popular) gamesObject.popular.push({
            name: game.name,
            target: game.target,
            image: `/api/games/${i + 1}/image`
        });

        gamesObject.all.push({
            name: game.name,
            target: game.target,
            image: `/api/games/${i + 1}/image`
        });
    }

    res.json(gamesObject);
});

app.get('/api/games/:id', async (req, res, next) => {
    /**
     * @type {Array.<{name: string, target: string, image: string, popular: boolean}>}
     */
    const games = JSON.parse(fs.readFileSync(path.join(__dirname, '../static/assets/JSON/games.json')));

    if (games[req.params.id - 1]) {
        const game = games[req.params.id - 1];

        game.image = `/api/games/${req.params.id}/image`;
        game.popular = Boolean(game.popular);

        res.json(game);
    } else next();
});

app.get('/api/games/:id/image', async (req, res, next) => {
    /**
     * @type {Array.<{name: string, target: string, image: string, popular: boolean}>}
     */
    const games = JSON.parse(fs.readFileSync(path.join(__dirname, '../static/assets/JSON/games.json')));

    if (games[req.params.id - 1]) {
        if (URL.canParse(games[req.params.id - 1].image)) {
            const request = await fetch(games[req.params.id - 1].image);
            const imageBuffer = Buffer.from(await request.arrayBuffer());

            res.setHeader('content-type', request.headers.get('content-type'));
            res.end(imageBuffer);
        } else res.redirect(games[req.params.id - 1].image);
    } else next();
});

app.get('/api/apps', (req, res) => {
    /**
     * @type {Array.<{name: string, target: string, image: string, popular: boolean}>}
     */
    const apps = JSON.parse(fs.readFileSync(path.join(__dirname, '../static/assets/JSON/apps.json')));

    const appsObject = [];

    for (let i = 0; i < apps.length; i++) {
        const app = apps[i];

        appsObject.push({
            name: app.name,
            target: app.target,
            image: `/api/apps/${i + 1}/image`
        });
    }

    res.json(appsObject);
});

app.get('/api/apps/:id', async (req, res, next) => {
    /**
     * @type {Array.<{name: string, target: string, image: string, popular: boolean}>}
     */
    const apps = JSON.parse(fs.readFileSync(path.join(__dirname, '../static/assets/JSON/apps.json')));

    if (apps[req.params.id - 1]) {
        const app = apps[req.params.id - 1];

        app.image = `/api/apps/${req.params.id}/image`;

        res.json(app);
    } else next();
});

app.get('/api/apps/:id/image', async (req, res, next) => {
    /**
     * @type {Array.<{name: string, target: string, image: string, popular: boolean}>}
     */
    const apps = JSON.parse(fs.readFileSync(path.join(__dirname, '../static/assets/JSON/apps.json')));

    if (apps[req.params.id - 1]) {
        if (URL.canParse(apps[req.params.id - 1].image)) {
            const request = await fetch(apps[req.params.id - 1].image);
            const imageBuffer = Buffer.from(await request.arrayBuffer());

            res.setHeader('content-type', request.headers.get('content-type'));
            res.end(imageBuffer);
        } else res.redirect(apps[req.params.id - 1].image);
    } else next();
});

app.get('/api/cheats', (req, res) => {
    /**
     * @type {Array.<{name: string, target: string, image: string, popular: boolean}>}
     */
    const cheats = JSON.parse(fs.readFileSync(path.join(__dirname, '../static/assets/JSON/cheats.json')));

    const cheatsObject = [];

    for (let i = 0; i < cheats.length; i++) {
        const cheat = cheats[i];

        cheatsObject.push({
            name: cheat.name,
            target: cheat.target,
            image: `/api/cheats/${i + 1}/image`
        });
    }

    res.json(cheatsObject);
});

app.get('/api/cheats/:id', async (req, res, next) => {
    /**
     * @type {Array.<{name: string, target: string, image: string, popular: boolean}>}
     */
    const cheats = JSON.parse(fs.readFileSync(path.join(__dirname, '../static/assets/JSON/cheats.json')));

    if (cheats[req.params.id - 1]) {
        const cheat = cheats[req.params.id - 1];

        cheat.image = `/api/cheats/${req.params.id}/image`;

        res.json(cheat);
    } else next();
});

app.get('/api/cheats/:id/image', async (req, res, next) => {
    /**
     * @type {Array.<{name: string, target: string, image: string, popular: boolean}>}
     */
    const cheats = JSON.parse(fs.readFileSync(path.join(__dirname, '../static/assets/JSON/cheats.json')));

    if (cheats[req.params.id - 1]) {
        if (URL.canParse(cheats[req.params.id - 1].image)) {
            const request = await fetch(cheats[req.params.id - 1].image);
            const imageBuffer = Buffer.from(await request.arrayBuffer());

            res.setHeader('content-type', request.headers.get('content-type'));
            res.end(imageBuffer);
        } else res.redirect(cheats[req.params.id - 1].image);
    } else next();
});

app.get('/cdn/3kh0/*', cors({
    origin: false
}), async (req, res, next) => {
    let reqTarget = `https://codeberg.org/3kh0/3kh0-assets/raw/branch/main/${req.path.replace('/cdn/3kh0/', '')}`;

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
});

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

        if (mime.getType(reqTarget) === 'text/html') data = data + '<script src=\'/assets/js/cdn.inject.js\' preload=\'true\'></script>';

        res.end(data);
    } else next();
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

server.listen(port, () => console.log(`Polaris running\n\nPort: ${server.address().port}\nMode: ${mode === 'dev' ? 'development' : 'production'}\nNode.js: ${process.version}`));