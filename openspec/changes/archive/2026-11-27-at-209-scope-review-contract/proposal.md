# Authenticated scope review preview contract

## Why

The public API draft defines a project-scoped preview that requires authentication and idempotency. The app needs a verifiable typed boundary before its later auth integration.

## What Changes

Prepare an isolated Angular client for the public API PR #39 draft of `POST /v1/projects/{projectId}/scope-review-preview`. The reviewed OpenAPI bytes remain a separate fixture until the API is integrated and the canonical app pin is advanced through its existing process.

The current app has no authenticated project session, so no route SHALL call this client. Tests SHALL use synthetic inputs and an injected HTTP mock only. The current visual routes and canonical health/intake clients remain unchanged.
