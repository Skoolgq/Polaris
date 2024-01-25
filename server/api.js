import config from '../polaris.config.js';

import childProcess from 'node:child_process';
import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const packageFile = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
const commits = await (await fetch(`https://api.github.com/repos/Skoolgq/Polaris/commits`)).json();
var gitSupported = true;

/**
 * @param {import('express').Express} app 
 */
const routes = (app) => {
    app.get('/api/analytics/site/:domain', async (req, res, next) => {
        try {
            const request = await fetch((config.options.api.secure ? 'https' : 'http') + '://' + config.options.api.domain + '/analytics/site/' + req.params.domain);
            const buffer = Buffer.from(await request.arrayBuffer());

            res.header('content-type', request.headers.get('content-type')).end(buffer);
        } catch (e) { next(); }
    });

    app.get('/api/analytics/script.js', async (req, res, next) => {
        try {
            const request = await fetch((config.options.api.secure ? 'https' : 'http') + '://' + config.options.api.domain + '/analytics/script.js');
            const buffer = Buffer.from(await request.arrayBuffer());

            res.header('content-type', request.headers.get('content-type')).end(buffer);
        } catch (e) { next(); }
    });

    app.post('/api/analytics/api/send', async (req, res, next) => {
        try {
            const request = await fetch((config.options.api.secure ? 'https' : 'http') + '://' + config.options.api.domain + '/analytics/api/send', {
                method: 'POST',
                headers: req.headers,
                body: JSON.stringify(req.body)
            });
            const buffer = Buffer.from(await request.arrayBuffer());

            res.header('content-type', request.headers.get('content-type')).end(buffer);
        } catch (e) { next(); }
    });

    app.get('/api/changelog', async (req, res) => {
        const changelog = {
            version: packageFile.version + (Number(packageFile.version.split('.')[0]) <= 1 ? ' Beta' : '') || 'unknown',
            changelog: JSON.parse(fs.readFileSync(path.join(__dirname, '../static/assets/JSON/changelog.json')))
        }

        if (gitSupported) try {
            changelog.commit = {
                sha: childProcess.execSync('git rev-parse HEAD').toString().trim() || 'uknown',
                message: childProcess.execSync('git rev-list --format=%s --max-count=1 HEAD').toString().split('\n')[1].replace('changelog ', '') || 'unknown'
            };

            changelog.upToDate = (commits[0] ? ((commits[0].sha === childProcess.execSync('git rev-parse HEAD').toString().trim()) || false) : false);
        } catch {
            gitSupported = false;

            changelog.commit = {
                sha: 'unknown',
                message: 'unknown',
                upToDate: false
            };
        } else changelog.commit = {
            sha: 'unknown',
            message: 'unknown',
            upToDate: false
        };

        changelog.mode = config.mode === 'dev' ? 'development' : 'production';

        res.json(changelog);
    });

    app.get('/api/favicon', async (req, res) => {
        try {
            const request = await fetch(`https://www.google.com/s2/favicons?domain=${req.query.domain}`);
            const imageBuffer = Buffer.from(await request.arrayBuffer());

            res.setHeader('content-type', request.headers.get('content-type'));
            res.end(imageBuffer);
        } catch (e) {
            res.setHeader('content-type', 'image/png');
            res.end(fs.readFileSync(path.join(__dirname, '../static/assets/img/logo.png')));
        }
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
                try {
                    const request = await fetch(games[req.params.id - 1].image);
                    const imageBuffer = Buffer.from(await request.arrayBuffer());

                    res.setHeader('content-type', request.headers.get('content-type'));
                    res.end(imageBuffer);
                } catch (e) {
                    res.setHeader('content-type', 'image/png');
                    res.end(fs.readFileSync(path.join(__dirname, '../static/assets/img/logo.png')));
                }
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
                try {
                    const request = await fetch(apps[req.params.id - 1].image);
                    const imageBuffer = Buffer.from(await request.arrayBuffer());

                    res.setHeader('content-type', request.headers.get('content-type'));
                    res.end(imageBuffer);
                } catch (e) {
                    res.setHeader('content-type', 'image/png');
                    res.end(fs.readFileSync(path.join(__dirname, '../static/assets/img/logo.png')));
                }
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
                try {
                    const request = await fetch(cheats[req.params.id - 1].image);
                    const imageBuffer = Buffer.from(await request.arrayBuffer());

                    res.setHeader('content-type', request.headers.get('content-type'));
                    res.end(imageBuffer);
                } catch (e) {
                    res.setHeader('content-type', 'image/png');
                    res.end(fs.readFileSync(path.join(__dirname, '../static/assets/img/logo.png')));
                }
            } else res.redirect(cheats[req.params.id - 1].image);
        } else next();
    });
};

export default routes;