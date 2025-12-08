# Architectural Schema

## System Overview
- **Runtime shell**: `src/main.tsx` bootstraps the React app and applies the global styles before rendering the root `App` component.【F:src/main.tsx†L1-L5】
- **Application provider stack**: `App` wraps the UI with TanStack Query for data fetching, shadcn-ui tooltips/toasters, and global animated effects (background and custom cursor).【F:src/App.tsx†L1-L47】
- **Routing**: React Router drives navigation, with routes for marketing pages, resource libraries, assessments, and multi-step "Zone of Genius" and "Quality of Life Map" flows, plus a dynamic module detail route and a catch-all 404.【F:src/App.tsx†L48-L82】
- **Data access**: Supabase is wired through a generated client configured with env-based URL/keys and persistent auth settings.【F:src/integrations/supabase/client.ts†L1-L17】

## Architectural Diagram
```
Browser DOM
└─ src/main.tsx → <App />
   └─ Providers: QueryClientProvider → TooltipProvider → Toaster/Sonner → AnimatedBackground/CustomCursor
      └─ BrowserRouter
         └─ PageTransition
            └─ Routes
               ├─ Static pages: / (Index), /about, /library, /contact, /auth, /ai-upgrade, /destiny, etc.
               ├─ Resource content: /resources/zog-intro-video, /resources/personality-tests
               ├─ Assessments:
               │   ├─ /quality-of-life-map/(assessment|results) via QolLayout
               │   └─ /zone-of-genius/assessment step-0..step-4 via ZoneOfGeniusAssessmentLayout
               ├─ Feature landing: /zone-of-genius
               ├─ Dynamic module: /m/:slug (ModuleDetail)
               └─ Fallback: * → NotFound
```

## Synthesis
The app is a Vite/React single-page application with a lightweight provider shell for data fetching and UI affordances, layered atop a route-centric feature map. Core experiences are organized as nested routes that encapsulate multi-step assessments (Quality of Life Map and Zone of Genius) while standalone marketing/resources pages share the same shell. Supabase is available for authenticated data operations, though most routes are presently driven by static components.

## Assessment
The structure is straightforward and consistent: providers and animated globals live at the app root, and routing cleanly separates feature domains. The reliance on static routes and generated Supabase wiring suggests room to centralize shared layouts (e.g., marketing vs. assessment shells) and to document data dependencies for each feature as backend usage grows.
