# Accept the optional preview quantity

## Why

The reviewed `PreviewProposal` schema requires only `status`; the app parser currently rejects a valid response that omits `availableQuantity`.

## What Changes

Represent the field as optional, accept omission, null, and nonnegative integers, and keep other values or unknown fields invalid. Add synthetic regression tests without wiring the client to a route.
