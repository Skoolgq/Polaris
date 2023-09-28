import { createBareServer } from "@tomphttp/bare-server-node";
import { createServer } from "node:http";
import express from 'express';
import path from 'node:path';
import mime from 'mime';
import cors from 'cors';
import url from 'url';

const app = express();
const server = createServer();
const bare = createBareServer("/bare/");
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

server.on("request", (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

server.listen({
    port,
  });
