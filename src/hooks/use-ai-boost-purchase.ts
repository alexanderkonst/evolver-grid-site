import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useAIBoostPurchase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndPurchase = async () => {
      setIsLoading(true);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check if user has purchased
        const { data, error } = await supabase
          .from('ai_boost_purchases')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (!error && data) {
          setHasPurchased(true);
        }
      }
      
      setIsLoading(false);
    };

    checkAuthAndPurchase();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('ai_boost_purchases')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (!error && data) {
            setHasPurchased(true);
          } else {
            setHasPurchased(false);
          }
        } else {
          setHasPurchased(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const recordPurchase = async (source: string = 'stripe_checkout', stripeSessionId?: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('ai_boost_purchases')
        .upsert({
          user_id: user.id,
          source,
          stripe_session_id: stripeSessionId ?? null
        }, {
          onConflict: 'user_id'
        });
      
      if (!error) {
        setHasPurchased(true);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return { user, hasPurchased, isLoading, recordPurchase };
};
