# App CI phases

The existing workflow triggers, read-only `contents` permission, Node `24.15.0`, and protected `verify` context remain. Each visible phase uses `npm ci` from the lockfile; setup-node's npm cache avoids repeated package downloads.

| Status check | Commands and scope |
| --- | --- |
| `angular-quality` | `npm run lint`, `npm run typecheck` |
| `angular-tests` | `npm run test` |
| `contracts` | `npm run contract:check`, then the fixed-source canonical API lineage check |
| `openspec-metadata` | `npm run policy:check`, `npm run openspec:check`, plus PR-only title and exact-head commit identity validation |
| `production-build` | `npm run build` |
| `secrets` | Existing Gitleaks job, unchanged |
| `dependency-review` | Existing high-severity npm audit job, unchanged |
| `verify` | Protected summary, succeeds only when every preceding job reports `success` |

`verify` uses `always()` and explicitly depends on all seven jobs. A failure, skipped job, cancelled job, missing dependency, or unknown result makes it fail. If the entire workflow is cancelled before the summary can run, the required context cannot turn green. `npm run policy:check` includes synthetic status tests for all seven dependencies. On a push, the PR-specific title and identity step is skipped as before; every other check still runs.

The jobs remain separate to show failures by phase. The existing `npm run check` remains the local one-command equivalent of the app checks. No branch ruleset, deployment, credentials, or API code execution changes are part of this split.
