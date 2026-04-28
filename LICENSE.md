# Licenses

> **Scope:** this document is the single source of truth for licensing. Different layers of the project carry different licenses; all of them are listed below.

## License map

| Layer | License | What it covers |
|---|---|---|
| **Code / Platform** | [PolyForm Noncommercial 1.0.0](./LICENSE) | The codebase under `/src`, `/api`, `/supabase` — the hosted Platform |
| **Documentation / Methodology** | CC BY-NC-SA 4.0 (this document, §1 below) | `/docs`, the playbook, the methodology, canvas / blueprint / prose content |
| **AI OS scaffold** | **CC BY-SA 4.0** (this document, §2 below) | The meta-cognition system prompt distributed via `/ai-os`, plus its derivative prompt suites (Clarify · Iterate · Vibe Code · Design) |
| **Anthropic-derived skills** | MIT (per upstream) | `/.agent/skills/` |
| **Commercial use of code or methodology** | [Distributor Agreement](./DISTRIBUTOR_AGREEMENT.md) | Path A (subscribe) or Path B (fork + rev-share). Does NOT apply to the AI OS scaffold — see §2. |

The AI OS scaffold's CC BY-SA 4.0 license is a deliberate, scoped exception to the broader CC BY-NC-SA on docs. It exists because the AI OS scaffold is a permanent install in the user's own AI environment (Claude / ChatGPT / Gemini), where the personal-vs-commercial-use boundary is structurally unenforceable. CC BY-SA blocks the actual threat (proprietary forks / rip-and-resell-as-closed-product) without trapping honest commercial users (e.g., a coach using their upgraded AI for client work).

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

## §2 — AI OS Scaffold · CC BY-SA 4.0

**Scope.** This CC BY-SA 4.0 license covers, exclusively, the **AI OS scaffold**: the meta-cognition system prompt distributed via the `/ai-os` route of this project, including its derivative prompt suites (Clarify · Iterate · Vibe Code · Design) and any successor versions of the same scaffold. It does NOT cover the codebase that hosts the scaffold (PolyForm-NC, see `LICENSE`), the broader methodology in `/docs` (CC BY-NC-SA, see §1 above), or any other artifact of the project.

**Why CC BY-SA specifically.** The AI OS scaffold is, by design, a permanent install inside the user's own AI environment (Claude / ChatGPT / Gemini / any LLM with a system-prompt slot). Once pasted, distinguishing "personal" from "commercial" use of that thinking environment is structurally impossible — a coach using their upgraded Claude to draft a client proposal cannot meaningfully be policed. CC BY-SA admits that reality honestly while still protecting against the actual threat: someone packaging a derivative as a closed proprietary product (e.g., "AI OS Pro") and reselling it. Under CC BY-SA, any such derivative must also be released under CC BY-SA — meaning anyone (including the original author) can copy that derivative and offer it freely or undercut its price, killing the proprietary moat. **Honest commercial use stays free; closed-product reselling has no economic basis.**

**Plain-English summary** (the legal text below is the source of truth — this summary is for orientation):

- ✅ You can: use it, copy it, modify it, distribute it, even sell it — for personal projects, client work, or your own products.
- ✅ Two conditions: (1) keep the author's name on copies you share; (2) if you build a modified version, your version must be released under this same CC BY-SA 4.0 license — so others can build on it too.
- ✅ No warranty. As-is. The usual.
- ✅ Want a proprietary version without the share-alike requirement (e.g., closed integration into a commercial product)? Reach out via [Telegram](https://t.me/integralevolution) for a partnership conversation. That's the per-deal commercial license path.

### Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)

© 2026 Alexander Konstantinov

The AI OS scaffold (as defined above in **Scope**) is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/).

#### You are free to:

- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material **for any purpose, even commercially**

The licensor cannot revoke these freedoms as long as you follow the license terms.

#### Under the following terms:

- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

#### No additional restrictions

You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

#### Notices

- You do not have to comply with the license for elements of the material in the public domain or where your use is permitted by an applicable exception or limitation.
- No warranties are given. The license may not give you all of the permissions necessary for your intended use. For example, other rights such as publicity, privacy, or moral rights may limit how you use the material.
- See [Creative Commons full legal text](https://creativecommons.org/licenses/by-sa/4.0/legalcode) for the canonical legal terms.
