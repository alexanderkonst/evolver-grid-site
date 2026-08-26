# LinkedIn ICP Prospector — Alexander Konstantinov

Portable Tool 1 of the canonical commercial system:

`ICP search → connection → reply → call → offer → payment → delivery → expansion`

## What is canonical here

- Every person has a stable `linkedin:<profileUrn>` identity.
- Search origin and ICP hypothesis are retained rather than overwritten.
- Commercial stages already use the final funnel vocabulary.
- Dedupe preserves later relationship state.
- The default weekly cap is **80**, matching the project's safer operating rule rather than the source guide's 90-request ceiling.

## Run the deterministic tests

```bash
node tools/linkedin-icp-prospector/core.test.mjs
```

## Bind it in Claude

Open a fresh Claude Cowork chat where Connect Safely is available and paste `CLAUDE_HANDOFF.md`. Claude must probe the live tools first and report the exact tool names and response shapes. Bulk searches and connection requests remain human-triggered.

The first live send is intentionally not test-automated: Alexander confirms and initiates it.
