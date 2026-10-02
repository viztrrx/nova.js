import express from 'express';
import { URL } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 8080);
const upstream = process.env.UPSTREAM || 'http://127.0.0.1:9090';

app.disable('x-powered-by');
app.use(express.static('public'));

app.get('/health', (_req, res) => res.json({ ok: true, mode: 'safe-local-proxy-lab' }));

// Deliberately allowlisted: this demo proxies only the local test origin.
app.all('/proxy/*splat', async (req, res) => {
  try {
    const suffix = req.params.splat ? '/' + req.params.splat : '/';
    const target = new URL(suffix + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''), upstream);
    if (target.origin !== new URL(upstream).origin) return res.status(403).send('Upstream not allowed');

    const init = { method: req.method, headers: {} };
    for (const [k, v] of Object.entries(req.headers)) {
      if (!['host','content-length','connection'].includes(k)) init.headers[k] = v;
    }
    if (!['GET','HEAD'].includes(req.method)) init.body = req;

    const r = await fetch(target, init);
    res.status(r.status);
    r.headers.forEach((v,k) => {
      if (!['content-encoding','content-length','transfer-encoding'].includes(k)) res.setHeader(k,v);
    });
    res.setHeader('x-safe-proxy', 'local-allowlist');
    if (r.body) r.body.pipeTo(new WritableStream({ write(chunk){ res.write(Buffer.from(chunk)); }, close(){ res.end(); }, abort(){ res.end(); } }));
    else res.end();
  } catch (e) {
    res.status(502).json({ error: 'upstream_error', message: String(e.message || e) });
  }
});

app.listen(port, () => console.log(`Safe Proxy Lab listening on http://127.0.0.1:${port}`));
