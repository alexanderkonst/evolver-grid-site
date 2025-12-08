import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useStripePortal() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const openPortal = async () => {
        setIsLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast({
                    title: "Not logged in",
                    description: "Please log in to manage your subscription.",
                    variant: "destructive",
                });
                return;
            }

            const response = await supabase.functions.invoke("create-portal-session", {
                body: {
                    returnUrl: window.location.href,
                },
            });

            if (response.error) {
                throw new Error(response.error.message);
            }

            const { url } = response.data;

            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No portal URL returned");
            }
        } catch (error: any) {
            console.error("Error opening portal:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to open subscription management.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { openPortal, isLoading };
}
