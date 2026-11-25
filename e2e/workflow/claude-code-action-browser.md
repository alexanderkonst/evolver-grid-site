# Proposal: a real browser for the `claude-code-action` job (#460, addendum C)

Lives outside `.github/` on purpose: the bot may not write there, and Hark moves what belongs there. **Nothing here is wired yet.** Sasha picks the route; both are drafts, not tested in Actions.

## Route 1 (recommended): Playwright MCP + Chrome DevTools MCP via `mcp_config`

The action already runs MCP servers. The browser lifecycle belongs to the server, there is no global install in the run, and device emulation is a flag.

Step additions on the existing `claude-code-action` step:

```yaml
      - name: Browsers for the agent (Chromium + WebKit)
        run: npx --yes playwright@latest install --with-deps chromium webkit

      - uses: anthropics/claude-code-action@v1
        with:
          # ...existing inputs...
          mcp_config: |
            {
              "mcpServers": {
                "playwright": {
                  "command": "npx",
                  "args": ["@playwright/mcp@latest", "--browser", "webkit", "--device", "iPhone 15", "--output-dir", "e2e/artifacts/explore"]
                },
                "chrome-devtools": {
                  "command": "npx",
                  "args": ["chrome-devtools-mcp@latest", "--headless", "--isolated"]
                }
              }
            }
          claude_args: |
            --allowedTools "mcp__playwright__*,mcp__chrome-devtools__*"
```

Notes:
- Run the exploratory pass three times (iPhone 15 on WebKit, iPad, 1440 on Chromium) by changing `--device` or `--viewport-size`; each run attaches screenshots to the PR.
- The agent must open the PR's **Vercel preview** URL, not localhost. The `VERCEL_AUTOMATION_BYPASS_SECRET` from the CI job applies here too.
- Package names and flags are from memory of the upstream READMEs and need one check against them before the first run.

## Route 2: Playwright CLI inside the job

```bash
npm i -g @playwright/cli
playwright-cli install --skills        # skills land beside the vendored ones in .claude/skills/
cd e2e && npx playwright install chromium webkit
```

Token-light, and it echoes Playwright code, so a finding becomes a spec directly. The cost is a global install in every run and a browser lifecycle the agent has to manage.

## Why not both
Route 1 for the exploration (devices, console, Lighthouse), and the repo's own `e2e/` suite for the frozen specs. The suite never needs a model.
