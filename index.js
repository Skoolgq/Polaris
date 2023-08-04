import Easyviolet from 'easyviolet';
import express from 'express';
import path from 'node:path';
import mime from 'mime';
import cors from 'cors';
import url from 'url';

const app = express();
const port = process.env.PORT || process.argv[2] || 8080;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

app.use(new Easyviolet().express(app));
app.use(express.static(path.join(__dirname, '/static'), { extensions: ['html'] }));

app.get('/cdn/*', cors({ origin: false }), async (req, res, next) => {
    const reqTarget = `https://raw.githubusercontent.com/Skoolgq/Polaris-Assets/main/${req.path.replace('/cdn/', '')}`;

    const asset = await fetch(reqTarget);
    if (asset.status == 200) {
        var data = Buffer.from(await asset.arrayBuffer());

        if (mime.getType(reqTarget) === 'text/html') res.writeHead(200, {
            'content-type': mime.getType(reqTarget)
        });

        if (mime.getType(reqTarget) === 'text/html') data = data + '<script src="/assets/js/cdn_inject.js" preload="true"></script>';

        res.end(data);
    } else {
        next();
    }
});

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, './static/', '404.html')));
app.use((e, req, res, next) => res.status(500).send(`Something Broke \n\n The error was: ${e.stack}`));

const server = app.listen(port, () => {
    console.log(`Polaris is running on port ${server.address().port}, using nodejs ${process.version}`);
});