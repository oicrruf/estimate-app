# Design

Pin the exact public draft OpenAPI by SHA-256 and check its path, operation, bearer security, idempotency header, and request/response schema references in the ordinary contract suite. Implement a separate typed client requiring an explicit authenticated project editor context, idempotency key, base URL, and injected fetch function. There is no default network transport or UI caller.

Validate UUID, bounded nonblank brief, key, and response shape before use. Require explicit pending, review-required, non-persisted, non-commercial response flags even where OpenAPI provides defaults. Map status errors to bounded codes, with a generic 404 that reveals no project existence. Discard response bodies on failure. Use only synthetic fixture and mocked fetch in tests. The existing canonical lineage gate remains unchanged.
