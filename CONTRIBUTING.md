# Contributing

> *This project is the master holon of a system meant to be forked. The most useful contribution is often **your own holon**, not a PR back to this one.*

---

## Two ways to participate

### 1. Fork it for yourself or your community

The primary intent of this project is **fractal self-replication**, not centralised contribution. If you've read the [Integration Layer Manifesto](docs/06-architecture/integration_layer_manifesto.md) and the [Planetary OS Assembly](docs/02-strategy/planetary_os_assembly.md) and the frequency lands — fork it, run your own instance, make it sound like *you*. See [Self-Hosting](README.md#self-hosting) in the README.

This is the higher-leverage move. A network of holons each running their own voice is the actual goal — not one canonical repo with many contributors.

### 2. Contribute back to the master holon

If you want to improve the master holon itself — bugfixes, new modules, documentation clarifications, accessibility improvements — PRs are welcome. A few expectations to keep this sustainable:

#### Scope

- **Bug fixes** — always welcome. Open an issue first if the bug isn't obvious.
- **Documentation improvements** — typos, clarifications, missing context — go straight to PR.
- **New features / modules** — open an issue and discuss first. The architecture is opinionated (holonic, AI-native, Specificity Loop-driven). Features that don't fit the frame are better as your own fork.
- **Refactors for refactor's sake** — please don't. The codebase carries founder-voice in its comments and structure on purpose.

#### How to PR

1. Fork the repo
2. Branch from `main`: `git checkout -b your-change-name`
3. Make the change. Keep diffs surgical.
4. **Run the dev server and verify in a browser.** Type-checks pass ≠ feature works. Test the actual flow your change touches.
5. Open a PR with: what changed, why, how to verify.

#### Voice & style

- **Code comments** — the codebase uses comments that name *why*, not *what*, often with date + author tags (e.g. `Day 51 (Sasha 2026-04-25)`). Keep that style — it's load-bearing for navigating the history.
- **Copy** — user-facing text follows the [Specificity Loop](docs/03-playbooks/unique_business_playbook.md#principle-15-the-specificity-loop) frequency: identity-revelation in question form, never instructional. If you change copy, hold the frequency.
- **No emoji** in code unless explicitly requested. None in commit messages.
- **No marketing copy** in commits. Plain English what + why.

#### License

By contributing code, you agree your contribution is licensed under **PolyForm Noncommercial 1.0.0** (matching the rest of the code). By contributing documentation, you agree it's licensed under **CC BY-NC-SA 4.0**. By contributing to the **AI OS scaffold** (the prompt content under `src/modules/ai-os/` distributed via `/ai-os` and its suite sub-routes), you agree your contribution is licensed under **MIT** (matching the scaffold's license — see [`LICENSE.md`](./LICENSE.md) §2). Commercial use of contributed code or methodology (not the AI OS scaffold) is governed by the project's [Distributor Agreement](./DISTRIBUTOR_AGREEMENT.md). There is no CLA — the license model itself is the agreement.

---

## What to expect

This is a personal-scale project run by one founder. Issues and PRs are reviewed best-effort, not on a schedule. If you need a guarantee of response time, this isn't the right fit — fork it instead.

If you're building toward similar territory and want a real conversation (not just a PR), the [Integration Layer Manifesto](docs/06-architecture/integration_layer_manifesto.md) names the known elephant builders. Reach out via [Telegram](https://t.me/integralevolution) — the highest-leverage collaborations are the ones that don't fit in a PR thread.

---

*The mission is not to build the best repo. The mission is to seed a network of holons. Forking is contribution.*
