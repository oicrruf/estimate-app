# Local synthetic scope review preview (AT-248)

This preview is a static, read-only Angular view of one fixture exported through
the integrated API bridge. It is **not** a live project response, approval,
installation assessment, or public API route. The existing `/demo` flow and
home shell remain available.

## Reproduce the fixture

Use the public API repository at commit
`fe9440727636c1b5c89d2f876fa7448a4d4816a7`, in a clean checkout. With
Python 3.12 and the API's `dev` dependencies installed, run from this app root:

```sh
python scripts/export-at248-review.py --api-root /absolute/path/to/estimate-api
python scripts/export-at248-review.py --api-root /absolute/path/to/estimate-api --check
sha256sum public/fixtures/at248-review.v1.json
```

The expected SHA-256 is
`5f868c4a0f9b9d7fd7ff75128855afede337c694f1512fe41fdc9774cf0c827a`.
The exporter rejects a different or dirty API checkout. It calls the actual
`preview_scope_review` service and selects only six bounded candidate lines,
dependency paths, two port checks, questions, and change markers. It sends no
network request and writes no project data.

## Open the preview

```sh
npm ci
npm run demo:local
```

Open `http://127.0.0.1:4200/demo/review`. The page fetches only
`/fixtures/at248-review.v1.json` from the same origin. Switch among the 8 PoE
cameras plus one uplink, missing-evidence, and changed-count controls. The
eight-port total check fails while eight PoE ports pass. Every capacity
evidence status remains unknown. A changed count invalidates the previous
constraint document and shows `document_missing`. There is no save, confirm,
approve, or purchase action.

Run `npm run check` for lint, types, tests, contract, policy, OpenSpec, and build.
The generated canonical OpenAPI and health client are unchanged. AT-209 project
authorization, AT-248 trusted evidence freshness, and AT-254 confirmation are
separate work before a real product flow can use these review states.
