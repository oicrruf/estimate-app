# Estimate App agent guide

Work from current `origin/develop` on `feature/AT-XXX-slug`; use one final conventional squash commit per issue. Configure repository-local Git identity `Víctor M. Reyes <vm.reyesal@gmail.com>`. Do not add discretionary AI attribution trailers; preserve required metadata.

For behavior changes: OpenSpec proposal, specs with Given/When/Then, design, tasks, `openspec validate --strict`, implementation, tests, verification, archive, one issue commit and PR. `npm ci && npm run check` is the local gate. Do not close an issue before effective merge and verified CI.

The canonical OpenAPI comes from `estimate-api`, not this repository. Keep `contracts/openapi.json` and `src/app/api/health.generated.ts` together; run `npm run contract:generate` after a reviewed canonical change, then compare the API export with `node scripts/generate-contract.mjs --check --api-export <file>`. Record the backend PR and integrated `develop` SHA in the app PR. Follow `docs/contract-sync.md` to advance the coupled version deliberately. No speculative domain endpoint. A2UI message semantics, auth, Supabase wiring, and bilingual feature work are later issues.

For design uncertainty with high impact, request a fresh-context review when available; medium impact merits targeted review if assumptions are unclear. Low-risk changes use OpenSpec and normal CI. Never claim an independent review that did not occur. Do not store secrets or private datasets in this public repository.
