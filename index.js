import express from 'express';
import { fileURLToPath } from 'url';
import { join } from 'node:path';

const app = express();
const port = process.env.PORT || 8080;
const __dirname = fileURLToPath(new URL('.', import.meta.url));

app.use(express.static(join(__dirname, '/static'), { extensions: ['html'] }));

app.use((req, res) => res.status(404).sendFile(join(__dirname, './static/', '404.html')));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const server = app.listen(port, () => {
    console.log(`Polaris is running on port ${server.address().port}, using nodejs ${process.version}`);
});
