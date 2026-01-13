# Task: Create Single Growth Path Section Page

## Priority: HIGH

## Description
Create a new component that displays a SINGLE growth path (Body, Mind, Emotions, Genius, Spirit) instead of all 5. This page wraps in GameShellV2.

## File to Create
`src/pages/spaces/transformation/PathSection.tsx`

## Required Implementation

```tsx
import { useParams } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { Activity, Heart, Brain, Zap, Sparkles } from "lucide-react";

const PATH_INFO = {
    body: { 
        label: "Body", 
        icon: Activity, 
        description: "Physical vitality, energy, and health",
        color: "emerald"
    },
    emotions: { 
        label: "Emotions", 
        icon: Heart, 
        description: "Emotional regulation and shadow work",
        color: "rose"
    },
    mind: { 
        label: "Mind", 
        icon: Brain, 
        description: "Worldview, beliefs, and mental clarity",
        color: "blue"
    },
    genius: { 
        label: "Genius", 
        icon: Zap, 
        description: "Authenticity and self-expression",
        color: "amber"
    },
    spirit: { 
        label: "Spirit", 
        icon: Sparkles, 
        description: "Awareness, presence, and sensitivity",
        color: "purple"
    },
};

const PathSection = () => {
    const { pathId } = useParams<{ pathId: string }>();
    const pathInfo = PATH_INFO[pathId as keyof typeof PATH_INFO];
    
    if (!pathInfo) {
        return <GameShellV2><div>Path not found</div></GameShellV2>;
    }
    
    const Icon = pathInfo.icon;
    
    return (
        <GameShellV2>
            <div className="p-6 lg:p-8 max-w-2xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-6 h-6" />
                        <h1 className="text-2xl font-bold">{pathInfo.label}</h1>
                    </div>
                    <p className="text-slate-600">{pathInfo.description}</p>
                </div>
                
                <div className="rounded-xl border p-6 bg-white">
                    <p className="text-slate-600">
                        Coming soon: practices and content for the {pathInfo.label} path.
                    </p>
                </div>
            </div>
        </GameShellV2>
    );
};

export default PathSection;
```

## Acceptance Criteria
- [ ] Page exists and renders correctly for each pathId
- [ ] Wraps content in GameShellV2 (shows all 3 panels)
- [ ] Shows only the selected path, not all 5
- [ ] Handles invalid pathId gracefully

## Connect to Next Task
After creating this file, see task `PENDING_path_section_routes.md` to add routes.
