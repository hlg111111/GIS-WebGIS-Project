import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8080);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.geojson': 'application/geo+json; charset=utf-8' };

const server = http.createServer(async (req, res) => {
  try {
    const requested = decodeURIComponent((req.url || '/').split('?')[0]);
    const relative = requested === '/' ? '/src/index.html' : requested;
    const target = path.resolve(root, `.${relative}`);
    if (!target.startsWith(root)) throw new Error('Forbidden');
    const info = await fs.stat(target);
    if (!info.isFile()) throw new Error('Not a file');
    res.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream' });
    res.end(await fs.readFile(target));
  } catch (error) {
    res.writeHead(error.message === 'Forbidden' ? 403 : 404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error.message === 'Forbidden' ? 'Forbidden' : 'Not found');
  }
});

server.listen(port, () => console.log(`WebGIS running at http://localhost:${port}/src/index.html`));

