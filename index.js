import express from 'express';
import * as url from 'url';
import * as path from 'node:path';

const app = express();
const port = process.env.port || 8080;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

app.use(express.static(path.join(__dirname, '/static'), { extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, './static/', '404.html')));

const server = app.listen(port, () => {
    console.log(`Polaris is running on port ${server.address().port}, using nodejs ${process.version}`);
})