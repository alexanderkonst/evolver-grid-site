import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import CustomCursor from "@/components/CustomCursor";
import SiteLogo from "@/components/SiteLogo";
import RequireAuth from "@/components/RequireAuth";
import MeGate from "@/components/MeGate";
// AnimatedBackground removed for minimal SaaS design
import PageTransition from "@/components/PageTransition";
import ErrorBoundary from "@/components/ErrorBoundary";
import { getPageTitle } from "@/lib/pageTitles";
import ScrollRestoration from "@/components/ScrollRestoration";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SkinProvider } from "@/contexts/SkinContext";
import SkinPreview from "./pages/SkinPreview";
import PreviewBanner from "@/components/skin/PreviewBanner";
import MusicPlayer from "@/components/MusicPlayer";
// Day 58+ (Sasha 2026-05-03): App-root mount for the SoundCloud
// playlist audio engine. SoundCloudMinimalPlayer used to own its
// own iframe inside SpacesRail, but SpacesRail lives inside
// GameShellV2 which is wrapped per-route — every navigation
// destroyed the iframe and killed playback. The provider below
// owns the iframe at App root (lazy-mounted on first shell entry,
// auto-paused on sales-page entry); the rail's player is now a
// thin UI consumer that reads state via context. See
// SoundCloudPlayerProvider.tsx for the full architecture rationale.
import { SoundCloudPlayerProvider } from "@/components/audio/SoundCloudPlayerProvider";
import LandingPage from "./pages/LandingPage";
import FeedbackPage from "./pages/FeedbackPage";
import ContactNew from "./pages/ContactNew";
import Library from "./pages/Library";
import ModuleDetail from "./pages/ModuleDetail";
import ModuleLandingPage from "./pages/ModuleLandingPage";
import AIUpgrade from "./pages/AIUpgrade";
// Activations — educational apps in the Planetary OS (Day 51, Sasha 2026-04-25).
// Public marketing routes. Per-activation Stripe Payment Link → /activations/<slug>/access.
import ActivationsIndex from "./pages/activations/ActivationsIndex";
import ActivationLandingPage from "./pages/activations/ActivationLandingPage";
import ActivationAccessPage from "./pages/activations/ActivationAccessPage";
import Destiny from "./pages/Destiny";
import MensCircle from "./pages/MensCircle";
import MensCircleThankYou from "./pages/MensCircleThankYou";
import VentureDashboard from "./pages/VentureDashboard";
import GameShellV2 from "./components/game/GameShellV2";
import MorphogeneticHolomap from "./pages/MorphogeneticHolomap";
import FoundersShowcase from "./pages/FoundersShowcase";
import IgniteSession from "./pages/IgniteSession";
// ActivateWelcome retired Day 58 (Sasha 2026-05-02 evening) — its route
// now redirects to /game/me/zone-of-genius/start-here; the page file
// is kept for reference only and no longer mounted.
import MethodologyLandingPage from "./pages/MethodologyLandingPage";
import JourneyPage from "./pages/JourneyPage";
import PlaybookPage from "./pages/PlaybookPage";
import PathPage from "./pages/PathPage";
import MyArtifactsPage from "./pages/MyArtifactsPage";
import GeniusOfferIntake from "./pages/GeniusOfferIntake";
import AdminMissionParticipants from "./pages/AdminMissionParticipants";
import AdminMissionSync from "./pages/AdminMissionSync";
import AdminContentManager from "./pages/AdminContentManager";
// Phase 1 of the Autonomous Navigation Loop — Sasha-only founder-state surfaces.
// See docs/06-architecture/autonomous-navigation-loop.md.
const FoundersIndex = lazy(() => import("./pages/admin/FoundersIndex"));
const FounderDetail = lazy(() => import("./pages/admin/FounderDetail"));
// Day 54 (Sasha 2026-04-28): /admin/dashboard + /admin/grants fused into
// one operator console at /admin. Old URLs redirect to /admin so any
// bookmarks/links keep working. Source: src/pages/admin/Admin.tsx.
const AdminPage = lazy(() => import("./pages/admin/Admin"));
import SandraIgnition from "./pages/SandraIgnition";
import SergeyIgnition from "./pages/SergeyIgnition";
import OyiIgnition from "./pages/OyiIgnition";
import MultipleIntelligences from "./pages/MultipleIntelligences";
import GameHome from "./pages/GameHome";
import DailyLoopV2 from "./pages/DailyLoopV2";
import Today from "./pages/Today";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import GeniusLayerMatching from "./pages/GeniusLayerMatching";
import GrowthPathsPage from "./pages/GrowthPathsPage";
import GameMap from "./pages/GameMap";
import ProfileMissionSection from "./pages/spaces/sections/ProfileMissionSection";
import ProfileAssetsSection from "./pages/spaces/sections/ProfileAssetsSection";
import ProfileOverview from "./pages/spaces/sections/ProfileOverview";
import GeniusBusiness from "./pages/spaces/profile/GeniusBusiness";
import GeniusBusinessAudience from "./pages/spaces/profile/GeniusBusinessAudience";
import GeniusBusinessPromise from "./pages/spaces/profile/GeniusBusinessPromise";
import GeniusBusinessChannels from "./pages/spaces/profile/GeniusBusinessChannels";
import GeniusBusinessVision from "./pages/spaces/profile/GeniusBusinessVision";
import ZoneOfGeniusOverview from "./pages/spaces/profile/ZoneOfGeniusOverview";
import CanvasOverviewPage from "./pages/spaces/profile/CanvasOverviewPage";
import CharacterSnapshot from "./pages/CharacterSnapshot";
import ResourcesZogIntroVideo from "./pages/ResourcesZogIntroVideo";
import ResourcesPersonalityTests from "./pages/ResourcesPersonalityTests";
import QualityOfLifeMapAssessment from "./pages/QualityOfLifeMapAssessment";
import QualityOfLifePriorities from "./pages/QualityOfLifePriorities";
import QualityOfLifeGrowthRecipe from "./pages/QualityOfLifeGrowthRecipe";
import QolLayout from "./modules/quality-of-life-map/QolLayout";
import ZoneOfGeniusLandingPage from "./modules/zone-of-genius/ZoneOfGeniusLandingPage";
import ZoneOfGeniusAssessmentLayout from "./modules/zone-of-genius/ZoneOfGeniusAssessmentLayout";
import Step1SelectTop10Talents from "./modules/zone-of-genius/Step1SelectTop10Talents";
import Step2SelectTop3CoreTalents from "./modules/zone-of-genius/Step2SelectTop3CoreTalents";
import Step3OrderTalents from "./modules/zone-of-genius/Step3OrderTalents";
import Step4GenerateSnapshot from "./modules/zone-of-genius/Step4GenerateSnapshot";
import ZoneOfGeniusEntry from "./modules/zone-of-genius/ZoneOfGeniusEntry";
import GeniusQuiz from "./modules/zone-of-genius/GeniusQuiz";

