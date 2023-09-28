import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCompress from '@fastify/compress';
import { createBareServer } from '@tomphttp/bare-server-node';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import mime from 'mime';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || process.argv[2] || 8080;

const bare = createBareServer('/bare/');
const serverFactory = (handler) => {
    return createServer().on("request", (req, res) => {
        if (bare.shouldRoute(req)) bare.routeRequest(req, res);
        else handler(req, res);
    }).on("upgrade", (req, socket, head) => {
        if (bare.shouldRoute(req)) bare.routeUpgrade(req, socket, head);
        else socket.end();
    });
};

const fastify = Fastify({
    serverFactory
});

fastify.register(fastifyStatic, {
    root: join(__dirname, '/static'),
    extensions: ['html']
});

fastify.register(fastifyCompress, {
    encodings: ["br"]
});

fastify.setNotFoundHandler((request, reply) => {
    const notFoundFile = readFileSync('./static/404.html');
    reply.type('text/html').send(notFoundFile);
});

fastify.get('/cdn/*', async (req, res) => {
    let reqTarget = `https://raw.githubusercontent.com/Skoolgq/Polaris-Assets/main/${req.params['*']}`;
    
    const asset = await fetch(reqTarget);
    if (asset.status == 200) {
        var data = Buffer.from(await asset.arrayBuffer());
        
        const noRewrite = ['.unityweb'];
        if (!noRewrite.includes(mime.getExtension(reqTarget))) res.type(mime.getType(reqTarget));

        if (mime.getType(reqTarget) === 'text/html') data = Buffer.concat([data, Buffer.from('<script src="/assets/js/cdn_inject.js" preload="true"></script>')]);
        res.send(data);
    } else res.callNotFound();
});

fastify.listen({
    port,
    host: process.env.NODE_VERSION ? `0.0.0.0` : `localhost` // for render
}, async () => console.log(`Polaris has started!\n   http://localhost:8080`));
