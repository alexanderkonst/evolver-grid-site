import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomCursor from "@/components/CustomCursor";
import AnimatedBackground from "@/components/AnimatedBackground";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ContactNew from "./pages/ContactNew";
import Library from "./pages/Library";
import ModuleDetail from "./pages/ModuleDetail";
import AIUpgrade from "./pages/AIUpgrade";
import Destiny from "./pages/Destiny";
import MensCircle from "./pages/MensCircle";
import GeniusOffer from "./pages/GeniusOffer";
import GeniusOfferIntake from "./pages/GeniusOfferIntake";
import AdminGeniusOffers from "./pages/AdminGeniusOffers";
import MultipleIntelligences from "./pages/MultipleIntelligences";
import GameHome from "./pages/GameHome";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SkillTrees from "./pages/SkillTrees";
import GameMap from "./pages/GameMap";
import CharacterHub from "./pages/CharacterHub";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AnimatedBackground />
      <CustomCursor />
      <BrowserRouter>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/library" element={<Library />} />
            <Route path="/contact" element={<ContactNew />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ai-upgrade" element={<AIUpgrade />} />
            <Route path="/destiny" element={<Destiny />} />
            <Route path="/mens-circle" element={<MensCircle />} />
            <Route path="/genius-offer" element={<GeniusOffer />} />
            <Route path="/genius-offer-intake" element={<GeniusOfferIntake />} />
            <Route path="/admin/genius-offers" element={<AdminGeniusOffers />} />
            <Route path="/genius-admin" element={<AdminGeniusOffers />} />
            <Route path="/intelligences" element={<MultipleIntelligences />} />
            <Route path="/game" element={<GameHome />} />
            <Route path="/character" element={<GameHome />} />
            <Route path="/map" element={<GameMap />} />
            <Route path="/skills" element={<SkillTrees />} />
            <Route path="/resources/zog-intro-video" element={<ResourcesZogIntroVideo />} />
            <Route path="/resources/personality-tests" element={<ResourcesPersonalityTests />} />
            <Route path="/quality-of-life-map" element={<QolLayout />}>
              <Route path="assessment" element={<QualityOfLifeMapAssessment />} />
              <Route path="results" element={<QualityOfLifeMapResults />} />
            </Route>
            <Route path="/zone-of-genius" element={<ZoneOfGeniusLandingPage />} />
            <Route path="/zone-of-genius/assessment" element={<ZoneOfGeniusAssessmentLayout />}>
              <Route index element={<Step0SwipeTalents />} />
              <Route path="step-0" element={<Step0SwipeTalents />} />
              <Route path="step-1" element={<Step1SelectTop10Talents />} />
              <Route path="step-2" element={<Step2SelectTop3CoreTalents />} />
              <Route path="step-3" element={<Step3OrderTalents />} />
              <Route path="step-4" element={<Step4GenerateSnapshot />} />
            </Route>
            <Route path="/m/:slug" element={<ModuleDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
