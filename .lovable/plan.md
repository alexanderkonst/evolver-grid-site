Понял. Текущее поведение не похоже на один CSS `backdrop-filter` баг. Я посмотрел глубже: на десктопе `/ai-os` сейчас всё ещё рендерится как обычная документная прокрутка (`html` is the scroll region), а панели 1/2 сделаны `sticky` внутри flex-layout. На больших scroll-позициях sticky-панели не исчезают полностью из DOM, но их sticky-контейнер заканчивается раньше длинного контента — поэтому они выглядят “gone/stuck”: внизу страницы виден только нижний хвост панели, а верхняя навигация уехала за пределы viewport. Это не лечится очередным `z-index` или снятием blur.

Definition of Done:

| # | Evidence | Status |
|---|---|---|
| 1 | `/ai-os` desktop: панели 1 и 2 видны от верха до низа viewport на любом scroll depth | To implement |
| 2 | `/ai-os` desktop: страница прокручивается только в content-pane, не через document/html | To implement |
| 3 | `/ai-os` desktop: background stays full-bleed behind content; no pane vanish/flicker | To implement |
| 4 | `/ai-os` mobile: existing fixed overlay-cut fix remains intact; mobile menu/content still works | To implement |
| 5 | `Start here` scrolls to the install card in the correct scroll container | To implement |
| 6 | Add a route-scoped regression guard so future changes do not put `/ai-os` back on document-scroll + sticky panes | To implement |

Plan:

1. Stop treating `/ai-os` desktop like a normal document-scroll page.
   - In `GameShellV2`, add an AI OS route flag, e.g. `isAiOsRoute = path === "/ai-os" || path.startsWith("/ai-os/")`.
   - For desktop only, when `isAiOsRoute` is true:
     - make the shell row `h-dvh min-h-0 overflow-hidden` instead of `min-h-dvh` document-flow scrolling;
     - render Pane 1 and Pane 2 as full-height flex children, not sticky document participants;
     - make Pane 3 `<main>` the only vertical scroll container: `h-dvh min-h-0 overflow-y-auto overflow-x-hidden`.
   - Keep existing behavior for non-AI-OS routes so `/`, `/playbook`, `/path`, `/ubb`, etc. are not disturbed.

2. Make desktop and mobile scroll-container logic explicit.
   - Mobile already uses `.mobile-content-scroll`; keep it.
   - Add a desktop route-scoped class/data marker for AI OS content scroller, e.g. `.ai-os-desktop-content-scroll`.
   - Update the `Start here` handler in `AiOsPage.tsx` to find either:
     - `.mobile-content-scroll`, or
     - `.ai-os-desktop-content-scroll`,
     before falling back to `window`.
   - This prevents the button from trying to scroll `window` when the real scroller is Pane 3.

3. Remove the root overflow hack for `/ai-os` or make it conditional-safe.
   - `AiOsPage.tsx` currently sets `document.body.style.overflow = 'hidden'` and `document.documentElement.style.overflow = 'hidden'`.
   - That is dangerous when desktop still relies on document scroll, and it masks the real architecture issue.
   - After Pane 3 becomes the official scroller on `/ai-os`, keep root overflow hidden only as route-scoped background protection, not as the scroll mechanism.

4. Keep the GPU fixes already in place, but stop relying on them for layout.
   - Preserve the current no-`backdrop-filter` rule under `[data-ai-os]`.
   - Preserve mobile heavy-FX gating.
   - Do not reintroduce blur on `/ai-os` glass/panes.
   - Update the existing comments/memory to reflect the actual root cause: sticky panes inside document scroll were structurally wrong for long AI OS content.

5. Verify in preview after implementation.
   - Desktop 1920x1080: load `/ai-os`, scroll top/middle/bottom; panes 1/2 must remain fully visible from top to bottom.
   - Desktop: click `Start here`; content pane scrolls to the install card, panels stay fixed.
   - Mobile 390x805: load `/ai-os`; no overlay cut, menu button still opens nav, content scroll remains smooth.

Technical direction:

```text
Before:
html/body scroll
└─ desktop flex min-h-dvh
   ├─ Pane 1 sticky top-0 h-dvh
   ├─ Pane 2 sticky top-0 h-dvh
   └─ Pane 3 grows with long AI OS content

Problem:
Sticky panes are constrained by their flex/document-flow context.
At deep scroll positions they no longer behave like permanent app chrome.

After, only for /ai-os desktop:
viewport h-dvh overflow-hidden
└─ desktop flex h-dvh min-h-0
   ├─ Pane 1 h-dvh shrink-0
   ├─ Pane 2 h-dvh shrink-0
   └─ Pane 3 h-dvh min-h-0 overflow-y-auto
```

This is the deeper fix: turn `/ai-os` into a real app-shell layout instead of patching sticky/z-index symptoms.