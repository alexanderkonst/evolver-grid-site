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
    badge: "bg-green-100 text-green-700",
  },
  mind: {
    label: "Mind",
    icon: Brain,
    badge: "bg-blue-100 text-blue-700",
  },
  emotions: {
    label: "Emotions",
    icon: Heart,
    badge: "bg-pink-100 text-pink-700",
  },
  spirit: {
    label: "Spirit",
    icon: Sparkles,
    badge: "bg-purple-100 text-purple-700",
  },
  genius: {
    label: "Genius",
    icon: Zap,
    badge: "bg-amber-100 text-amber-700",
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
      className="rounded-xl border border-slate-200 bg-white"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
            <span>{title}</span>
            <span className="text-xs font-medium text-slate-400">({duration})</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-slate-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-500" />
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
        <p className="mb-3 text-sm leading-relaxed text-slate-600 last:mb-0">{children}</p>
      ),
      ul: ({ children }) => (
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-600 last:mb-0">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-slate-600 last:mb-0">
          {children}
        </ol>
      ),
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
      strong: ({ children }) => <strong className="font-semibold text-slate-700">{children}</strong>,
      a: ({ children, href }) => (
        <a
          className="font-medium text-amber-700 underline underline-offset-2"
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
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
          <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1", pathConfig.badge)}>
            <PathIcon className="h-4 w-4" />
            {pathConfig.label}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">{moduleId}</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 lg:text-3xl">{title}</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
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
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
              Video coming soon.
            </div>
          )}
        </AspectRatio>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Key Takeaway</p>
        <p className="mt-3 text-base leading-relaxed text-slate-700">{keyTakeaway}</p>
      </div>

      <CollapsibleSection title="Experience" duration={experience.duration} defaultOpen>
        <MarkdownContent content={experience.instructions} />
      </CollapsibleSection>

      <CollapsibleSection title="Integration" duration={integration.duration}>
        <MarkdownContent content={integration.instructions} />
      </CollapsibleSection>

      {hasResources && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Resources</p>
          <div className="mt-4 space-y-3">
            {resources?.map((resource) => {
              const Icon = RESOURCE_ICONS[resource.type];
              return (
                <a
                  key={`${resource.type}-${resource.url}`}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-700">{resource.title}</span>
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
