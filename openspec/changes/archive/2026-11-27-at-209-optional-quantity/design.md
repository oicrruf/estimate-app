# Design

Allow one optional own field when validating the proposal object. Preserve the exact required top-level response keys and the proposal's required `status`. Validate a present `availableQuantity` against the schema's nonnegative integer or null branches. Return the optional field unchanged instead of manufacturing a value absent from the response.
