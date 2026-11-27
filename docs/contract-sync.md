# Coupled API contract update

The API `develop` branch owns the canonical deterministic OpenAPI artifact. The app tracks its exact bytes and generated TypeScript clients. The current approved app pair uses API commit `248ca4b69eb135ebff0b80fa61fb55598ba0bbb6` and SHA-256 `86b72b468097253a178c8cf33d09f6ef2b10196943b46a623fca2eea0436ac06` for `contracts/openapi.json`. It contains `GET /health` and `POST /v1/chat/intake-preview`.

## CI provenance gate

`scripts/check-canonical-api.mjs` fetches only `refs/heads/develop` from fixed `https://github.com/oicrruf/estimate-api.git` into a temporary Git repository. It requires the fetched commit to descend the approved SHA, reads the Git-tracked `contracts/openapi.json` blobs at both commits, and compares them byte for byte with this app's tracked artifact. It then runs the existing generated-client check. CI does not check out, install, or execute code from the API repository. API CI independently validates its tracked artifact against the FastAPI export. A same-content descendant passes; a divergent ref or changed blob fails.

Run `node scripts/check-canonical-api.mjs` to check the live canonical ref. `npm run contract:check` also runs isolated synthetic positive and negative Git-history tests. Fetch failure, a missing approved commit, or a missing blob is a gate failure.

## Intentional contract changes

1. Complete the reviewed API PR and verify its actual squash SHA on `develop`. Confirm API CI validated the deterministic export. Review the tracked OpenAPI diff from the last approved commit.
2. In a new app feature branch, update `contracts/openapi.json` from that approved API commit and run `npm run contract:generate` to check or update `src/app/api/health.generated.ts` as needed. Adapt the generators and typed clients for any intentional contract change and add positive and negative tests.
3. Advance the immutable approved SHA in `scripts/check-canonical-api.mjs` in the same reviewed app PR. Run `npm ci && npm run check` and the live canonical lineage check. Record the API PR, integrated SHA, artifact digest, app PR, and test evidence in both PRs.
4. Merge the app only after its CI fetches current canonical `develop`, proves ancestry and byte agreement, and passes the generated-client check. If API `develop` moves without changing OpenAPI bytes, the gate continues to pass; if the bytes change, stop for a coordinated contract update.

The AT-207 bootstrap contract contains only OpenAPI 3.1, info version `0.1.0`, and `GET /health`. Add no domain endpoints without their owning issue and reviewed cross-repo spec. Never copy secrets or private fixtures into either public repository.

## AT-237 transition

The reviewed intake preview fixture now matches the approved two-route artifact byte for byte. The health generator accepts either the historical AT-207 health-only shape or the current shape with the reviewed `POST /v1/chat/intake-preview` operation; it does not advance the canonical SHA or admit a different operation. The synthetic lineage test checks both the old-pin rejection and the preview-pin acceptance in either phase. The generated preview validator requires own schema and value properties and rejects inherited object properties.

API PR #37 was integrated at the commit recorded above. This app PR copied its tracked artifact and advanced `APPROVED_SHA` together, keeping the canonical remote fixed. For a future contract change, follow the intentional update steps above; never use a local rehearsal SHA as the approved pin.
