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
import Work from "./pages/Work";
import Library from "./pages/Library";
import ModuleDetail from "./pages/ModuleDetail";
import AIUpgrade from "./pages/AIUpgrade";
import AIUpgradeInstall from "./pages/AIUpgradeInstall";
import Destiny from "./pages/Destiny";
import QualityOfLifeMapAssessment from "./pages/QualityOfLifeMapAssessment";
import QualityOfLifeMapResults from "./pages/QualityOfLifeMapResults";
import QolLayout from "./modules/quality-of-life-map/QolLayout";
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
            <Route path="/work" element={<Work />} />
            <Route path="/library" element={<Library />} />
            <Route path="/contact" element={<ContactNew />} />
            <Route path="/ai-upgrade" element={<AIUpgrade />} />
            <Route path="/ai-upgrade/install" element={<AIUpgradeInstall />} />
            <Route path="/destiny" element={<Destiny />} />
            <Route path="/quality-of-life-map" element={<QolLayout />}>
              <Route path="assessment" element={<QualityOfLifeMapAssessment />} />
              <Route path="results" element={<QualityOfLifeMapResults />} />
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
