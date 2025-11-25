import { Link } from "react-router-dom";
import { Module } from "@/types/module";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import WaitlistModal from "./WaitlistModal";
import BoldText from "./BoldText";
import { Sparkles, TrendingUp, Briefcase, Flower2, Wrench, Smartphone } from "lucide-react";
import destinyIcon from "@/assets/destiny-icon.png";
import aiUpgradeIcon from "@/assets/ai-upgrade-icon.png";

interface ModuleTileProps {
  module: Module;
}

const ModuleTile = ({ module }: ModuleTileProps) => {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  
  const statusColor = {
    Live: "bg-green-500/10 text-green-500 border-green-500/20",
    Beta: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "Coming Soon": "bg-muted text-muted-foreground border-border",
  };

  const categoryIcons = {
    AI: Sparkles,
    Growth: TrendingUp,
    Business: Briefcase,
    Ceremonies: Flower2,
    Tools: Wrench,
    Apps: Smartphone,
    Other: Sparkles,
  };

  const IconComponent = categoryIcons[module.category] || Sparkles;

  // Check if this module should use a custom image
  const useCustomImage = module.slug === "destiny" || module.slug === "intelligence-boost-for-your-ai-model";
  const customImageSrc = module.slug === "destiny" ? destinyIcon : 
                         module.slug === "intelligence-boost-for-your-ai-model" ? aiUpgradeIcon : null;

  // Use custom route for Destiny module, standard route for others
  const linkPath = module.slug === "destiny" ? "/destiny" : `/m/${module.slug}`;
  const isComingSoon = module.status === "Coming Soon";
  const isLive = module.status === "Live";

  const handleWaitlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWaitlistOpen(true);
  };

  const cardContent = (
    <Card className={`group h-full overflow-hidden border-border transition-all duration-500 ease-out ${
      isComingSoon 
        ? 'bg-card/50 hover:bg-card/60 cursor-pointer opacity-60' 
        : isLive
        ? 'bg-card shadow-md hover:shadow-2xl hover:shadow-accent/20 hover:border-accent hover:-translate-y-2 hover:scale-[1.02] cursor-pointer'
        : 'bg-card shadow-sm hover:shadow-xl hover:shadow-accent/10 hover:border-accent hover:-translate-y-1 cursor-pointer'
    }`}>
      {module.thumbnail_image && (
        <div className={`aspect-video w-full overflow-hidden ${
          isComingSoon ? 'bg-muted/10' : 'bg-muted'
        }`}>
          <img
            src={module.thumbnail_image}
            alt={module.title}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              isComingSoon ? 'opacity-20 grayscale' : 'group-hover:scale-110 group-hover:brightness-110'
            }`}
          />
        </div>
      )}
      <div className="p-6 space-y-3">
        <div className="flex flex-col items-center text-center space-y-3">
          {useCustomImage && customImageSrc ? (
            <img 
              src={customImageSrc} 
              alt={module.title} 
              className={`h-12 w-12 object-contain ${
                isComingSoon ? 'opacity-40 grayscale' : ''
              }`} 
            />
          ) : (
            <IconComponent className={`h-12 w-12 ${
              isComingSoon ? 'text-muted-foreground/40' : 'text-accent'
            }`} />
          )}
          <h3 className={`text-xl font-serif font-semibold transition-all duration-300 ${
            isComingSoon ? 'text-muted-foreground' : 'group-hover:text-accent group-hover:scale-105'
          }`}>
            <BoldText>{module.title}</BoldText>
          </h3>
        </div>
        
        <p className={`text-sm line-clamp-2 leading-relaxed ${
          isComingSoon ? 'text-muted-foreground/60' : 'text-muted-foreground'
        }`}>
          {module.tagline}
        </p>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${statusColor[module.status]}`}
          >
            {module.status}
          </Badge>
          
          {isComingSoon && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWaitlistClick}
              className="ml-auto"
            >
              Join Waitlist
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <Link to={linkPath} className="block h-full group">
        {cardContent}
      </Link>
      {isComingSoon && (
        <WaitlistModal
          isOpen={isWaitlistOpen}
          onClose={() => setIsWaitlistOpen(false)}
          moduleName={module.title}
        />
      )}
    </>
  );
};

export default ModuleTile;