import AppleseedView from "./pages/AppleseedView";
import ExcaliburView from "./pages/ExcaliburView";
import ZoGPerspectiveView from "./pages/spaces/profile/ZoGPerspectiveView";
import NotFound from "./pages/NotFound";
// Day 61 (Sasha 2026-05-04 17:30): MyResult.tsx is now a LEGACY page,
// kept alive ONLY to honor historical inbox links of the form
// /my-result?token=<access_token>. New deposit-slip emails (from
// save-zog-result post-Wave-2) point at /zone-of-genius?result=<token>
// instead — that's the canonical returning-user surface (same component
// as the live funnel, one render path, no drift). MyResult can be
// deleted once the historical-link tail decays (months out).
import MyResult from "./pages/MyResult";
import OnboardingPage from "./pages/OnboardingPage";
// Space pages for the Game Shell
import TodaysPractice from "./pages/spaces/transformation/TodaysPractice";
import TransformationGrowthPaths from "./pages/spaces/transformation/GrowthPaths";
import PathSection from "./pages/spaces/transformation/PathSection";
import TransformationPracticeLibrary from "./pages/spaces/transformation/PracticeLibrary";
import TransformationPersonalityTests from "./pages/spaces/transformation/PersonalityTests";
import TransformationQolAssessment from "./pages/spaces/transformation/TransformationQolAssessment";
import TransformationQolResults from "./pages/spaces/transformation/TransformationQolResults";
import TransformationGeniusAssessment from "./pages/spaces/transformation/TransformationGeniusAssessment";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/events/CreateEvent";
import MyRsvps from "./pages/events/MyRsvps";
import CommunityEvents from "./pages/CommunityEvents";
import Connections from "./pages/Connections";
import Matchmaking from "./pages/Matchmaking";
import PeopleDirectory from "./pages/PeopleDirectory";
import MissionSelection from "./pages/MissionSelection";
import PublicProfile from "./pages/PublicProfile";
// Core Loop
import CoreLoopHome from "./pages/CoreLoopHome";
// Mission Discovery
import MissionDiscoveryLanding from "./modules/mission-discovery/MissionDiscoveryLanding";
import MissionDiscoveryWizard from "./modules/mission-discovery/MissionDiscoveryWizard";
// Asset Mapping
import AssetMappingLanding from "./modules/asset-mapping/AssetMappingLanding";
import AssetMappingWizard from "./modules/asset-mapping/AssetMappingWizard";
// Product Builder
import ProductBuilderLayout from "./modules/product-builder/ProductBuilderLayout";
import ProductBuilderEntry from "./modules/product-builder/ProductBuilderEntry";
import {
  DeepICPScreen,
  DeepPainScreen,
  DeepTPScreen,
  LandingPageScreen,
  BlueprintScreen,
  CTAScreen,
  PublishedScreen
} from "./modules/product-builder/steps";
import ProductBuilderPage from "./pages/ProductBuilderPage";
// Marketplace
import CreatorPage from "./pages/CreatorPage";
import PublicPageEditor from "./pages/PublicPageEditor";
// Profile page retired 2026-04-21 — its content now lives inside the unified
// Settings page (Profile tab) at /game/settings.
import ToolsRedirect from "./pages/ToolsRedirect";
import TestNavigation from "./pages/TestNavigation";
import BrowseGuides from "./pages/marketplace/BrowseGuides";
import MarketplaceProductPage from "./pages/marketplace/MarketplaceProductPage";
import MyGeniusBusinessPage from "./pages/spaces/MyGeniusBusinessPage";
import MyProductsPage from "./pages/spaces/MyProductsPage";
import BuildCanvasPage from "./pages/spaces/BuildCanvasPage";
import RefineBusinessPage from "./pages/spaces/RefineBusinessPage";
import ArtLayout from "./layouts/ArtLayout";
import ArtGallery from "./pages/art/ArtGallery";
import ArtPortfolio from "./pages/art/ArtPortfolio";
import Settings from "./pages/Settings";
import Transcriber from "./pages/Transcriber";
import EquilibriumPage from "./pages/EquilibriumPage";
import ArtPage from "./pages/game/ArtPiecePage";
import FounderMarketFit from "./pages/FounderMarketFit";
import TheOriginalsPage from "./pages/TheOriginalsPage";
import IntegralTheoryUpgrade1 from "./pages/IntegralTheoryUpgrade1";
import Intros from "./pages/Intros";
// Unique Business Builder v2.0
import UniqueBusinessLayout from "./modules/unique-business-builder/UniqueBusinessLayout";
import CanvasOverviewScreen from "./modules/unique-business-builder/screens/CanvasOverviewScreen";
import GenericArtifactScreen from "./modules/unique-business-builder/screens/GenericArtifactScreen";
import CompoundScreen from "./modules/unique-business-builder/screens/CompoundScreen";
import UbbLandingPageScreen from "./modules/unique-business-builder/screens/LandingPageScreen";
import DossierScreen from "./modules/unique-business-builder/screens/DossierScreen";
import PublicDossier from "./pages/PublicDossier";
import PublicLandingPage from "./pages/PublicLandingPage";
// AiOs module — Sasha's prompt library at /ai-os (imported from
// github.com/alexanderkonst/metaprompt and adapted to evolver patterns 2026-04-24).
// Day 53 evening (2026-04-27): retired AiOsAuthPage / AiOsProfilePage /
// AiOsAuthProvider — /ai-os is pure Holonic Commons, free for everyone,
// no profile, no sign-in. Components stay in source for archival and any
// future re-introduction; routes that referenced them now redirect home.
import AiOsPage from "./modules/ai-os/AiOsPage";
import AiOsPricingPage from "./modules/ai-os/pages/AiOsPricingPage";
import AiOsBenchmark from "./pages/AiOsBenchmark";

