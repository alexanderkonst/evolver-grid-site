import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import CustomCursor from "@/components/CustomCursor";
// AnimatedBackground removed for minimal SaaS design
import PageTransition from "@/components/PageTransition";
import ErrorBoundary from "@/components/ErrorBoundary";
import { getPageTitle } from "@/lib/pageTitles";
import ScrollRestoration from "@/components/ScrollRestoration";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import ContactNew from "./pages/ContactNew";
import Library from "./pages/Library";
import ModuleDetail from "./pages/ModuleDetail";
import AIUpgrade from "./pages/AIUpgrade";
import Destiny from "./pages/Destiny";
import MensCircle from "./pages/MensCircle";
import MensCircleThankYou from "./pages/MensCircleThankYou";
import GeniusOfferIntake from "./pages/GeniusOfferIntake";
import AdminMissionParticipants from "./pages/AdminMissionParticipants";
import AdminMissionSync from "./pages/AdminMissionSync";
import MultipleIntelligences from "./pages/MultipleIntelligences";
import GameHome from "./pages/GameHome";
import Today from "./pages/Today";
import Auth from "./pages/Auth";
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
import CharacterSnapshot from "./pages/CharacterSnapshot";
import ResourcesZogIntroVideo from "./pages/ResourcesZogIntroVideo";
import ResourcesPersonalityTests from "./pages/ResourcesPersonalityTests";
import QualityOfLifeMapAssessment from "./pages/QualityOfLifeMapAssessment";
import QualityOfLifePriorities from "./pages/QualityOfLifePriorities";
import QualityOfLifeGrowthRecipe from "./pages/QualityOfLifeGrowthRecipe";
import QolLayout from "./modules/quality-of-life-map/QolLayout";
import ZoneOfGeniusLandingPage from "./modules/zone-of-genius/ZoneOfGeniusLandingPage";
import ZoneOfGeniusAssessmentLayout from "./modules/zone-of-genius/ZoneOfGeniusAssessmentLayout";
import Step0SwipeTalents from "./modules/zone-of-genius/Step0SwipeTalents";
import Step1SelectTop10Talents from "./modules/zone-of-genius/Step1SelectTop10Talents";
import Step2SelectTop3CoreTalents from "./modules/zone-of-genius/Step2SelectTop3CoreTalents";
import Step3OrderTalents from "./modules/zone-of-genius/Step3OrderTalents";
import Step4GenerateSnapshot from "./modules/zone-of-genius/Step4GenerateSnapshot";
import ZoneOfGeniusEntry from "./modules/zone-of-genius/ZoneOfGeniusEntry";

import AppleseedView from "./pages/AppleseedView";
import ExcaliburView from "./pages/ExcaliburView";
import ZoGPerspectiveView from "./pages/spaces/profile/ZoGPerspectiveView";
import NotFound from "./pages/NotFound";
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
// Marketplace
import CreatorPage from "./pages/CreatorPage";
import PublicPageEditor from "./pages/PublicPageEditor";
import Profile from "./pages/Profile";
import ToolsRedirect from "./pages/ToolsRedirect";
import TestNavigation from "./pages/TestNavigation";
import BrowseGuides from "./pages/marketplace/BrowseGuides";
import MarketplaceProductPage from "./pages/marketplace/MarketplaceProductPage";
import ArtLayout from "./layouts/ArtLayout";
import ArtGallery from "./pages/art/ArtGallery";
import ArtPortfolio from "./pages/art/ArtPortfolio";
import Settings from "./pages/Settings";

const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-slate-900">
    <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
  </div>
);

const TransformationSpace = lazy(() => import("./pages/spaces/TransformationSpace"));
const MarketplaceSpace = lazy(() => import("./pages/spaces/MarketplaceSpace"));
const TeamsSpace = lazy(() => import("./pages/spaces/TeamsSpace"));
const EventsSpace = lazy(() => import("./pages/spaces/EventsSpace"));
const CoopSpace = lazy(() => import("./pages/spaces/CoopSpace"));
const QualityOfLifeMapResults = lazy(() => import("./pages/QualityOfLifeMapResults"));
const AdminGeniusOffers = lazy(() => import("./pages/AdminGeniusOffers"));

