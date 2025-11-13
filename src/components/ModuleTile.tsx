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

  return (
    <Link to={`/m/${module.slug}`} className="block h-full">
      <Card className="group h-full overflow-hidden border-border bg-card hover:border-accent hover:bg-card/80 transition-all duration-300 cursor-pointer">
        {module.thumbnail_image && (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={module.thumbnail_image}
              alt={module.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-serif font-semibold group-hover:text-accent transition-colors">
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
    </Link>
  );
};

export default ModuleTile;
