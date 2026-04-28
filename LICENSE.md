# Licenses

> **Scope:** this document is the single source of truth for licensing. Different layers of the project carry different licenses; all of them are listed below.

## License map

| Layer | License | What it covers |
|---|---|---|
| **Code / Platform** | [PolyForm Noncommercial 1.0.0](./LICENSE) | The codebase under `/src`, `/api`, `/supabase` — the hosted Platform |
| **Documentation / Methodology** | CC BY-NC-SA 4.0 (this document, §1 below) | `/docs`, the playbook, the methodology, canvas / blueprint / prose content |
| **AI OS scaffold** | **MIT** (this document, §2 below) | The meta-cognition system prompt distributed via `/ai-os`, plus its derivative prompt suites (Clarity / Iteration / Vibe Code / Design) |
| **Anthropic-derived skills** | MIT (per upstream) | `/.agent/skills/` |
| **Commercial use of code or methodology** | [Distributor Agreement](./DISTRIBUTOR_AGREEMENT.md) | Path A (subscribe) or Path B (fork + rev-share). Does NOT apply to the AI OS scaffold. |

The AI OS scaffold's MIT license is a deliberate, scoped exception to the broader CC BY-NC-SA on docs. It exists because the AI OS scaffold is a permanent install in the user's own AI environment (Claude / ChatGPT / Gemini), where the personal-vs-commercial-use boundary is structurally unenforceable and the scaffold's value is amplified by maximum permissionlessness.

---

## §1 — Documentation & Methodology · CC BY-NC-SA 4.0

© 2026 Alexander Konstantinov

The documentation and methodology of this work (excluding the AI OS scaffold — see §2) are licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

### You are free to:

- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material

### Under the following terms:

- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- **NonCommercial** — You may not use the material for commercial purposes without explicit permission from the author. Two paths to permitted commercial use:
  1. **Subscribe** to the hosted platform at a tier that grants commercial rights (Locked-in / Founders 50 / Ignition). Your subscription IS your commercial license; no further rev-share applies.
  2. **Fork and self-host** under the [Distributor Agreement](./DISTRIBUTOR_AGREEMENT.md) — 10% rev-share above the $1,000/month free tier.
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

### No additional restrictions

You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

For commercial licensing inquiries beyond the two paths above (enterprise procurement, flat-fee licensing, white-label arrangements), contact Alexander Konstantinov directly — see [`DISTRIBUTOR_AGREEMENT.md`](./DISTRIBUTOR_AGREEMENT.md) §11 (Dual Licensing).

---

## §2 — AI OS Scaffold · MIT License

**Scope.** This MIT license covers, exclusively, the **AI OS scaffold**: the meta-cognition system prompt distributed via the `/ai-os` route of this project, including its derivative prompt suites (Clarity, Iteration, Vibe Code, Design) and any successor versions of the same scaffold. It does NOT cover the codebase that hosts the scaffold (PolyForm-NC, see `LICENSE`), the broader methodology in `/docs` (CC BY-NC-SA, see §1 above), or any other artifact of the project.

**Why a separate license.** The AI OS scaffold is, by design, a permanent install inside the user's own AI environment (Claude / ChatGPT / Gemini / any LLM with a system-prompt slot). Once pasted, distinguishing "personal" from "commercial" use of that thinking environment is structurally impossible and conceptually incoherent — a coach using their upgraded Claude to draft a client proposal cannot meaningfully be policed. MIT honors what the scaffold actually is: a free cognitive upgrade for any user who installs it, including for paid client work, internal company use, derivative tools, and remix into new scaffolds. Attribution is required; control of downstream use is not.

```
MIT License

Copyright (c) 2026 Alexander Konstantinov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**In plain English:** Yours forever. Use it for anything. Keep the attribution. Don't sue if it doesn't work.
