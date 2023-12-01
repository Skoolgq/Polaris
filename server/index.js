import { createBareServer } from '@tomphttp/bare-server-node';
import { minify } from 'html-minifier';
import { JSDOM } from 'jsdom';
import UglifyJS from 'uglify-js';
import express from 'express';
import mime from 'mime';
import cors from 'cors';

import { pathToFile } from './utils.js';

import path from 'node:path';
import http from 'node:http';
import url from 'node:url';
import fs from 'node:fs';

const app = express();
const server = http.createServer();
const bareServer = createBareServer('/bare/');

const port = process.env.PORT || process.argv[2] || 8080;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

let navbar = fs.readFileSync('./templates/navbar.html', 'utf-8');
let meta = fs.readFileSync('./templates/meta.html', 'utf-8');

/*fs.readdirSync('./pages').forEach(file => {
    let fileData = fs.readFileSync('./pages/' + file, 'utf-8');
    fileData = fileData.replace('<body>', '<body> ' + navbar).replace('</head>', meta + '</head>');
    app.get(`/${file.split('.')[0] === 'index' ? '' : file.split('.')[0]}`, (req, res) => res.status(200).send(fileData));
});*/

//app.use(express.static(path.join(__dirname, '../static'), { extensions: ['html'] }));

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

app.use((req, res, next) => {
    const {
        exists,
        path: filePath
    } = pathToFile(req.path, path.join(__dirname, '../static'));

    res.setHeader('Service-Worker-Allowed', 'true');

    if (exists) {
        res.setHeader('content-type', mime.getType(filePath));

        if (mime.getType(filePath) === 'text/html') {
            const html = fs.readFileSync(filePath).toString().split('<body>');

            html[0] += fs.readFileSync('./templates/navbar.html').toString();

            const dom = new JSDOM(html.join('<body>'));

            dom.window.document.documentElement.querySelectorAll('script').forEach(script => {
                if (script) {

                }
            });

            res.setHeader('content-type', 'text/html');
            res.end(minify(dom.serialize(), {
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
                removeScriptTypeAttributes: true,
                useShortDoctype: true,
                collapseWhitespace: true,
                removeComments: true
            }));
        } else if (mime.getType(filePath) === 'text/javascript') res.end(UglifyJS.minify(fs.readFileSync(filePath).toString()).code);
        else res.sendFile(filePath);
    } else {
        const html = fs.readFileSync(path.join(__dirname, '../pages/404.html')).toString().split('<body>');

        html[0] += fs.readFileSync('./templates/navbar.html').toString()

        res.setHeader('content-type', 'text/html');
        res.end(minify(html.join('<body>'), {
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
            removeScriptTypeAttributes: true,
            useShortDoctype: true,
            collapseWhitespace: true,
            removeComments: true
        }));
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

server.listen(port, () => console.log(`Polaris started! http://localhost:${port}`));