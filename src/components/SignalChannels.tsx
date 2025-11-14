import { Youtube, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const channels = [
  {
    icon: Youtube,
    title: "YouTube",
    buttonLabel: "Visit",
    url: "https://www.youtube.com/@IntegralEvolution",
  },
  {
    icon: Send,
    title: "Telegram",
    buttonLabel: "Join",
    url: "https://t.me/ARKHAZM",
  },
];

const SignalChannels = () => {
  const animation = useScrollAnimation();

  return (
    <section
      ref={animation.ref}
      className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
        animation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-serif font-semibold mb-12 text-center">
          Signal Channels
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {channels.map((channel, index) => (
            <div key={channel.title}>
              <div className="flex flex-col items-center text-center space-y-6 py-6">
                <channel.icon className="w-8 h-8 text-foreground" strokeWidth={1.5} />
                
                <h3 className="text-xl font-serif font-semibold">
                  {channel.title}
                </h3>

                <Button
                  variant="outline"
                  size="default"
                  asChild
                  className="rounded-lg hover:bg-accent/10 hover:border-accent transition-colors"
                >
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {channel.buttonLabel}
                  </a>
                </Button>
              </div>

              {index === 0 && (
                <Separator className="md:hidden mt-8" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SignalChannels;
