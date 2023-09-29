import { createBareServer } from "@tomphttp/bare-server-node";
import http from "node:http";
import express from 'express';
import path from 'node:path';
import mime from 'mime';
import cors from 'cors';
import url from 'url';

const app = express();
const server = http.createServer();
const bareServer = createBareServer("/bare/");
const port = process.env.PORT || process.argv[2] || 8080;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

app.use(express.static(path.join(__dirname, '/static'), { extensions: ['html'] }));

app.get('/cdn/*', cors({ origin: false }), async (req, res, next) => {
    let reqTarget = `https://raw.githubusercontent.com/Skoolgq/Polaris-Assets/main/${req.path.replace('/cdn/', '')}`;
    
    const asset = await fetch(reqTarget);
    if (asset.status == 200) {
        var data = Buffer.from(await asset.arrayBuffer());
        
        const noRewrite = ['.unityweb'];
        if (!noRewrite.includes(mime.getExtension(reqTarget))) res.writeHead(200, {
            'content-type': mime.getType(reqTarget)
        });

        if (mime.getType(reqTarget) === 'text/html') data = data + '<script src="/assets/js/cdn_inject.js" preload="true"></script>';

        res.end(data);
    } else next();
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, './static/', '404.html'));
});

server.on("request", (req, res) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      app(req, res);
    }
});
  
  server.on("upgrade", (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeUpgrade(req, socket, head);
    } else {
      socket.end();
    }
});


server.on("listening", () => {
    // plastics you can modify this urself
    console.log(`Polaris running at localhost:${port}`);
});

server.listen({
    port: port
});
//darian was here
