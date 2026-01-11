import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

type MissionParticipant = {
  id: string;
  created_at: string;
  user_id: string;
  email: string;
  first_name: string | null;
  mission_id: string;
  mission_title: string;
  pillar_id: string | null;
  focus_area_id: string | null;
  challenge_id: string | null;
  outcome_id: string | null;
  share_consent: boolean;
  wants_to_lead: boolean;
  wants_to_integrate: boolean;
  notify_level: string;
  email_frequency: string;
  notified_at: string | null;
};

const AdminMissionParticipants = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<MissionParticipant[]>([]);

  const ADMIN_EMAILS = ["alexanderkonst@gmail.com", "alex@evolvergrid.com"];

  const checkAdminRole = async (userEmail: string | undefined): Promise<boolean> => {
    if (!userEmail) return false;
    return ADMIN_EMAILS.includes(userEmail.toLowerCase());
  };

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mission_participants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setParticipants((data || []) as MissionParticipant[]);
    } catch (error) {
      toast({
        title: "Error loading participants",
        description: "Please retry.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        if (session?.user) {
          const hasAdminRole = await checkAdminRole(session.user.email);
          setIsAdmin(hasAdminRole);
          if (hasAdminRole) {
            fetchParticipants();
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const hasAdminRole = await checkAdminRole(session.user.email);
        setIsAdmin(hasAdminRole);
        if (hasAdminRole) {
          fetchParticipants();
        }
      } else {
        setIsAdmin(false);
        setParticipants([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 pt-28 pb-20 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin access required</h1>
          <p className="text-sm text-slate-600 mb-6">You don&apos;t have permission to access this page.</p>
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <Button size="sm" onClick={fetchParticipants}>Refresh</Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Mission Participants</h1>
          <p className="text-sm text-slate-600">Track who committed to missions and their connection preferences.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading participants...
          </div>
        ) : participants.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No mission participants yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Mission</th>
                  <th className="text-left px-4 py-3 font-semibold">User</th>
                  <th className="text-left px-4 py-3 font-semibold">Consent</th>
                  <th className="text-left px-4 py-3 font-semibold">Preferences</th>
                  <th className="text-left px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{participant.mission_title}</p>
                      <p className="text-xs text-slate-500">{participant.mission_id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{participant.first_name || "Unknown"}</p>
                      <p className="text-xs text-slate-500">{participant.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${participant.share_consent ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                        {participant.share_consent ? "Shared" : "Private"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>Notify: {participant.notify_level} · {participant.email_frequency}</div>
                      <div>Lead: {participant.wants_to_lead ? "Yes" : "No"} · Integrate: {participant.wants_to_integrate ? "Yes" : "No"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(participant.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminMissionParticipants;