const queryClient = new QueryClient();

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = `Evolver | ${getPageTitle(location.pathname)}`;
  }, [location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* AnimatedBackground removed for minimal SaaS design */}
        <CustomCursor />
        <BrowserRouter>
          <TitleManager />
          <ScrollRestoration />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/library/:category" element={<Library />} />
                  <Route path="/contact" element={<ContactNew />} />
                  <Route path="/tools" element={<ToolsRedirect />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />

                  <Route path="/start" element={<Navigate to="/auth?mode=signup&redirect=/zone-of-genius/entry" replace />} />
                  <Route path="/profile/:userId" element={<PublicProfile />} />
                  <Route path="/u/:username" element={<PublicProfile />} />
                  <Route path="/profile" element={<Navigate to="/game/profile" replace />} />
                  <Route path="/settings" element={<Profile />} />
                  <Route path="/game/settings" element={<Settings />} />
                  <Route path="/marketplace" element={<Navigate to="/game/marketplace" replace />} />
                  <Route path="/marketplace/browse" element={<Navigate to="/game/marketplace/browse" replace />} />
                  <Route path="/marketplace/create-page" element={<PublicPageEditor />} />
                  <Route path="/ai-upgrade" element={<AIUpgrade />} />
                  <Route path="/destiny" element={<Destiny />} />
                  <Route path="/mens-circle" element={<MensCircle />} />
                  <Route path="/mens-circle/thank-you" element={<MensCircleThankYou />} />
                  <Route path="/genius-offer" element={<Navigate to="/zone-of-genius/entry" replace />} />
                  <Route path="/genius-offer-intake" element={<GeniusOfferIntake />} />
                  <Route path="/admin/genius-offers" element={<AdminGeniusOffers />} />
                  <Route path="/genius-admin" element={<AdminGeniusOffers />} />
                  <Route path="/admin/mission-participants" element={<AdminMissionParticipants />} />
                  <Route path="/admin/mission-sync" element={<AdminMissionSync />} />
                  <Route path="/intelligences" element={<MultipleIntelligences />} />
                  <Route path="/genius-layer-matching" element={<GeniusLayerMatching />} />
                  {/* Game Routes */}
                  <Route path="/game" element={<GameHome />} />
                  <Route path="/game/next-move" element={<CoreLoopHome />} />
                  <Route path="/game/profile" element={<ProfileOverview />} />
                  <Route path="/game/profile/settings" element={<Profile />} />
                  <Route path="/game/profile/mission" element={<ProfileMissionSection />} />
                  <Route path="/game/profile/assets" element={<ProfileAssetsSection />} />
                  <Route path="/game/profile/genius-business" element={<GeniusBusiness />} />
                  <Route path="/game/profile/genius-business/audience" element={<GeniusBusinessAudience />} />
                  <Route path="/game/profile/genius-business/promise" element={<GeniusBusinessPromise />} />
                  <Route path="/game/profile/genius-business/channels" element={<GeniusBusinessChannels />} />
                  <Route path="/game/profile/genius-business/vision" element={<GeniusBusinessVision />} />
                  <Route path="/game/profile/zone-of-genius" element={<ZoneOfGeniusOverview />} />
                  <Route path="/game/profile/zone-of-genius/:perspectiveId" element={<ZoGPerspectiveView />} />
                  <Route path="/game/transformation" element={<TransformationSpace />} />
                  <Route path="/game/transformation/today" element={<TodaysPractice />} />
                  <Route path="/game/transformation/paths" element={<TransformationGrowthPaths />} />
                  <Route path="/game/transformation/path/:pathId" element={<PathSection />} />
                  <Route path="/game/transformation/library" element={<TransformationPracticeLibrary />} />
                  <Route path="/game/transformation/tests" element={<TransformationPersonalityTests />} />
                  <Route path="/game/transformation/qol-assessment" element={<TransformationQolAssessment />} />
                  <Route path="/game/transformation/qol-results" element={<TransformationQolResults />} />
                  <Route path="/game/transformation/genius-assessment" element={<TransformationGeniusAssessment />}>
                    <Route path="step-0" element={<Step0SwipeTalents />} />
                    <Route path="step-1" element={<Step1SelectTop10Talents />} />
                    <Route path="step-2" element={<Step2SelectTop3CoreTalents />} />
                    <Route path="step-3" element={<Step3OrderTalents />} />
                    <Route path="step-4" element={<Step4GenerateSnapshot />} />
                  </Route>
                  <Route path="/game/marketplace" element={<MarketplaceSpace />} />
                  <Route path="/game/marketplace/browse" element={<BrowseGuides />} />
                  <Route path="/game/teams" element={<TeamsSpace />} />
                  <Route path="/game/matches" element={<Matchmaking />} />
                  <Route path="/connections" element={<Connections />} />
                  <Route path="/game/mission" element={<MissionSelection />} />
                  <Route path="/community/people" element={<PeopleDirectory />} />
                  <Route path="/game/events" element={<EventsSpace />} />
                  <Route path="/game/events/create" element={<CreateEvent />} />
                  <Route path="/game/events/my-rsvps" element={<MyRsvps />} />
                  <Route path="/game/coop" element={<CoopSpace />} />
                  <Route path="/events" element={<Navigate to="/game/events" replace />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/events/community/:communityId" element={<CommunityEvents />} />
                  <Route path="/game/snapshot" element={<CharacterSnapshot />} />
                  <Route path="/game/path/:pathId" element={<GrowthPathsPage />} />
                  <Route path="/game/test-nav" element={<TestNavigation />} />
                  <Route path="/today" element={<Today />} />
                  <Route path="/character" element={<Today />} />
                  <Route path="/map" element={<GameMap />} />
                  <Route path="/skills" element={<GrowthPathsPage />} />
                  <Route path="/growth-paths" element={<GrowthPathsPage />} />
                  <Route path="/resources/zog-intro-video" element={<ResourcesZogIntroVideo />} />
                  <Route path="/resources/personality-tests" element={<ResourcesPersonalityTests />} />
                  <Route path="/quality-of-life-map" element={<QolLayout />}>
                    <Route path="assessment" element={<QualityOfLifeMapAssessment />} />
                    <Route path="results" element={<QualityOfLifeMapResults />} />
                    <Route path="priorities" element={<QualityOfLifePriorities />} />
                    <Route path="growth-recipe" element={<QualityOfLifeGrowthRecipe />} />
                  </Route>
                  <Route path="/zone-of-genius" element={<ZoneOfGeniusLandingPage />} />
                  <Route path="/zone-of-genius/appleseed" element={<AppleseedView />} />
                  <Route path="/zone-of-genius/excalibur" element={<ExcaliburView />} />
                  <Route path="/zone-of-genius/entry" element={<ZoneOfGeniusEntry />} />
                  <Route path="/zone-of-genius/assessment" element={<ZoneOfGeniusAssessmentLayout />}>
                    <Route index element={<Step0SwipeTalents />} />
                    <Route path="step-0" element={<Step0SwipeTalents />} />
                    <Route path="step-1" element={<Step1SelectTop10Talents />} />
                    <Route path="step-2" element={<Step2SelectTop3CoreTalents />} />
                    <Route path="step-3" element={<Step3OrderTalents />} />
                    <Route path="step-4" element={<Step4GenerateSnapshot />} />
                  </Route>
                  <Route path="/m/:slug" element={<ModuleDetail />} />
                  {/* Mission Discovery */}
                  <Route path="/mission-discovery" element={<MissionDiscoveryLanding />} />
                  <Route path="/mission-discovery/wizard" element={<MissionDiscoveryWizard />} />
                  {/* Asset Mapping */}
                  <Route path="/asset-mapping" element={<AssetMappingLanding />} />
                  <Route path="/asset-mapping/wizard" element={<AssetMappingWizard />} />
                  {/* Product Builder */}
                  <Route path="/product-builder" element={<ProductBuilderLayout />}>
                    <Route index element={<ProductBuilderEntry />} />
                    <Route path="icp" element={<DeepICPScreen />} />
                    <Route path="pain" element={<DeepPainScreen />} />
                    <Route path="promise" element={<DeepTPScreen />} />
                    <Route path="landing" element={<LandingPageScreen />} />
                    <Route path="blueprint" element={<BlueprintScreen />} />
                    <Route path="cta" element={<CTAScreen />} />
                    <Route path="published" element={<PublishedScreen />} />
                  </Route>
                  {/* Public Creator Pages */}
                  <Route path="/p/:slug" element={<CreatorPage />} />
                  <Route path="/mp/:slug" element={<MarketplaceProductPage />} />
                  <Route path="/my-page" element={<PublicPageEditor />} />
                  {/* Art Gallery - Wrapped with persistent audio */}
                  <Route path="/art" element={<ArtLayout />}>
                    <Route index element={<ArtGallery />} />
                    <Route path=":category" element={<ArtPortfolio />} />
                  </Route>
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
