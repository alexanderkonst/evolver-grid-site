import { Link } from "react-router-dom";
import { Module } from "@/types/module";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ModuleTileProps {
  module: Module;
}

const ModuleTile = ({ module }: ModuleTileProps) => {
  const statusColor = {
    Live: "bg-green-500/10 text-green-500 border-green-500/20",
    Beta: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "Coming Soon": "bg-muted text-muted-foreground border-border",
  };

  // Special route for AI Upgrade
  const linkPath = module.slug === "ai-upgrade-v4-01" ? "/ai-upgrade" : `/m/${module.slug}`;
  const isComingSoon = module.status === "Coming Soon";
  const isLive = module.status === "Live";

  const cardContent = (
    <Card className={`group h-full overflow-hidden border-border transition-all duration-300 ${
      isComingSoon 
        ? 'bg-card/40 hover:bg-card/50 cursor-pointer' 
        : isLive
        ? 'bg-card shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] hover:border-accent hover:bg-card/80 cursor-pointer'
        : 'bg-card hover:border-accent hover:bg-card/80 cursor-pointer'
    }`}>
      {module.thumbnail_image && (
        <div className={`aspect-video w-full overflow-hidden ${
          isComingSoon ? 'bg-muted/30' : 'bg-muted'
        }`}>
          <img
            src={module.thumbnail_image}
            alt={module.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isComingSoon ? 'opacity-40' : 'group-hover:scale-105'
            }`}
          />
        </div>
      )}
      <div className="p-6 space-y-3">
        <h3 className="text-xl font-serif font-semibold transition-colors group-hover:text-accent">
          {module.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {module.tagline}
        </p>
        
        <Badge 
          variant="outline" 
          className={`${statusColor[module.status]}`}
        >
          {module.status}
        </Badge>
      </div>
    </Card>
  );

  return (
    <Link to={linkPath} className="block h-full">
      {cardContent}
    </Link>
  );
};

export default ModuleTile;
