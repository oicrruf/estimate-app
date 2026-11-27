# Estimate App

Estimate Agent's Angular frontend currently opens to an accessible, responsive workspace shell with no connected projects or data. The A2UI boundary has an empty message source. Conversational assistance, sign-in, and quoting workflows are not available in this app. The [API architecture decision record](https://github.com/oicrruf/estimate-api/blob/develop/docs/adr/0001-arquitectura-inicial.md) describes the wider design.

## Try what exists today

Use Node 24.15.0 (or a compatible Node 24 release) and npm 11.19.1. From the repository root:

```sh
npm ci
npm start
```

Open the local URL printed by Angular to see the workspace shell. The home page needs no account, API service, or credentials. To run the full local check suite, use `npm run check` as described below.

The repository also contains a **local-only `/demo` prototype** that evaluates synthetic scenarios through a separately running local API. It is not a hosted feature. Follow the [local preview guide](docs/at-278-local-preview.md) for setup and limits; its recorded SHAs and test outcomes describe historical snapshots. Running `npm start` alone does not provide the demo's API responses.

The [synthetic scope review preview](docs/at-248-local-review-preview.md) at
`/demo/review` reads one pinned static fixture exported from the integrated API
bridge. It distinguishes requested, proposed, and pending items and shows
missing evidence. It performs no project mutation or approval.

## API contract

`estimate-api` owns the canonical OpenAPI document. This repository tracks a copy in [`contracts/openapi.json`](contracts/openapi.json) and generates the typed client in [`src/app/api/health.generated.ts`](src/app/api/health.generated.ts). The integrated contract covers only `GET /health`; it does not provide project or quotation endpoints.

The [canonical check](scripts/check-canonical-api.mjs) fetches `estimate-api/develop`, confirms that it descends from the approved commit pinned in that script, and compares the current OpenAPI bytes with both the approved commit and this app's copy. It checks the generated client too. **The live `develop` HEAD need not equal the pin:** a descendant with identical contract bytes passes; a contract change needs a reviewed, coordinated update. API CI separately verifies that its tracked document matches FastAPI's export. Follow the [contract synchronization procedure](docs/contract-sync.md) when the contract changes; the approved reference and its update steps belong in that guide and the check, not in this README.

A separate [intake preview contract guide](docs/intake-preview-contract.md) explains the draft, read-only client and its pinned public fixture. The preview is not wired to the app; its check runs after the canonical contract checks without advancing their approved reference.

## Verify and contribute

```sh
npm run check
```

This runs lint, type checks, unit tests, contract and policy tests, strict OpenSpec validation, and a production build. The [CI phase guide](docs/ci-phases.md) explains each job and how `verify` combines their results. CI also runs the live canonical API check, secret scanning, and dependency review. These checks do not deploy the app.

For behavior changes, follow the OpenSpec sequence: proposal, specification and design, tasks, implementation, verification, and archive. See [AGENTS.md](AGENTS.md) and the [pull request template](.github/pull_request_template.md). In the same PR, update this README or a linked guide when visible behavior, commands, configuration, contracts, tests, or deployment change. If none apply, explain why in the PR. Keep this README as the entry point and the detailed procedures in their guides.
