# Equilibrium Strategy Iteration Button — SOW

## Why This Belongs Here

Equilibrium Box 8 already stores the user's 1-3 current strategies. The new behavior turns each strategy from a static sentence into an iteration object: a user can illuminate the current strategy, see the one-line evolutionary record, edit the proposed next articulation, then accept or dismiss it.

## Planning Scope

- Reuse the AI OS Iterate 2.0 prompt as the product philosophy: the input is the strategy already in context, not a blank prompt requiring paste surgery.
- Keep strategy editing source of truth unchanged: accepted iterations update the existing `equilibrium_strategies` row through the current save path.
- Do not add database tables for v1 of this feature; iteration output is ephemeral until accepted.
- Keep the UI row-level: one Iterate button per filled strategy.

## Implementation Scope

- Add a Supabase edge function that receives the current strategy plus optional Lifelong Dedication and Role context.
- Return strict JSON: one caps strategy tagline, one bottom-line sentence, and one proposed next strategy articulation.
- Add an Iterate control to each filled strategy row.
- Show the caps tagline, the one-line bottom line, an editable proposed strategy text, and `Accept` / `No` actions.
- The proposed strategy text starts with `TAGLINE — ...` so accepted long strategies become scannable in the row.
- On `Accept`, save the proposed text through the existing strategy upsert.
- On `No`, dismiss the suggestion without persisting anything.

## Debugging / DoD

- `npm run build` passes.
- `/build/equilibrium` renders without console/runtime errors.
- Filled strategies show an Iterate button.
- Empty strategy slots do not show Iterate.
- Clicking Iterate shows loading state and handles edge-function errors.
- The iteration output includes a caps tagline that synthesizes the current strategy with high signal-to-noise.
- Accept updates the row using the existing strategy save path.
- No dismisses the suggestion and leaves the original strategy unchanged.
