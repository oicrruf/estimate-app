# Design

The generator accepts only the exact SHA-256 bytes of the public PR #37 artifact and verifies the single preview operation. It emits TypeScript types and a bounded schema validator. The validator removes known optional `undefined` object properties before validating and serializing; unknown fields, undefined required fields, and invalid array values still fail. String length uses Unicode code points. `contract:check` runs the existing canonical checks first, then an isolated synthetic Git ancestry and preview freshness test. No route calls the client.
