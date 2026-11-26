# Coupled API contract update

The API `develop` branch owns the canonical deterministic OpenAPI artifact. The app tracks its exact bytes and a generated TypeScript client. The last approved app pair starts at API commit `6ecc9a9c5d6ba6355e3332f8b6533c81ed878b74` and SHA-256 `2e1936350479446e779b01024755738d77e1d0d29bc2f376fcbd897d6ae0873a` for `contracts/openapi.json`.

## CI provenance gate

`scripts/check-canonical-api.mjs` fetches only `refs/heads/develop` from fixed `https://github.com/oicrruf/estimate-api.git` into a temporary Git repository. It requires the fetched commit to descend the approved SHA, reads the Git-tracked `contracts/openapi.json` blobs at both commits, and compares them byte for byte with this app's tracked artifact. It then runs the existing generated-client check. CI does not check out, install, or execute code from the API repository. API CI independently validates its tracked artifact against the FastAPI export. A same-content descendant passes; a divergent ref or changed blob fails.

Run `node scripts/check-canonical-api.mjs` to check the live canonical ref. `npm run contract:check` also runs isolated synthetic positive and negative Git-history tests. Fetch failure, a missing approved commit, or a missing blob is a gate failure.

## Intentional contract changes

1. Complete the reviewed API PR and verify its actual squash SHA on `develop`. Confirm API CI validated the deterministic export. Review the tracked OpenAPI diff from the last approved commit.
2. In a new app feature branch, update `contracts/openapi.json` from that approved API commit and run `npm run contract:generate` to update `src/app/api/health.generated.ts`. Adapt the generator and typed client for any intentional contract change and add positive and negative tests.
3. Advance the immutable approved SHA in `scripts/check-canonical-api.mjs` in the same reviewed app PR. Run `npm ci && npm run check` and the live canonical lineage check. Record the API PR, integrated SHA, artifact digest, app PR, and test evidence in both PRs.
4. Merge the app only after its CI fetches current canonical `develop`, proves ancestry and byte agreement, and passes the generated-client check. If API `develop` moves without changing OpenAPI bytes, the gate continues to pass; if the bytes change, stop for a coordinated contract update.

The AT-207 bootstrap contract contains only OpenAPI 3.1, info version `0.1.0`, and `GET /health`. Add no domain endpoints without their owning issue and reviewed cross-repo spec. Never copy secrets or private fixtures into either public repository.
