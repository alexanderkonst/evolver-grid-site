import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Activity,
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Headphones,
  Heart,
  Link as LinkIcon,
  Sparkles,
  Zap,
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface MicroModuleProps {
  moduleId: string;
  title: string;
  path: "spirit" | "mind" | "emotions" | "body" | "genius";
  videoUrl?: string;
  keyTakeaway: string;
  experience: {
    duration: string;
    instructions: string;
  };
  integration: {
    duration: string;
    instructions: string;
  };
  resources?: {
    title: string;
    url: string;
    type: "pdf" | "audio" | "link";
  }[];
  nextModuleId?: string;
  nextModuleTitle?: string;
  onComplete?: () => void;
}

const PATH_CONFIG = {
  body: {
    label: "Body",
    icon: Activity,
    badge: "bg-[#b1c9b6]/30 text-[#2c3150]",
  },
  mind: {
    label: "Mind",
    icon: Brain,
    badge: "bg-[#6894d0]/20 text-[#2c3150]",
  },
  emotions: {
    label: "Emotions",
    icon: Heart,
    badge: "bg-[#cea4ae]/30 text-[#2c3150]",
  },
  spirit: {
    label: "Spirit",
    icon: Sparkles,
    badge: "bg-[#c8b7d8]/30 text-[#2c3150]",
  },
  genius: {
    label: "Genius",
    icon: Zap,
    badge: "bg-[#8460ea]/20 text-[#8460ea]",
  },
} as const;

const RESOURCE_ICONS = {
  pdf: FileText,
  audio: Headphones,
  link: LinkIcon,
} as const;

interface CollapsibleSectionProps {
  title: string;
  duration: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({
  title,
  duration,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm shadow-[0_4px_16px_rgba(44,49,80,0.06)]"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-[#f0f4ff]/50"
        >
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#2c3150]/70">
            <span>{title}</span>
            <span className="text-xs font-medium text-[#2c3150]/50">({duration})</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-[#2c3150]/50" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#2c3150]/50" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 pt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const MarkdownContent = ({ content }: { content: string }) => (
  <ReactMarkdown
    components={{
      p: ({ children }) => (
        <p className="mb-3 text-sm leading-relaxed text-[rgba(44,49,80,0.7)] last:mb-0">{children}</p>
      ),
      ul: ({ children }) => (
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-[rgba(44,49,80,0.7)] last:mb-0">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-[rgba(44,49,80,0.7)] last:mb-0">
          {children}
        </ol>
      ),
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
      strong: ({ children }) => <strong className="font-semibold text-[#2c3150]">{children}</strong>,
      a: ({ children, href }) => (
        <a
          className="font-medium text-[#8460ea] underline underline-offset-2"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {children}
        </a>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

const MicroModulePage = ({
  moduleId,
  title,
  path,
  videoUrl,
  keyTakeaway,
  experience,
  integration,
  resources,
  nextModuleId,
  nextModuleTitle,
  onComplete,
}: MicroModuleProps) => {
  const pathConfig = PATH_CONFIG[path];
  const PathIcon = pathConfig.icon;
  const hasResources = resources && resources.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 lg:px-8">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#2c3150]/60">
          <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1", pathConfig.badge)}>
            <PathIcon className="h-4 w-4" />
            {pathConfig.label}
          </span>
          <span className="text-[#2c3150]/40">•</span>
          <span className="text-[#2c3150]/50">{moduleId}</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#2c3150] lg:text-3xl">{title}</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#a4a3d0]/20 bg-[#f0f4ff]/50">
        <AspectRatio ratio={16 / 9}>
          {videoUrl ? (
            <iframe
              title={`${title} video`}
              src={videoUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[#2c3150]/50">
              Video coming soon.
            </div>
          )}
        </AspectRatio>
      </div>

      <div className="rounded-2xl border border-[#8460ea]/30 bg-[#8460ea]/5 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8460ea]">Key Takeaway</p>
        <p className="mt-3 text-base leading-relaxed text-[#2c3150]">{keyTakeaway}</p>
      </div>

      <CollapsibleSection title="Experience" duration={experience.duration} defaultOpen>
        <MarkdownContent content={experience.instructions} />
      </CollapsibleSection>

      <CollapsibleSection title="Integration" duration={integration.duration}>
        <MarkdownContent content={integration.instructions} />
      </CollapsibleSection>

      {hasResources && (
        <div className="rounded-2xl border border-[#a4a3d0]/20 bg-white/85 p-5 backdrop-blur-sm shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2c3150]/60">Resources</p>
          <div className="mt-4 space-y-3">
            {resources?.map((resource) => {
              const Icon = RESOURCE_ICONS[resource.type];
              return (
                <a
                  key={`${resource.type}-${resource.url}`}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-[#a4a3d0]/20 bg-[#f0f4ff]/30 px-3 py-2 text-sm text-[#2c3150]/70 transition-colors hover:bg-[#f0f4ff]/60"
                >
                  <Icon className="h-4 w-4 text-[#2c3150]/50" />
                  <span className="font-medium text-[#2c3150]">{resource.title}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={onComplete} className="sm:w-auto">
          <Check className="mr-2 h-4 w-4" />
          Mark Complete
        </Button>
        <Button variant="outline" disabled={!nextModuleId} className="sm:w-auto">
          {nextModuleTitle ? `Next: ${nextModuleTitle}` : "Next Module"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MicroModulePage;
