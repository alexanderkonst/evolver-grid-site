import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIUpgradeInstall = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const upgradePrompt = "[Paste Upgrade Prompt Here]";

  const handleCopy = () => {
    navigator.clipboard.writeText(upgradePrompt);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The upgrade prompt has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <Link 
            to="/ai-upgrade" 
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: '#0A2342' }}
          >
            ← Back
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 
            className="text-4xl sm:text-5xl font-bold mb-8 text-center"
            style={{ color: '#0A2342' }}
          >
            Install the Upgrade
          </h1>
          
          <p className="text-xl text-gray-700 leading-relaxed text-center mb-12 max-w-2xl mx-auto">
            Copy the upgrade below and paste it into your AI model.
          </p>

          {/* Code Box */}
          <div className="relative">
            <div 
              className="p-8 rounded-2xl font-mono text-sm overflow-x-auto"
              style={{ backgroundColor: '#F5F5F7' }}
            >
              <pre className="text-gray-800 whitespace-pre-wrap break-words">
                {upgradePrompt}
              </pre>
            </div>

            {/* Copy Button */}
            <div className="mt-6 text-center">
              <Button
                onClick={handleCopy}
                size="lg"
                className="text-white px-8 py-6 rounded-full shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: '#0A2342' }}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 p-8 bg-gray-50 rounded-2xl">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: '#0A2342' }}
            >
              How to Install
            </h2>
            <ol className="space-y-3 text-lg text-gray-700">
              <li className="flex items-start">
                <span className="mr-3 font-semibold" style={{ color: '#0A2342' }}>1.</span>
                <span>Copy the upgrade prompt above</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-semibold" style={{ color: '#0A2342' }}>2.</span>
                <span>Open your AI model (ChatGPT, Claude, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-semibold" style={{ color: '#0A2342' }}>3.</span>
                <span>Paste the upgrade into the custom instructions or system prompt</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-semibold" style={{ color: '#0A2342' }}>4.</span>
                <span>Save and start using your upgraded AI</span>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIUpgradeInstall;
