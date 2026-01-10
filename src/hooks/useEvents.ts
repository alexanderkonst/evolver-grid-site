import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type RsvpStatus = "going" | "maybe" | "not_going";

export interface EventWithRsvpCount extends Event {
  rsvp_count: number;
}

// Fetch all upcoming events with RSVP counts
export const useEvents = () => {
  const [events, setEvents] = useState<EventWithRsvpCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", today)
        .order("event_date", { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch RSVP counts for each event
      const eventsWithCounts: EventWithRsvpCount[] = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from("event_rsvps")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id)
            .eq("status", "going");

          return {
            ...event,
            rsvp_count: count || 0,
          };
        })
      );

      setEvents(eventsWithCounts);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (isMounted) {
        await fetchEvents();
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
};

// Fetch single event by ID with attendees
export const useEvent = (eventId: string | undefined) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Array<{ user_id: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch attendees
      const { data: rsvpData, error: rsvpError } = await supabase
        .from("event_rsvps")
        .select("user_id, status")
        .eq("event_id", eventId);

      if (rsvpError) throw rsvpError;
      setAttendees(rsvpData || []);
    } catch (err) {
      console.error("Error fetching event:", err);
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (isMounted) {
        await fetchEvent();
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchEvent]);

  return { event, attendees, loading, error, refetch: fetchEvent };
};

// RSVP hook for a specific event
export const useEventRsvp = (eventId: string | undefined) => {
  const [currentStatus, setCurrentStatus] = useState<RsvpStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch current user's RSVP status
  const fetchRsvpStatus = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("event_rsvps")
        .select("status")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setCurrentStatus(data?.status as RsvpStatus | null);
    } catch (err) {
      console.error("Error fetching RSVP status:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchRsvpStatus();
  }, [fetchRsvpStatus]);

  // Update RSVP status
  const updateRsvp = async (status: RsvpStatus) => {
    if (!eventId) return;

    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("event_rsvps")
        .upsert(
          {
            event_id: eventId,
            user_id: user.id,
            status,
          },
          { onConflict: "event_id,user_id" }
        );

      if (error) throw error;
      setCurrentStatus(status);
    } catch (err) {
      console.error("Error updating RSVP:", err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Remove RSVP
  const removeRsvp = async () => {
    if (!eventId) return;

    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("event_rsvps")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;
      setCurrentStatus(null);
    } catch (err) {
      console.error("Error removing RSVP:", err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return { currentStatus, loading, updating, updateRsvp, removeRsvp };
};

// Create event hook
export const useCreateEvent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async (eventData: Omit<EventInsert, "id" | "created_at" | "created_by">) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: insertError } = await supabase
        .from("events")
        .insert({
          ...eventData,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (err) {
      console.error("Error creating event:", err);
      const message = err instanceof Error ? err.message : "Failed to create event";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createEvent, loading, error };
};
