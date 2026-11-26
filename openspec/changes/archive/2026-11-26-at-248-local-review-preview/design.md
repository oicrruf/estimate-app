# Design

A local export script pins the integrated API commit and invokes its real
`preview_scope_review` service over the checked-in AT-267 synthetic constraint
fixture. It selects only bounded display fields into one versioned static JSON
asset. The Angular preview fetches that asset from the same origin, validates
its shape, and renders requested, proposed and pending lines with explicit
missing-evidence status. It has no mutation command, external URL, API proxy
extension, confirmation button, or generated canonical client change.

The export is reproducible from a clean API checkout. The static fixture is
neither a live project response nor verified production evidence. AT-248's
future trusted evidence path, AT-209 authorization and AT-254 confirmation
remain separate gates.
