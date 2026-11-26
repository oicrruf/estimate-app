# Coupled API contract update

The API's `develop` branch owns the canonical deterministic OpenAPI artifact. The app tracks its exact bytes and a generated TypeScript client. The current pair is API squash commit `6ecc9a9c5d6ba6355e3332f8b6533c81ed878b74` and SHA-256 `2e1936350479446e779b01024755738d77e1d0d29bc2f376fcbd897d6ae0873a` for `contracts/openapi.json`.

When the API changes, complete its reviewed PR first and verify the actual squash SHA on `develop`. Then, in a new app feature branch:

1. Clone `estimate-api` at current `develop` and record its exact HEAD SHA. Run `uv sync --frozen` and `uv run --no-sync python scripts/openapi.py --check` there to prove the tracked artifact matches FastAPI's export.
2. Copy that checkout's `contracts/openapi.json` into this repo. Review the contract diff, update the pinned SHA in `.github/workflows/ci.yml`, and run `npm run contract:generate` to update `src/app/api/health.generated.ts` from the new reference. Adapt the generator and typed client for any intentional contract change in the same app PR.
3. Run `npm ci && npm run check`. Run `cmp contracts/openapi.json <api-checkout>/contracts/openapi.json` and `node scripts/generate-contract.mjs --check --api-export <api-checkout>/contracts/openapi.json` to check bytes and generated types against the actual API checkout. Add positive and negative contract tests for new behavior.
4. Record the API PR, merged SHA, artifact digest, app PR, and test evidence in both PRs. Merge the app only after its CI fetches the current API `develop`, confirms the pinned SHA, and passes the export, byte, and generated-client checks. If API `develop` has moved, revalidate and update the pin deliberately, even if the JSON bytes are unchanged.

The AT-207 bootstrap contract contains only OpenAPI 3.1, info version `0.1.0`, and `GET /health`. Add no domain endpoints without their owning issue and reviewed cross-repo spec. Never copy secrets or private fixtures into either public repository.
