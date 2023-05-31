import Easyviolet from 'easyviolet';
import express from 'express';
import url from 'url';
import path from 'node:path';

const app = express();
const ultraviolet = new Easyviolet();
const port = process.env.PORT || process.argv[2] || 8080;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

app.use(ultraviolet.express(app));
app.use(express.static(path.join(__dirname, '/static'), { extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, './static/', '404.html')));
app.use((e, req, res, next) => res.status(500).send(`Something Broke \n\n The error was: ${e.stack}`));

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Polaris is running on port ${server.address().port}, using nodejs ${process.version}`);
});