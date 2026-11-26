# AT-207 branch policy proposal

Apply to both repositories after review by the coordinator with repository administration authority. This document does not change effective GitHub settings.

- Require PR and up-to-date CI for `develop` and `main`; no direct push or force push. Require reviews and resolved conversations per repository policy.
- Permit Squash & Merge for feature PRs to `develop`; disable merge commits. The squash title must be a Conventional Commit with AT-XXX. Ensure the final author is Víctor M. Reyes <vm.reyesal@gmail.com> and no discretionary AI attribution trailer is added. Preserve mandatory platform/license disclosures.
- Promote a release to `main` by an authorized fast-forward-only mechanism after proving `main` is an ancestor of the release SHA; GitHub's standard PR merge modes cannot preserve this graph automatically. Do not enable this without a tested protected process.
- For hotfixes, use a PR and squash to the target, then reconcile to `develop` without merge commits. Record distinct SHAs. Do not force update protected refs.
- Required checks proposed: App CI verify, secrets, dependency-review, review conversations. Set rules only after confirming check names and permissions on real PR runs.

Synthetic policy examples: a valid `feat(a2ui): add boundary (AT-207)` passes; `Add UI` fails; an unexpected commit author fails. The CI policy script is the executable check. This proposal excludes any effective GitHub configuration change.
