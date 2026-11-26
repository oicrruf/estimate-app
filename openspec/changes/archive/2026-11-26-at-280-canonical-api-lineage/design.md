# Design

CI fetches only `refs/heads/develop` from a fixed canonical API HTTPS remote into a temporary Git repository without checking out files. It uses `git merge-base --is-ancestor` against approved SHA `6ecc9a9c5d6ba6355e3332f8b6533c81ed878b74`, then reads `contracts/openapi.json` blobs with `git show`. The approved blob, current blob, and app-tracked artifact must have identical bytes. The existing generator check validates the tracked TypeScript client from that artifact. No code from the API repository is installed or executed; the API's own CI owns export validation.

Synthetic local histories exercise an equal-content descendant, a changed-content descendant, and a divergent commit with equal content. Temporary directories are deleted after each run. Fetch failures and missing blobs fail closed.
