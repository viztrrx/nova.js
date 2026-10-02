# Safe Proxy Lab

A small, from-scratch browser-style proxy laboratory inspired by the *architecture* of Ultraviolet and Scramjet: a browser UI, service-worker interception, and a server transport boundary.

This is intentionally **not** a drop-in censorship bypass and does not copy their source. It only proxies an explicitly allowlisted local upstream (`127.0.0.1:9090`), making it suitable for learning and testing the mechanics without turning the project into a general-purpose bypass tool.

## Why this architecture

TitaniumNetwork's Ultraviolet uses a service worker to intercept requests and its current package integrates with BareMux. Scramjet uses interception, rewriting, and sandboxing and has a controller/worker split. Their official docs also emphasize that service workers require an appropriate origin/scope. See the official repositories/docs linked below.

## Run

Requirements: Node.js 20+.

```bash
npm install
npm test
npm start
```

In a second terminal, run any simple HTTP server on port 9090, for example:

```bash
python3 -m http.server 9090 --directory ./fixtures
```

Then open `http://127.0.0.1:8080`.

## DevTools loader

On a page you control, the repo includes a tiny loader pattern in `public/injector.js`. It registers the service worker only when the page is same-origin with the loader. A cross-origin page cannot simply install a service worker for another origin; that is a browser security boundary.

For that reason, the exact `fetch(RAWURL).then(r=>r.text()).then(eval)` pattern is not a reliable way to install a proxy on arbitrary third-party pages.

## Design notes

- `public/sw.js`: service-worker interception layer.
- `server.js`: local-only upstream transport boundary.
- `public/index.html`: browser-like toolbar and frame.
- `public/app.js`: navigation/controller layer.
- `test/smoke.test.js`: basic repository checks.

## Upstream projects studied

- Ultraviolet: https://github.com/titaniumnetwork-dev/Ultraviolet
- Ultraviolet docs: https://docs.titaniumnetwork.org/proxies/ultraviolet/
- Scramjet: https://github.com/MercuryWorkshop/scramjet
- Scramjet docs: https://docs.titaniumnetwork.org/proxies/scramjet/

Check their current licenses before distributing modified or bundled code. This repository itself contains no copied Ultraviolet/Scramjet source.
