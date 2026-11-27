# Draft intake preview contract

This is a code-only preparation for the public `estimate-api` PR #37 OpenAPI artifact at commit `cc481d3389e45a5aa9154baff7c947510589698c`. Its tracked `contracts/openapi.json` bytes have SHA-256 `86b72b468097253a178c8cf33d09f6ef2b10196943b46a623fca2eea0436ac06` and are copied to `tests/fixtures/at237-preview-openapi.json`. The client is **not connected to any app route** and does not provide sign-in, a live agent, or persistence.

To regenerate from the exact reviewed public commit, from an app checkout with a sibling `estimate-api` checkout containing that commit:

```sh
git -C ../estimate-api show cc481d3389e45a5aa9154baff7c947510589698c:contracts/openapi.json > tests/fixtures/at237-preview-openapi.json
node scripts/generate-intake-preview.mjs --api-export tests/fixtures/at237-preview-openapi.json
npm run contract:check
```

The generator checks the artifact hash and the bounded `POST /v1/chat/intake-preview` operation, then emits the typed client in `src/app/api/intake-preview.generated.ts`. It validates the request and response against the reviewed schemas, omits only recognized optional `undefined` object fields, counts Unicode code points for string bounds, rejects unknown or missing required fields, and requires a pending, non-persisted result. Its fetch request omits credentials. The synthetic lineage test verifies that the **unchanged canonical gate still rejects** a descendant with different OpenAPI bytes, while the preview generator accepts only the reviewed artifact.

`npm run contract:check` runs the existing health and canonical tests first, then the preview fixture test. API PR #37 must be integrated and its current export reviewed before the canonical reference and approved SHA can be advanced in a separate coordinated change. Do not point the live gate at this unmerged commit or treat this client as proof of a running API.
