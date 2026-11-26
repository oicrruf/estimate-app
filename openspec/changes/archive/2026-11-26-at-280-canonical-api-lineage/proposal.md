# AT-280 — Canonical API lineage gate

## Why

The app CI pins `estimate-api/develop` to one exact commit. A later backend commit with byte-identical canonical OpenAPI blocks unrelated app changes.

## What changes

- Read only the tracked OpenAPI blobs from fixed `oicrruf/estimate-api` `develop` and the last approved immutable commit.
- Require the current commit to descend the approved commit and both blobs to match the app reference byte for byte.
- Keep generated TypeScript, PR identity, dependency, and secret gates intact.
- Prove same-content descendant success, changed-contract rejection, and divergent-ref rejection with local synthetic Git histories.

## Impact

Only the app CI contract gate and its maintenance documentation change. No domain API, live service, permission, or deployment changes.
