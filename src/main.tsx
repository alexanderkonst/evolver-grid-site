import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installPostAuthSideEffects } from "@/lib/postAuthSideEffects";

// Day 58+ (Sasha 2026-05-03): defensive service-worker cleanup. The
// Karime walkthrough hit a stale "Dashboard / Playbook / Path" UI
// after a back-nav — those names don't exist anywhere in current
// code (App.tsx routes use the post-rename names). Most likely
// cause: a leftover service worker from a previous deploy is still
// serving the old asset bundles from its cache.
//
// Vite is currently configured WITHOUT a SW (no PWA plugin). But if
// any prior version registered one and shipped it to users, that SW
// will keep running until explicitly unregistered — even after the
// current build removes it from the source. This is an idempotent
// cleanup: a no-op for users with no SW, a one-time cleanup for any
// user carrying a zombie SW from an earlier deploy.
//
// Pair this with the vercel.json change (no-cache on index.html so
// the browser always pulls the freshest pointer to the latest
// hashed asset bundles) and stale UI should stop happening.
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations()
        .then((registrations) => {
            registrations.forEach((registration) => {
                registration.unregister().catch(() => {
                    // Best-effort — silently swallow; the user can clear
                    // service workers from DevTools if this fails.
                });
            });
        })
        .catch(() => {
            // getRegistrations can throw in some private/strict modes;
            // not worth surfacing to the user.
        });
}

// Day 60+ (Sasha 2026-05-04): single global auth-state listener that
// runs the canonical post-auth side effects (claim-anonymous-zog +
// snapshot-cache invalidation) on SIGNED_IN and SIGNED_OUT — replaces
// the earlier per-form pattern that drifted (AuthCallback called the
// claim function; MeGate did not, orphaning Karime's snapshot). See
// src/lib/postAuthSideEffects.ts for the architectural rationale.
installPostAuthSideEffects();

createRoot(document.getElementById("root")!).render(<App />);
