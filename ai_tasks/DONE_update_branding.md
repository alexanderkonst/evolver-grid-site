# Update Branding: Game of Life → Evolver

**Agent:** Codex  
**Priority:** 🟡 MEDIUM  
**Status:** PENDING

## Problem

- Sidebar header says "Game of Life"
- Mobile header says "Game of Life"  
- Footer shows "© 2026 Aleksandr Konstantinov"

Should be product branding: "Evolver" or "Evolver Grid"

## Files to Modify

### GameShell.tsx
Line ~225: `<span className="font-bold text-slate-900">Game of Life</span>`
Line ~244: `<Link to="/" className="font-bold text-lg text-white">Game of Life</Link>`

Change to: "Evolver"

### Index page footer
Update copyright to: "© 2026 Evolver"

## Success Criteria
- [ ] Sidebar shows "Evolver" not "Game of Life"
- [ ] Mobile header shows "Evolver"
- [ ] Footer shows product branding

## When Done
Rename to `DONE_update_branding.md`