const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-[#0a0a1a]">
    <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full" />
  </div>
);

// Space pages - renamed: GROW, LEARN, MEET, COLLABORATE, BUILD, OFFER
const GrowSpace = lazy(() => import("./pages/spaces/ProfileSpace")); // was Profile
const LearnSpace = lazy(() => import("./pages/spaces/TransformationSpace")); // was Transformation
const MeetSpace = lazy(() => import("./pages/spaces/EventsSpace")); // was Events
const CollaborateSpace = lazy(() => import("./pages/spaces/TeamsSpace")); // was Teams/Discover
const BuildSpace = lazy(() => import("./pages/spaces/CoopSpace")); // was Business Incubator
const MarketplaceSpace = lazy(() => import("./pages/spaces/MarketplaceSpace")); // OFFER
const QualityOfLifeMapResults = lazy(() => import("./pages/QualityOfLifeMapResults"));
const AdminGeniusOffers = lazy(() => import("./pages/AdminGeniusOffers"));
const HolonicModulesPage = lazy(() => import("./pages/HolonicModulesPage"));

const queryClient = new QueryClient();

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Day 53 (Sasha 2026-04-27): drop the " | suffix" when getPageTitle
    // returns "" (root + unmapped routes). Old behavior appended "| Home"
    // / "| Explore" which read as confusing leftover boilerplate in tabs.
    const sectionTitle = getPageTitle(location.pathname);
    document.title = sectionTitle
      ? `Find Your Top Talent | ${sectionTitle}`
      : "Find Your Top Talent";
  }, [location.pathname]);

  return null;
};

