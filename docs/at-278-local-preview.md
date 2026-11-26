# AT-278: Run the local synthetic preview

This is a **local, read-only prototype**, not a hosted demo or the production API. It uses fictional products, inventory, offers, prices, and evidence. It does not create projects, quotes, or purchases, and needs no account or credentials. The `/demo` controls currently have Spanish labels.

## Quickstart from clean checkouts

The pair below was tested together on 26 November 2026. Checking out these commits reproduces that pair even if `develop` later advances. For a newer pair, use both repositories' current `develop` and repeat the checks below; do not assume an old result applies to changed code.

| Repository                                              | Reviewed `develop` commit                  |
| ------------------------------------------------------- | ------------------------------------------ |
| [estimate-api](https://github.com/oicrruf/estimate-api) | `3cd1e27cee6f096777848dbcd2b79844032f8f78` |
| [estimate-app](https://github.com/oicrruf/estimate-app) | `7254e23acf3511d6db3a92d609895a9ea6dca548` |

Prerequisites: Python 3.12.14 and `uv` 0.7.6, as pinned in the [API CI workflow](https://github.com/oicrruf/estimate-api/blob/develop/.github/workflows/ci.yml); Node 24.15.0 and npm 11.19.1, as specified by the [app CI workflow](../.github/workflows/ci.yml) and [`package.json`](../package.json). The first dependency install needs access to the package registries. The smoke test recorded below used Python 3.12.14, `uv` 0.13.9, Node 24.22.3, and npm 11.19.1; the repository CI pins are the recommended versions.

In terminal 1, seed a disposable Relate graph and start the separate preview API:

```sh
git clone https://github.com/oicrruf/estimate-api.git
cd estimate-api
git checkout 3cd1e27cee6f096777848dbcd2b79844032f8f78
uv sync --frozen --extra demo
STORE_DIR=$(mktemp -d)
uv run --frozen --extra demo python -m demo.agent.cli seed --store "$STORE_DIR/graph.rl"
uv run --frozen --extra demo python -m demo.preview_api --store "$STORE_DIR/graph.rl" --port 8001
```

In terminal 2, start the Angular development server:

```sh
git clone https://github.com/oicrruf/estimate-app.git
cd estimate-app
git checkout 7254e23acf3511d6db3a92d609895a9ea6dca548
npm ci
npm run demo:local
```

Open **http://127.0.0.1:4200/demo**. Choose `Cámara PoE`, select `2 cámaras`, then `4 cámaras`, and click `Evaluar fixture` after each choice: two are available, while four exceed the shared stock. Choose `Switch PoE`, evaluate `8 puertos`, then `12 puertos`: SW-16 qualifies at eight and no switch qualifies at twelve. `UPS` is technically compatible but has no offer. Expand `Ver … rutas de evidencia` to inspect the supporting graph paths.

Angular proxies only `/v1/demo` to `127.0.0.1:8001` through [`proxy.conf.cjs`](../proxy.conf.cjs). In browser developer tools, the five evaluations should be same-origin `GET /v1/demo/evaluate` requests. You can also check the real API through that proxy:

```sh
curl -fsS 'http://127.0.0.1:4200/v1/demo/evaluate?scenario=camera&quantity=2'
```

If **8001 is occupied**, use another free local port for `demo.preview_api` and start Angular with the matching override, for example `AT278_PREVIEW_PORT=8011 npm run demo:local`. Keep the [guided BOM preview](https://github.com/oicrruf/estimate-api/blob/develop/demo/guided_bom/README.md), which normally uses 8002, separate from this `/demo` flow. The proxy is active during `ng serve`; a static build alone does not connect this preview API. See the [API preview contract](https://github.com/oicrruf/estimate-api/blob/develop/demo/PREVIEW_HTTP.md) for inputs and response details.

## Verification and scope

Run `npm run check` in the app checkout and `uv run --frozen --extra dev --extra demo pytest -q tests/at278` in the API checkout for their respective automated checks. The app unit tests use typed doubles; the HTTP and Chromium observations below also exercised the real seeded API. Stop the API and evaluate again to see an error instead of a fabricated result. The store is a disposable local fixture; remove its temporary directory when finished.

**Observed on the reviewed pair:** a fresh seed contained 60 nodes and 61 relationships. Port 8001 was occupied in the test environment, so the real API and same-origin Angular proxy used 8011. HTTP returned 200 for all five scenarios: switch 8 selected SW-16, switch 12 selected none, camera 2 selected CAM-POE, camera 4 selected none with insufficient stock, and UPS selected none because it had no offer. Headless Chromium visited `/demo`, rendered each scenario and its evidence, and emitted five same-origin GET requests through the proxy. This verifies a local flow on these commits; it does not establish a hosted deployment or production-data behavior.

**Historical draft evidence:** an earlier candidate paired app `7722bb9f6b416c637da1acf8d3fd21a3ed919e16` (plus a port fix) with API `11681c7884c3c9658c4b8d549e1da317eb8d44f0`. That smoke test used port 8002 and checked the same five scenarios, a 422 invalid query, and the UI error after stopping the API. Those draft commits are retained here only as history; use the reviewed pair above to reproduce the current guide.
