# AT-281 — visible app CI phases

## Why

The protected `verify` job currently runs all app checks in one long step. A failed phase is hard to locate from the job list.

## What changes

- Split the existing app commands into visible jobs for Angular quality, tests, contracts, OpenSpec and metadata, and production build.
- Preserve `verify` as the protected context, making it an always-run, fail-closed summary of all five phases plus the existing secret and dependency jobs.
- Test synthetic success, failure, skipped, cancelled, and missing results.

## Impact

CI structure, a small local aggregation test, and delivery-gate documentation change. Triggers, permissions, executable versions, command semantics, and protected context remain.
