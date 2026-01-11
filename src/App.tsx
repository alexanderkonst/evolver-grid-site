import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomCursor from "@/components/CustomCursor";
// AnimatedBackground removed for minimal SaaS design
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import ContactNew from "./pages/ContactNew";
import Library from "./pages/Library";
import ModuleDetail from "./pages/ModuleDetail";
import AIUpgrade from "./pages/AIUpgrade";
import Destiny from "./pages/Destiny";
import MensCircle from "./pages/MensCircle";
import MensCircleThankYou from "./pages/MensCircleThankYou";
import GeniusOffer from "./pages/GeniusOffer";
import GeniusOfferIntake from "./pages/GeniusOfferIntake";
import AdminGeniusOffers from "./pages/AdminGeniusOffers";
import AdminMissionParticipants from "./pages/AdminMissionParticipants";
import AdminMissionSync from "./pages/AdminMissionSync";
import MultipleIntelligences from "./pages/MultipleIntelligences";
import GameHome from "./pages/GameHome";
import Today from "./pages/Today";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import GeniusLayerMatching from "./pages/GeniusLayerMatching";
import SkillTrees from "./pages/SkillTrees";
import GrowthPathsPage from "./pages/GrowthPathsPage";
import GameMap from "./pages/GameMap";
import CharacterHub from "./pages/CharacterHub";
import CharacterSnapshot from "./pages/CharacterSnapshot";
import ResourcesZogIntroVideo from "./pages/ResourcesZogIntroVideo";
import ResourcesPersonalityTests from "./pages/ResourcesPersonalityTests";
import QualityOfLifeMapAssessment from "./pages/QualityOfLifeMapAssessment";
import QualityOfLifeMapResults from "./pages/QualityOfLifeMapResults";
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
import NotFound from "./pages/NotFound";
// Space pages for the Game Shell
import TransformationSpace from "./pages/spaces/TransformationSpace";
import MarketplaceSpace from "./pages/spaces/MarketplaceSpace";
import MatchmakingSpace from "./pages/spaces/MatchmakingSpace";
import EventsSpace from "./pages/spaces/EventsSpace";
import CoopSpace from "./pages/spaces/CoopSpace";
import EventDetail from "./pages/EventDetail";
import CommunityEvents from "./pages/CommunityEvents";
import Connections from "./pages/Connections";
import PeopleDirectory from "./pages/PeopleDirectory";
import MissionSelection from "./pages/MissionSelection";
import PublicProfile from "./pages/PublicProfile";
import OnboardingStart from "./pages/OnboardingStart";
// Core Loop
import CoreLoopHome from "./pages/CoreLoopHome";
// Mission Discovery
import MissionDiscoveryLanding from "./modules/mission-discovery/MissionDiscoveryLanding";
import MissionDiscoveryWizard from "./modules/mission-discovery/MissionDiscoveryWizard";
// Asset Mapping
import AssetMappingLanding from "./modules/asset-mapping/AssetMappingLanding";
import AssetMappingWizard from "./modules/asset-mapping/AssetMappingWizard";
// Marketplace
import CreatorPage from "./pages/CreatorPage";
import PublicPageEditor from "./pages/PublicPageEditor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* AnimatedBackground removed for minimal SaaS design */}
      <CustomCursor />
      <BrowserRouter>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/:category" element={<Library />} />
            <Route path="/contact" element={<ContactNew />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/start" element={<OnboardingStart />} />
            <Route path="/profile/:userId" element={<PublicProfile />} />
            <Route path="/u/:username" element={<PublicProfile />} />
            <Route path="/profile" element={<Navigate to="/game/profile" replace />} />
            <Route path="/ai-upgrade" element={<AIUpgrade />} />
            <Route path="/destiny" element={<Destiny />} />
            <Route path="/mens-circle" element={<MensCircle />} />
            <Route path="/mens-circle/thank-you" element={<MensCircleThankYou />} />
            <Route path="/genius-offer" element={<GeniusOffer />} />
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
            <Route path="/game/profile" element={<CharacterHub />} />
            <Route path="/game/transformation" element={<TransformationSpace />} />
            <Route path="/game/marketplace" element={<MarketplaceSpace />} />
            <Route path="/game/matchmaking" element={<MatchmakingSpace />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/game/mission" element={<MissionSelection />} />
            <Route path="/community/people" element={<PeopleDirectory />} />
            <Route path="/game/events" element={<EventsSpace />} />
            <Route path="/game/coop" element={<CoopSpace />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/community/:communityId" element={<CommunityEvents />} />
            <Route path="/game/snapshot" element={<CharacterSnapshot />} />
            <Route path="/game/path/:pathId" element={<GrowthPathsPage />} />
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
            {/* Public Creator Pages */}
            <Route path="/p/:slug" element={<CreatorPage />} />
            <Route path="/my-page" element={<PublicPageEditor />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