// Day 53 night iter 2 (Sasha 2026-04-27): UBD/UBL → dossier/page rename.
// These two micro-redirects preserve any previously shared URLs.
// `replace` so the user's history shows the new URL, not the old.
const UbdRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/dossier/${slug ?? ""}`} replace />;
};
const UblRedirect = () => {
  const { slugWithVersion } = useParams<{ slugWithVersion: string }>();
  return <Navigate to={`/page/${slugWithVersion ?? ""}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SkinProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* AnimatedBackground removed for minimal SaaS design */}
        <CustomCursor />
        <BrowserRouter>
          <SiteLogo />
          <TitleManager />
          <ScrollRestoration />
          <PreviewBanner />
          {/* Day 56 (Sasha 2026-05-01): ambient music player. Mounted
              ONCE at App root above <Routes> so the audio engine
              persists across navigation — visitor presses play on /,
              music keeps playing through /ai-os, /path, etc. Gated by
              ?music=1 query param so production traffic sees nothing
              while we iterate. Flip MusicPlayer's enabled gate to
              default-true when ready to launch for everyone. */}
          <MusicPlayer />
          <SoundCloudPlayerProvider>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <Routes>
                  {/* ══════ PUBLIC ROUTES (no login required) ══════ */}
                  <Route path="/" element={<JourneyPage />} />
                  <Route path="/zone-of-genius" element={<ZoneOfGeniusEntry />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />
                  {/* /reveal — legacy redirect kept so any old shared
                      links resolve home. The PDF download + the in-app
                      Top Talent overview ARE the reveal — no need for
                      a duplicate public page (Sasha 2026-04-26). */}
                  <Route path="/reveal" element={<Navigate to="/" replace />} />
                  <Route path="/reveal/:slug" element={<Navigate to="/" replace />} />
                  {/* Day 61 (Sasha 2026-05-04): /my-result is LEGACY —
                      preserved for historical inbox links carrying
                      ?token=<access_token>. New emails (post-Wave-2)
                      use /zone-of-genius?result=<token> instead. */}
                  <Route path="/my-result" element={<MyResult />} />
                  {/* Day 47 late pass (Sasha): /integral_theory_upgrade1 renamed to /27.
                      Old path kept as redirect so any shared links stay alive. */}
                  <Route path="/27" element={<IntegralTheoryUpgrade1 />} />
                  <Route path="/integral_theory_upgrade1" element={<Navigate to="/27" replace />} />
                  <Route path="/intros" element={<Intros />} />
                  <Route path="/profile/:userId" element={<PublicProfile />} />
                  <Route path="/u/:username" element={<PublicProfile />} />
                  <Route path="/p/:slug" element={<CreatorPage />} />
                  <Route path="/mp/:slug" element={<MarketplaceProductPage />} />
                  {/* Day 53 night iter 2 (Sasha 2026-04-27): UBD/UBL acronyms
                      retired in favor of plain-English slugs that decode
                      at sight. New canonical:
                        /dossier/{slug}             — published dossier
                        /page/{slug}-v{n}           — published landing page
                      Old /ubd/* and /ubl/* preserved as redirects so any
                      previously shared URLs still resolve. */}
                  <Route path="/dossier/:slug" element={<PublicDossier />} />
                  <Route path="/page/:slugWithVersion" element={<PublicLandingPage />} />
                  {/* Legacy redirects — preserve old shared URLs */}
                  <Route path="/ubd/:slug" element={<UbdRedirect />} />
                  <Route path="/ubl/:slugWithVersion" element={<UblRedirect />} />
                  {/* AI OS — canonical prompt suite. Day 51 (Sasha 2026-04-24):
                      renamed /codex → /ai-os to align with the AI OS brand
                      (perpendicular to the AI-model race; OS+Apps for AI).
                      Old /codex and /prompt paths redirect for any links
                      already in the wild (DMs, screenshots, prior deploys). */}
                  {/* Day 53 evening (Sasha 2026-04-27): /ai-os goes pure
                      Holonic Commons — free, no profile, no sign-in. The
                      AiOsAuthProvider wrapper retired from /ai-os, /ai-os/pricing,
                      /ai-os/benchmark since the page no longer reads `useAiOsAuth`.
                      /ai-os/auth and /ai-os/profile redirect home to defang any
                      stale links. /ai-os/pricing kept for the Holonic Commons
                      tip / patronage flow (no auth needed).  */}
                  <Route path="/ai-os" element={<GameShellV2><AiOsPage /></GameShellV2>} />
                  <Route path="/ai-os/auth" element={<Navigate to="/ai-os" replace />} />
                  {/* Day 54+ (Sasha 2026-04-28): /ai-os/pricing renamed to
                      /ai-os/work-with-us. The page no longer leads with
                      "pricing" framing — it's now the partnership invite
                      surface. Old URL preserved as redirect for inbound
                      links / shares already in the wild. hideLogo=true on
                      the new route because the merkaba sits inside the
                      hero now (one logo per page, not two — Sasha's call). */}
                  <Route path="/ai-os/work-with-us" element={<GameShellV2 hideLogo><AiOsPricingPage /></GameShellV2>} />
                  <Route path="/ai-os/pricing" element={<Navigate to="/ai-os/work-with-us" replace />} />
                  <Route path="/ai-os/profile" element={<Navigate to="/ai-os" replace />} />
                  <Route path="/ai-os/benchmark" element={<GameShellV2><AiOsBenchmark /></GameShellV2>} />
                  {/* Day 54 (Sasha 2026-04-28): per-suite sub-routes. Each renders
                      AiOsPage with focusCategory set so only the matching suite's
                      prompts appear. URL "vibe-code" maps to internal category id
                      "deployment" — slug renamed for resonance, internal id stable. */}
                  <Route path="/ai-os/clarity" element={<GameShellV2><AiOsPage focusCategory="clarity" /></GameShellV2>} />
                  <Route path="/ai-os/iteration" element={<GameShellV2><AiOsPage focusCategory="iteration" /></GameShellV2>} />
                  <Route path="/ai-os/vibe-code" element={<GameShellV2><AiOsPage focusCategory="deployment" /></GameShellV2>} />
                  <Route path="/ai-os/design" element={<GameShellV2><AiOsPage focusCategory="design" /></GameShellV2>} />
                  {/* /ai-os/suites is the SectionsPanel parent path for the Suites
                      group — clicks toggle expand/collapse so this route is rarely
                      hit, but if a user types it directly we redirect to /ai-os
                      rather than 404. */}
                  <Route path="/ai-os/suites" element={<Navigate to="/ai-os" replace />} />
                  <Route path="/codex" element={<Navigate to="/ai-os" replace />} />
                  <Route path="/codex/auth" element={<Navigate to="/ai-os" replace />} />
                  <Route path="/codex/pricing" element={<Navigate to="/ai-os/work-with-us" replace />} />
                  <Route path="/codex/profile" element={<Navigate to="/ai-os" replace />} />
                  <Route path="/prompt" element={<Navigate to="/ai-os" replace />} />
                  <Route path="/prompt/auth" element={<Navigate to="/ai-os" replace />} />
                  <Route path="/prompt/pricing" element={<Navigate to="/ai-os/work-with-us" replace />} />
                  <Route path="/prompt/profile" element={<Navigate to="/ai-os" replace />} />

                  {/* Activations — public marketing routes (Day 51, Sasha 2026-04-25).
                      /activations              → index (live entries from src/data/activations.ts)
                      /activations/<slug>       → per-workshop landing + Stripe checkout
                      /activations/<slug>/access → post-purchase YouTube access page */}
                  <Route path="/activations" element={<ActivationsIndex />} />
                  <Route path="/activations/:slug" element={<ActivationLandingPage />} />
                  <Route path="/activations/:slug/access" element={<ActivationAccessPage />} />

                  {/* ══════ PROTECTED ROUTES (login required) ══════ */}
                  {/* Day 47 (Sasha): /ignite is now public — the ZoG result CTA lands
                      here directly. Auth at the pricing step was redundant funnel friction. */}
                  <Route path="/ignite" element={<IgniteSession />} />
                  {/* Day 58 (Sasha 2026-05-02 evening): /activate/welcome
                      eradicated as a standalone surface. The activation
                      home now lives at /game/me/zone-of-genius/start-here
                      (in-shell, returnable). The route stays as a
                      redirect for any inbound traffic (Stripe redirect
                      URL, old bookmarks, the coupon nav). After the
                      Stripe payment-link redirect target is updated in
                      the Stripe dashboard, this route can be deleted. */}
                  <Route path="/activate/welcome" element={<Navigate to="/game/me/zone-of-genius/start-here" replace />} />
                  <Route path="/activate" element={<Navigate to="/game/me/zone-of-genius/start-here" replace />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/library/:stepId" element={<Library />} />
                  <Route path="/contact" element={<RequireAuth><ContactNew /></RequireAuth>} />
                  <Route path="/feedback" element={<RequireAuth><FeedbackPage /></RequireAuth>} />
                  <Route path="/tools" element={<RequireAuth><ToolsRedirect /></RequireAuth>} />

                  <Route path="/start" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
                  <Route path="/profile" element={<Navigate to="/game/me" replace />} />
                  {/* Legacy /settings now redirects into the unified Settings page (Profile tab). */}
                  <Route path="/settings" element={<Navigate to="/game/settings?tab=profile" replace />} />
                  {/* Day 47 late pass (Sasha): Settings is now public.
                      The Settings button in the rail is visible on the landing
                      page, and routing guests to /auth was breaking the funnel.
                      The Settings page itself handles guest state gracefully. */}
                  <Route path="/game/settings" element={<Settings />} />
                  <Route path="/marketplace" element={<Navigate to="/game/marketplace" replace />} />
                  <Route path="/marketplace/browse" element={<Navigate to="/game/marketplace/browse" replace />} />
                  <Route path="/marketplace/create-page" element={<RequireAuth><PublicPageEditor /></RequireAuth>} />
                  <Route path="/ai-upgrade" element={<RequireAuth><AIUpgrade /></RequireAuth>} />
                  <Route path="/destiny" element={<RequireAuth><Destiny /></RequireAuth>} />
                  <Route path="/mens-circle" element={<RequireAuth><MensCircle /></RequireAuth>} />
                  <Route path="/mens-circle/thank-you" element={<RequireAuth><MensCircleThankYou /></RequireAuth>} />
                  <Route path="/genius-offer" element={<Navigate to="/zone-of-genius/entry" replace />} />
                  {/* Day 47 late pass (Sasha): /quiz is now public. It's the
                      secondary CTA from the ZoG result ("See exactly why this
                      hasn't turned into income") — auth before that is pure friction. */}
                  <Route path="/quiz" element={<GeniusQuiz />} />
                  <Route path="/genius-offer-intake" element={<RequireAuth><GeniusOfferIntake /></RequireAuth>} />
                  <Route path="/admin/genius-offers" element={<RequireAuth><AdminGeniusOffers /></RequireAuth>} />
                  <Route path="/genius-admin" element={<RequireAuth><AdminGeniusOffers /></RequireAuth>} />
                  <Route path="/admin/mission-participants" element={<RequireAuth><AdminMissionParticipants /></RequireAuth>} />
                  <Route path="/admin/mission-sync" element={<RequireAuth><AdminMissionSync /></RequireAuth>} />
                  <Route path="/admin/content" element={<RequireAuth><AdminContentManager /></RequireAuth>} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
                  <Route path="/admin/grants" element={<Navigate to="/admin" replace />} />
                  <Route path="/founders" element={<FoundersIndex />} />
                  <Route path="/founders/:slug" element={<FounderDetail />} />
                  <Route path="/sandra" element={<RequireAuth><SandraIgnition /></RequireAuth>} />
                  <Route path="/sergey" element={<RequireAuth><SergeyIgnition /></RequireAuth>} />
                  <Route path="/oyi" element={<RequireAuth><OyiIgnition /></RequireAuth>} />
                  <Route path="/intelligences" element={<RequireAuth><MultipleIntelligences /></RequireAuth>} />
                  <Route path="/genius-layer-matching" element={<RequireAuth><GeniusLayerMatching /></RequireAuth>} />
                  {/* Game Routes */}
                  {/* /game is retired — always redirect to /game/journey (or just `/` landing) */}
                  <Route path="/game" element={<Navigate to="/game/journey" replace />} />
                  <Route path="/game/next-move" element={<RequireAuth><CoreLoopHome /></RequireAuth>} />
                  <Route path="/game/next-move-v2" element={<RequireAuth><DailyLoopV2 /></RequireAuth>} />
                  {/* ME Space (was Grow, was Profile) */}
                  {/* Day 47 late pass (Sasha): /game/me is now a single-focus
                      Top Talent view. No welcome landing page — users arrive
                      here post-auth (via magic link from save-result email)
                      and see their fuller Top Talent profile directly. */}
                  <Route path="/game/me" element={<Navigate to="/game/me/zone-of-genius" replace />} />
                  <Route path="/game/me/overview" element={<MeGate><ProfileOverview /></MeGate>} />
                  {/* Legacy ME-space Profile Settings now redirects to the unified Settings. */}
                  <Route path="/game/me/settings" element={<Navigate to="/game/settings?tab=profile" replace />} />
                  <Route path="/game/me/mission" element={<MeGate><ProfileMissionSection /></MeGate>} />
                  <Route path="/game/me/assets" element={<MeGate><ProfileAssetsSection /></MeGate>} />
                  <Route path="/game/me/genius-business" element={<MeGate><GeniusBusiness /></MeGate>} />
                  <Route path="/game/me/genius-business/audience" element={<MeGate><GeniusBusinessAudience /></MeGate>} />
                  <Route path="/game/me/genius-business/promise" element={<MeGate><GeniusBusinessPromise /></MeGate>} />
                  <Route path="/game/me/genius-business/channels" element={<MeGate><GeniusBusinessChannels /></MeGate>} />
                  <Route path="/game/me/genius-business/vision" element={<MeGate><GeniusBusinessVision /></MeGate>} />
                  <Route path="/game/me/zone-of-genius" element={<MeGate><ZoneOfGeniusOverview /></MeGate>} />
                  <Route path="/game/me/zone-of-genius/:perspectiveId" element={<MeGate><ZoGPerspectiveView /></MeGate>} />
                  <Route path="/game/me/canvas" element={<MeGate><CanvasOverviewPage /></MeGate>} />
                  <Route path="/game/me/art" element={<MeGate><ArtPage /></MeGate>} />
                  {/* Legacy redirects */}
                  <Route path="/game/profile" element={<Navigate to="/game/me" replace />} />
                  <Route path="/game/profile/*" element={<Navigate to="/game/me" replace />} />
                  <Route path="/game/grow" element={<Navigate to="/game/me" replace />} />
                  <Route path="/game/grow/*" element={<Navigate to="/game/me" replace />} />
                  {/* JOURNEY Space */}
                  <Route path="/game/journey" element={<JourneyPage />} />
                  <Route path="/game/journey/start" element={<ZoneOfGeniusEntry />} />
                  {/* PLAYBOOK — Step 1 is at /playbook itself (no `/discover` slug).
                      Legacy /playbook/discover redirects to /playbook. */}
                  <Route path="/playbook" element={<PlaybookPage />} />
                  <Route path="/playbook/discover" element={<Navigate to="/playbook" replace />} />
                  <Route path="/playbook/:slug" element={<PlaybookPage />} />
                  {/* THE PATH — one-page value ladder. Soft-gated (auth or ZoG done) by the page itself. */}
                  <Route path="/path" element={<PathPage />} />
                  {/* MY ARTIFACTS — user's unique-business artifacts grouped by step. RLS-scoped. */}
                  <Route path="/my-artifacts" element={<RequireAuth><MyArtifactsPage /></RequireAuth>} />
                  {/* LEARN Space (was Transformation) */}
                  <Route path="/game/learn" element={<RequireAuth><LearnSpace /></RequireAuth>} />
                  <Route path="/game/learn/today" element={<RequireAuth><TodaysPractice /></RequireAuth>} />
                  <Route path="/game/learn/paths" element={<RequireAuth><TransformationGrowthPaths /></RequireAuth>} />
                  <Route path="/game/learn/path/:pathId" element={<RequireAuth><PathSection /></RequireAuth>} />
                  <Route path="/game/learn/library" element={<RequireAuth><TransformationPracticeLibrary /></RequireAuth>} />
                  <Route path="/game/learn/library/:stepId" element={<RequireAuth><TransformationPracticeLibrary /></RequireAuth>} />
                  <Route path="/game/learn/tests" element={<RequireAuth><TransformationPersonalityTests /></RequireAuth>} />
                  <Route path="/game/learn/qol-assessment" element={<RequireAuth><TransformationQolAssessment /></RequireAuth>} />
                  <Route path="/game/learn/qol-results" element={<RequireAuth><TransformationQolResults /></RequireAuth>} />
                  <Route path="/game/learn/genius-assessment" element={<RequireAuth><TransformationGeniusAssessment /></RequireAuth>}>
                    <Route index element={<Step1SelectTop10Talents />} />
                    <Route path="step-1" element={<Step1SelectTop10Talents />} />
                    <Route path="step-2" element={<Step2SelectTop3CoreTalents />} />
                    <Route path="step-3" element={<Step3OrderTalents />} />
                    <Route path="step-4" element={<Step4GenerateSnapshot />} />
                  </Route>
                  {/* Legacy redirects */}
                  <Route path="/game/transformation" element={<Navigate to="/game/learn" replace />} />
                  <Route path="/game/transformation/*" element={<Navigate to="/game/learn" replace />} />
                  {/* OFFER Space (was Marketplace) */}
                  <Route path="/game/marketplace" element={<RequireAuth><MarketplaceSpace /></RequireAuth>} />
                  <Route path="/game/marketplace/my-products" element={<RequireAuth><MyProductsPage /></RequireAuth>} />
                  <Route path="/game/marketplace/founders" element={<Navigate to="/game/marketplace" replace />} />
                  <Route path="/game/marketplace/browse" element={<Navigate to="/game/marketplace" replace />} />
                  <Route path="/game/marketplace/ignite" element={<RequireAuth><IgniteSession /></RequireAuth>} />
                  {/* COLLABORATE Space (was Teams/Discover) */}
                  <Route path="/game/collaborate" element={<RequireAuth><CollaborateSpace /></RequireAuth>} />
                  <Route path="/game/collaborate/matches" element={<RequireAuth><Matchmaking /></RequireAuth>} />
                  <Route path="/game/collaborate/connections" element={<RequireAuth><Connections /></RequireAuth>} />
                  <Route path="/game/collaborate/mission" element={<RequireAuth><MissionSelection /></RequireAuth>} />
                  <Route path="/game/collaborate/people" element={<RequireAuth><PeopleDirectory /></RequireAuth>} />
                  {/* Legacy redirects */}
                  <Route path="/game/teams" element={<Navigate to="/game/collaborate" replace />} />
                  <Route path="/game/matches" element={<Navigate to="/game/collaborate/matches" replace />} />
                  <Route path="/connections" element={<Navigate to="/game/collaborate/connections" replace />} />
                  <Route path="/game/mission" element={<Navigate to="/game/collaborate/mission" replace />} />
                  <Route path="/community/people" element={<Navigate to="/game/collaborate/people" replace />} />
                  {/* MEET Space (was Events) */}
                  <Route path="/game/meet" element={<RequireAuth><MeetSpace /></RequireAuth>} />
                  <Route path="/game/meet/create" element={<RequireAuth><CreateEvent /></RequireAuth>} />
                  <Route path="/game/meet/my-rsvps" element={<RequireAuth><MyRsvps /></RequireAuth>} />
                  {/* Legacy redirects */}
                  <Route path="/game/events" element={<Navigate to="/game/meet" replace />} />
                  <Route path="/game/events/*" element={<Navigate to="/game/meet" replace />} />
                  {/* BUILD Space */}
                  {/* Day 52 (Sasha 2026-04-26): /game/build now redirects to
                      /ubb. UBB is the canonical BUILD experience; legacy
                      /game/build/{canvas,product-builder,my-business,refine}
                      remain reachable directly for back-compat. */}
                  <Route path="/game/build" element={<Navigate to="/ubb" replace />} />
                  <Route path="/game/build/canvas" element={<RequireAuth><BuildCanvasPage /></RequireAuth>} />
                  <Route path="/game/build/my-business" element={<RequireAuth><MyGeniusBusinessPage /></RequireAuth>} />
                  <Route path="/game/build/refine" element={<RequireAuth><RefineBusinessPage /></RequireAuth>} />
                  {/* Product Builder in GameShell */}
                  <Route path="/game/build/product-builder" element={<RequireAuth><ProductBuilderPage /></RequireAuth>}>
                    <Route index element={<ProductBuilderEntry />} />
                    <Route path="icp" element={<DeepICPScreen />} />
                    <Route path="pain" element={<DeepPainScreen />} />
                    <Route path="promise" element={<DeepTPScreen />} />
                    <Route path="landing" element={<LandingPageScreen />} />
                    <Route path="blueprint" element={<BlueprintScreen />} />
                    <Route path="cta" element={<CTAScreen />} />
                    <Route path="published" element={<PublishedScreen />} />
                  </Route>
                  {/* Unique Business Builder v2.0 — Day 52 (Sasha 2026-04-26):
                      UBB now lives inside GameShellV2 (BUILD space). Pane 2 owns
                      the 6 phase-group navigation; pane 3 hosts the artifacts +
                      wizards. UniqueBusinessLayout strips its own chrome
                      (header, progress bar, max-w wrapper) since the shell
                      provides those affordances. */}
                  <Route path="/ubb" element={<RequireAuth><GameShellV2><UniqueBusinessLayout /></GameShellV2></RequireAuth>}>
                    <Route index element={<CanvasOverviewScreen />} />
                    <Route path="uniqueness" element={<GenericArtifactScreen />} />
                    <Route path="myth" element={<GenericArtifactScreen />} />
                    <Route path="tribe" element={<GenericArtifactScreen />} />
                    <Route path="pain" element={<GenericArtifactScreen />} />
                    <Route path="promise" element={<GenericArtifactScreen />} />
                    <Route path="lead-magnet" element={<GenericArtifactScreen />} />
                    <Route path="value-ladder" element={<GenericArtifactScreen />} />
                    <Route path="specificity-matrix" element={<GenericArtifactScreen />} />
                    <Route path="session" element={<CompoundScreen />} />
                    <Route path="marketing" element={<CompoundScreen />} />
                    <Route path="distribution" element={<CompoundScreen />} />
                    <Route path="communications" element={<CompoundScreen />} />
                    <Route path="landing-page" element={<UbbLandingPageScreen />} />
                    <Route path="dossier" element={<DossierScreen />} />
                  </Route>
                  {/* Legacy redirects */}
                  <Route path="/game/coop" element={<Navigate to="/game/build" replace />} />
                  <Route path="/events" element={<Navigate to="/game/meet" replace />} />
                  <Route path="/events/:id" element={<RequireAuth><EventDetail /></RequireAuth>} />
                  <Route path="/events/community/:communityId" element={<RequireAuth><CommunityEvents /></RequireAuth>} />
                  <Route path="/game/snapshot" element={<RequireAuth><CharacterSnapshot /></RequireAuth>} />
                  <Route path="/game/path/:pathId" element={<RequireAuth><GrowthPathsPage /></RequireAuth>} />
                  <Route path="/game/test-nav" element={<RequireAuth><TestNavigation /></RequireAuth>} />
                  <Route path="/today" element={<RequireAuth><Today /></RequireAuth>} />
                  <Route path="/character" element={<RequireAuth><Today /></RequireAuth>} />
                  <Route path="/map" element={<RequireAuth><GameMap /></RequireAuth>} />
                  <Route path="/skills" element={<RequireAuth><GrowthPathsPage /></RequireAuth>} />
                  <Route path="/growth-paths" element={<RequireAuth><GrowthPathsPage /></RequireAuth>} />
                  <Route path="/resources/zog-intro-video" element={<RequireAuth><ResourcesZogIntroVideo /></RequireAuth>} />
                  <Route path="/resources/personality-tests" element={<RequireAuth><ResourcesPersonalityTests /></RequireAuth>} />
                  <Route path="/quality-of-life-map" element={<RequireAuth><QolLayout /></RequireAuth>}>
                    <Route path="assessment" element={<QualityOfLifeMapAssessment />} />
                    <Route path="results" element={<QualityOfLifeMapResults />} />
                    <Route path="priorities" element={<QualityOfLifePriorities />} />
                    <Route path="growth-recipe" element={<QualityOfLifeGrowthRecipe />} />
                  </Route>
                  <Route path="/zone-of-genius" element={<RequireAuth><ZoneOfGeniusLandingPage /></RequireAuth>} />
                  <Route path="/zone-of-genius/appleseed" element={<RequireAuth><AppleseedView /></RequireAuth>} />
                  <Route path="/zone-of-genius/excalibur" element={<RequireAuth><ExcaliburView /></RequireAuth>} />
                  <Route path="/zone-of-genius/entry" element={<RequireAuth><ZoneOfGeniusEntry /></RequireAuth>} />
                  {/* Day 47 (Sasha): assessment is now public — no login gate. Log-in
                      added friction AND showed the legacy shell; guests can now complete
                      the guided path and be offered to save on the result page. */}
                  <Route path="/zone-of-genius/assessment" element={<ZoneOfGeniusAssessmentLayout />}>
                    <Route index element={<Step1SelectTop10Talents />} />
                    <Route path="step-1" element={<Step1SelectTop10Talents />} />
                    <Route path="step-2" element={<Step2SelectTop3CoreTalents />} />
                    <Route path="step-3" element={<Step3OrderTalents />} />
                    <Route path="step-4" element={<Step4GenerateSnapshot />} />
                  </Route>
                  <Route path="/m/:slug" element={<RequireAuth><ModuleDetail /></RequireAuth>} />
                  <Route path="/modules" element={<RequireAuth><HolonicModulesPage /></RequireAuth>} />
                  <Route path="/modules/:slug" element={<RequireAuth><ModuleLandingPage /></RequireAuth>} />
                  {/* Mission Discovery */}
                  <Route path="/mission-discovery" element={<RequireAuth><MissionDiscoveryLanding /></RequireAuth>} />
                  <Route path="/mission-discovery/wizard" element={<RequireAuth><MissionDiscoveryWizard /></RequireAuth>} />
                  {/* Asset Mapping */}
                  <Route path="/asset-mapping" element={<RequireAuth><AssetMappingLanding /></RequireAuth>} />
                  <Route path="/asset-mapping/wizard" element={<RequireAuth><AssetMappingWizard /></RequireAuth>} />
                  {/* Product Builder - Legacy redirect to GameShell version */}
                  <Route path="/product-builder" element={<Navigate to="/game/build/product-builder" replace />} />
                  <Route path="/product-builder/*" element={<Navigate to="/game/build/product-builder" replace />} />
                  {/* Public Creator Pages — already in public section above */}
                  <Route path="/my-page" element={<RequireAuth><PublicPageEditor /></RequireAuth>} />
                  {/* Art Gallery - Wrapped with persistent audio */}
                  <Route path="/art" element={<RequireAuth><ArtLayout /></RequireAuth>}>
                    <Route index element={<ArtGallery />} />
                    <Route path=":category" element={<ArtPortfolio />} />
                  </Route>
                  {/* Tools */}
                  <Route path="/transcriber" element={<RequireAuth><Transcriber /></RequireAuth>} />
                  {/* Equilibrium — Standalone Living Clock */}
                  <Route path="/equilibrium" element={<RequireAuth><EquilibriumPage /></RequireAuth>} />
                  {/* Founder-Market Fit Landing Page */}
                  <Route path="/founder-market-fit" element={<RequireAuth><FounderMarketFit /></RequireAuth>} />
                  <Route path="/fmf" element={<RequireAuth><FounderMarketFit /></RequireAuth>} />
                  {/* Community Pages */}
                  <Route path="/the-originals" element={<RequireAuth><TheOriginalsPage /></RequireAuth>} />
                  {/* Venture Dashboard */}
                  <Route path="/dashboard" element={<GameShellV2><VentureDashboard /></GameShellV2>} />
                  <Route path="/holomap" element={<RequireAuth><MorphogeneticHolomap /></RequireAuth>} />
                  <Route path="/founders" element={<RequireAuth><FoundersShowcase /></RequireAuth>} />
                  {/* Day 47 very-late-night (Sasha): skin preview route.
                      /preview forces the Navy+Gold skin while mounted, so
                      Sasha can test the alternate aesthetic without affecting
                      the shipped Aurora experience for anyone else.
                      Not linked from any nav — discoverable by URL only. */}
                  <Route path="/preview" element={<SkinPreview />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </Suspense>
          </ErrorBoundary>
          </SoundCloudPlayerProvider>
        </BrowserRouter>
      </TooltipProvider>
      </SkinProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
