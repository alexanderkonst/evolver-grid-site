import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/EmptyState";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BackButton from "@/components/BackButton";

interface ConnectionRow {
  id: string;
  requester_id: string | null;
  receiver_id: string | null;
  status: string | null;
  message: string | null;
  created_at: string | null;
}

interface ProfileSummary {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const Connections = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileSummary>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("connections")
        .select("*")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

      const rows = (data || []) as ConnectionRow[];
      setConnections(rows);

      const otherUserIds = Array.from(
        new Set(
          rows
            .flatMap((row) => [row.requester_id, row.receiver_id])
            .filter((id): id is string => Boolean(id) && id !== user.id)
        )
      );

      if (otherUserIds.length > 0) {
        const { data: profileRows } = await supabase
          .from("game_profiles")
          .select("user_id, first_name, last_name, avatar_url")
          .in("user_id", otherUserIds);

        const nextProfiles: Record<string, ProfileSummary> = {};
        profileRows?.forEach((profile) => {
          if (profile.user_id) {
            nextProfiles[profile.user_id] = profile as ProfileSummary;
          }
        });
        setProfiles(nextProfiles);
      }

      setLoading(false);
    };
    load();
  }, []);

  const incoming = useMemo(
    () => connections.filter((row) => row.receiver_id === userId && row.status === "pending"),
    [connections, userId]
  );
  const outgoing = useMemo(
    () => connections.filter((row) => row.requester_id === userId && row.status === "pending"),
    [connections, userId]
  );
  const accepted = useMemo(
    () => connections.filter((row) => row.status === "accepted"),
    [connections]
  );
  const hasConnections = incoming.length > 0 || outgoing.length > 0 || accepted.length > 0;

  const handleRespond = async (row: ConnectionRow, status: "accepted" | "declined") => {
    if (!row.id) return;
    setUpdating(row.id);
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status, responded_at: new Date().toISOString() })
        .eq("id", row.id);

      if (error) throw error;

      setConnections((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, status } : item))
      );

      toast({
        title: status === "accepted" ? "Connection accepted" : "Request declined",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update request.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (!userId && !loading) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">Sign in to view connections</h1>
          <Button onClick={() => navigate("/auth")}>Sign in</Button>
        </div>
      </GameShellV2>
    );
  }

  if (loading) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={idx} className="h-20" />
          ))}
        </div>
      </GameShellV2>
    );
  }

  const renderRow = (row: ConnectionRow, showActions: boolean) => {
    const otherId = row.requester_id === userId ? row.receiver_id : row.requester_id;
    const profile = otherId ? profiles[otherId] : undefined;
    const name = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : "Community member";

    return (
      <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">{name}</p>
            {row.message && <p className="text-sm text-slate-600 mt-1">"{row.message}"</p>}
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRespond(row, "declined")}
                disabled={updating === row.id}
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleRespond(row, "accepted")}
                disabled={updating === row.id}
              >
                Accept
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <GameShellV2>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <BackButton to="/game/matches" className="mb-6" />

        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-6 h-6 text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-900">Connections</h1>
        </div>

        {!hasConnections ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <EmptyState
              icon={<UserPlus className="w-6 h-6 text-slate-500" />}
              title="No connections yet"
              description="Start connecting with people to build your network."
              action={{
                label: "Find People",
                onClick: () => navigate("/community/people"),
              }}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-600">Pending requests</h2>
              {incoming.length === 0 ? (
                <p className="text-sm text-slate-500">No incoming requests.</p>
              ) : (
                incoming.map((row) => renderRow(row, true))
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-600">Sent requests</h2>
              {outgoing.length === 0 ? (
                <p className="text-sm text-slate-500">No sent requests.</p>
              ) : (
                outgoing.map((row) => renderRow(row, false))
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-600">Active connections</h2>
              {accepted.length === 0 ? (
                <p className="text-sm text-slate-500">No accepted connections yet.</p>
              ) : (
                accepted.map((row) => renderRow(row, false))
              )}
            </section>
          </div>
        )}
      </div>
    </GameShellV2>
  );
};

export default Connections;
