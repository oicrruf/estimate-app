# Coupled API contract update

The API `develop` branch owns the canonical deterministic OpenAPI artifact. The app tracks its exact bytes and generated TypeScript clients. The current approved app pair uses API commit `a2b8d9795b73c2e91a1c54029789fd85bbd76fb5` and SHA-256 `0f13af69dfac409072b66a3d75e940c9bc7ea9970ac5788c0fbf1cc1edd8bcf9` for `contracts/openapi.json`. It contains five operations: health, intake preview, authenticated project list/read, and authenticated project scope-review preview. The latter three are not wired to an app route.

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

The reviewed intake preview fixture preserves the historical two-route artifact. The health generator accepts only that exact artifact or the integrated five-route artifact; it does not advance the canonical SHA or admit a different operation. The two-phase test keeps the historical fixture separate after the canonical copy advances. The synthetic lineage test checks old-pin rejection and reviewed-preview acceptance. The generated intake validator requires own schema and value properties and rejects inherited object properties.

API PR #37 previously integrated the two-route artifact at `248ca4b69eb135ebff0b80fa61fb55598ba0bbb6`. API PR #39 integrated the current five-route artifact at the commit recorded above. The app copied each tracked artifact and advanced `APPROVED_SHA` only after its API merge, keeping the canonical remote fixed. For a future contract change, follow the intentional update steps above; never use a local rehearsal SHA as the approved pin.
