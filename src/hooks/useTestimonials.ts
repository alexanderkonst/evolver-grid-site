import { useEffect, useState } from "react";
import type { TestimonialData } from "@/components/ExpandableTestimonial";
import { supabase } from "@/integrations/supabase/client";
/* Shared testimonial data (single source of truth) */
import { TESTIMONIALS } from "@/data/testimonials";

const FALLBACK_TESTIMONIALS = TESTIMONIALS;

/**
 * Fetch the active `ignite`-surface testimonials from Supabase; fall back to the
 * hardcoded list while loading, on error, or when the table returns no rows.
 * Moved out of IgniteSession.tsx so /ignite and /products/built share one source.
 */
export const useTestimonials = (): TestimonialData[] => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('testimonials')
          .select('person_name, title, short_quote, full_quote, sort_order')
          .eq('surface', 'ignite')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) return; // Keep fallback

        setTestimonials(data.map((row: any) => ({
          shortQuote: row.short_quote,
          fullQuote: row.full_quote,
          name: row.person_name,
          before: row.title,
        })));
      } catch {
        // Silently fall back to hardcoded
      }
    };
    fetchTestimonials();
  }, []);

  return testimonials;
};
