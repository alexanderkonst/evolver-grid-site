import { useNavigate } from "react-router-dom";
import gameMapCenter from "@/assets/dodecahedron.jpg";
import { Sparkles, Crown, Droplet, Sun, TreeDeciduous } from "lucide-react";
import { cn } from "@/lib/utils";

// External icon URLs
const wakingUpIcon = "https://i.imgur.com/oUfcX6u.jpeg";
const growingUpIcon = "https://i.imgur.com/IKYoNej.jpeg";
const cleaningUpIcon = "https://i.imgur.com/opqt3kV.jpeg";
const showingUpIcon = "https://i.imgur.com/6ct5Dca.jpeg";
const groundingIcon = "https://i.imgur.com/NdNMFFa.jpeg";

interface DevelopmentPath {
    id: string;
    name: string;
    subtitle: string;
    color: string;
    icon?: string;
    fallbackIcon: typeof Sparkles;
    position: {
        angle: number; // degrees from top
        distance: number; // % from center
    };
    progress: number; // 0-100
}

const PATHS: DevelopmentPath[] = [
    {
        id: "waking-up",
        name: "Waking Up",
        subtitle: "Consciousness · Information",
        color: "#9b5de5",
        icon: wakingUpIcon,
        fallbackIcon: Sparkles,
        position: { angle: 0, distance: 38 },
        progress: 45,
    },
    {
        id: "showing-up",
        name: "Showing Up",
        subtitle: "Excitement · Uniqueness",
        color: "#ff6b35",
        icon: showingUpIcon,
        fallbackIcon: Sun,
        position: { angle: 288, distance: 38 },
        progress: 30,
    },
    {
        id: "growing-up",
        name: "Growing Up",
        subtitle: "Worldview · Mind",
        color: "#f5a623",
        icon: growingUpIcon,
        fallbackIcon: Crown,
        position: { angle: 72, distance: 38 },
        progress: 60,
    },
    {
        id: "cleaning-up",
        name: "Cleaning Up",
        subtitle: "Autonomy · Emotions",
        color: "#4361ee",
        icon: cleaningUpIcon,
        fallbackIcon: Droplet,
        position: { angle: 216, distance: 38 },
        progress: 20,
    },
    {
        id: "grounding",
        name: "Grounding",
        subtitle: "Life Energy · Body",
        color: "#2d6a4f",
        icon: groundingIcon,
        fallbackIcon: TreeDeciduous,
        position: { angle: 144, distance: 38 },
        progress: 55,
    },
];

interface GameDodecahedronProps {
    onPathClick?: (pathId: string) => void;
    progress?: Record<string, number>;
}

const GameDodecahedron = ({ onPathClick, progress }: GameDodecahedronProps) => {
    const navigate = useNavigate();

    const handlePathClick = (pathId: string) => {
        if (onPathClick) {
            onPathClick(pathId);
        } else {
            navigate(`/skills?path=${pathId}`);
        }
    };

    // Convert polar coordinates to x,y percentages
    const getPosition = (angle: number, distance: number) => {
        const radians = ((angle - 90) * Math.PI) / 180;
        const x = 50 + distance * Math.cos(radians);
        const y = 50 + distance * Math.sin(radians);
        return { x, y };
    };

    return (
        <div className="relative w-full aspect-square max-w-lg mx-auto">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-radial from-slate-800/50 via-slate-900/80 to-slate-950 rounded-full" />

            {/* Connection lines from center to each path */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {PATHS.map((path) => {
                    const pos = getPosition(path.position.angle, path.position.distance);
                    return (
                        <line
                            key={`line-${path.id}`}
                            x1="50"
                            y1="50"
                            x2={pos.x}
                            y2={pos.y}
                            stroke={path.color}
                            strokeWidth="0.5"
                            strokeOpacity="0.4"
                            strokeDasharray="2 2"
                        />
                    );
                })}
            </svg>

            {/* Center image - the dodecahedron */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 aspect-square">
                <img
                    src={gameMapCenter}
                    alt="Game of Life Center"
                    className="w-full h-full object-cover rounded-full animate-pulse"
                    style={{ animationDuration: "4s" }}
                />
            </div>

            {/* Path nodes positioned around the center */}
            {PATHS.map((path) => {
                const pos = getPosition(path.position.angle, path.position.distance);
                const currentProgress = progress?.[path.id] ?? path.progress;
                const FallbackIcon = path.fallbackIcon;

                return (
                    <button
                        key={path.id}
                        onClick={() => handlePathClick(path.id)}
                        className={cn(
                            "absolute transform -translate-x-1/2 -translate-y-1/2 z-10",
                            "flex flex-col items-center gap-1 p-2 rounded-xl",
                            "transition-all duration-300 hover:scale-110",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900"
                        )}
                        style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                        }}
                    >
                        {/* Icon container with progress ring */}
                        <div className="relative">
                            {/* Progress ring */}
                            <svg className="absolute inset-0 w-18 h-18 sm:w-22 sm:h-22 -rotate-90" style={{ width: '72px', height: '72px' }}>
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    fill="none"
                                    stroke={path.color}
                                    strokeWidth="3"
                                    strokeOpacity="0.2"
                                />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    fill="none"
                                    stroke={path.color}
                                    strokeWidth="3"
                                    strokeDasharray={`${currentProgress * 2.83} 283`}
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Icon */}
                            <div
                                className="w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${path.color}25`, width: '72px', height: '72px' }}
                            >
                                {path.icon ? (
                                    <img
                                        src={path.icon}
                                        alt={path.name}
                                        className="w-14 h-14 sm:w-18 sm:h-18 rounded-full object-cover"
                                        style={{ width: '56px', height: '56px' }}
                                    />
                                ) : (
                                    <FallbackIcon
                                        className="w-8 h-8 sm:w-10 sm:h-10"
                                        style={{ color: path.color }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Label */}
                        <div className="text-center max-w-20 sm:max-w-24">
                            <div
                                className="text-xs sm:text-sm font-semibold leading-tight"
                                style={{ color: path.color }}
                            >
                                {path.name}
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-400 leading-tight hidden sm:block">
                                {path.subtitle}
                            </div>
                        </div>
                    </button>
                );
            })}

            {/* Center tap area for quick actions */}
            <button
                onClick={() => navigate("/skills")}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center bg-white/10 backdrop-blur-sm"
            >
                <span className="text-xs text-white/80">All Paths</span>
            </button>
        </div>
    );
};

export default GameDodecahedron;
