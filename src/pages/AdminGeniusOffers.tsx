import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import BackButton from "@/components/BackButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeniusOfferRequest {
  id: string;
  created_at: string;
  user_id: string | null;
  name: string;
  email: string;
  has_ai_assistant: boolean;
  source_branch: string | null;
  ai_summary_raw: string | null;
  no_ai_genius_description: string | null;
  offers_sold: string | null;
  best_client_story: string | null;
  products_sold: string | null;
  best_clients: string | null;
  extra_notes: string | null;
  intelligences_note: string | null;
  status: string;
  pdf_url: string | null;
  summary_title: string | null;
  summary_promise: string | null;
}

const STATUS_OPTIONS = [
  { value: "intake_received", label: "Intake Received" },
  { value: "apple_seed_in_progress", label: "AppleSeed In Progress" },
  { value: "excalibur_in_progress", label: "Excalibur In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const getAiBranchLabel = (req: GeniusOfferRequest) => {
  if (!req.has_ai_assistant) return "No AI (Tests)";
  if (req.source_branch === "ai") {
    if (req.products_sold || req.best_clients) return "AI (short prompt)";
    return "AI + offers known";
  }
  return req.source_branch || "AI";
};

const AdminGeniusOffers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState<GeniusOfferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<GeniusOfferRequest | null>(null);

  // Admin check by email (simpler than RPC which may not exist)
  const ADMIN_EMAILS = ['alexanderkonst@gmail.com', 'alex@evolvergrid.com'];

  const checkAdminRole = async (userEmail: string | undefined): Promise<boolean> => {
    if (!userEmail) return false;
    return ADMIN_EMAILS.includes(userEmail.toLowerCase());
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
            fetchRequests();
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const hasAdminRole = await checkAdminRole(session.user.email);
        setIsAdmin(hasAdminRole);

        if (hasAdminRole) {
          fetchRequests();
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("genius_offer_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load requests", variant: "destructive" });
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("genius_offer_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Status updated" });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      if (selectedRequest?.id === id) {
        setSelectedRequest((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-2xl font-serif">
              <BoldText>ACCESS REQUIRED</BoldText>
            </h1>
            <p className="text-muted-foreground">
              You need to be signed in to view this page.
            </p>
            <Button onClick={() => navigate("/auth?redirect=/genius-admin")}>
              <BoldText>SIGN IN</BoldText>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-2xl font-serif">
              <BoldText>NOT AUTHORIZED</BoldText>
            </h1>
            <p className="text-muted-foreground">
              You don&apos;t have permission to access this page.
            </p>
            <BackButton
              to="/"
              label="Back to Home"
              variant="outline"
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Admin view
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navigation />

      <div className="pt-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <BackButton
            to="/"
            label={<BoldText>BACK</BoldText>}
            className="text-muted-foreground hover:text-foreground transition-colors font-semibold"
          />
        </div>
      </div>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-serif text-center mb-8">
            <BoldText>GENIUS OFFERS – ADMIN</BoldText>
          </h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-center text-muted-foreground">No requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Branch</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">PDF</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">View</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <p className="font-medium">{req.name}</p>
                          <p className="text-xs text-muted-foreground">{req.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(req.created_at)}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={req.has_ai_assistant ? "text-accent" : "text-primary"}>
                          {getAiBranchLabel(req)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Select
                          value={req.status}
                          onValueChange={(val) => updateStatus(req.id, val)}
                        >
                          <SelectTrigger className="w-[160px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {req.pdf_url ? (
                          <a
                            href={req.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            Open PDF
                          </a>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Request from {selectedRequest?.name}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">Status:</span>
                <Select
                  value={selectedRequest.status}
                  onValueChange={(val) => updateStatus(selectedRequest.id, val)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Email:</span>
                  <p className="text-muted-foreground">{selectedRequest.email}</p>
                </div>
                <div>
                  <span className="font-semibold">Submitted:</span>
                  <p className="text-muted-foreground">{formatDate(selectedRequest.created_at)}</p>
                </div>
              </div>

              <div>
                <span className="text-sm font-semibold">Branch:</span>
                <p className="text-muted-foreground">{getAiBranchLabel(selectedRequest)}</p>
              </div>

              {selectedRequest.ai_summary_raw && (
                <div>
                  <span className="text-sm font-semibold">AI Summary:</span>
                  <pre className="mt-2 p-4 bg-secondary/30 rounded-lg text-sm whitespace-pre-wrap">
                    {selectedRequest.ai_summary_raw}
                  </pre>
                </div>
              )}

              {selectedRequest.products_sold && (
                <div>
                  <span className="text-sm font-semibold">Products Sold:</span>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{selectedRequest.products_sold}</p>
                </div>
              )}

              {selectedRequest.best_clients && (
                <div>
                  <span className="text-sm font-semibold">Best Clients:</span>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{selectedRequest.best_clients}</p>
                </div>
              )}

              {selectedRequest.no_ai_genius_description && (
                <div>
                  <span className="text-sm font-semibold">Genius Description (Legacy):</span>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{selectedRequest.no_ai_genius_description}</p>
                </div>
              )}

              {selectedRequest.best_client_story && (
                <div>
                  <span className="text-sm font-semibold">Best Client Story (Legacy):</span>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{selectedRequest.best_client_story}</p>
                </div>
              )}

              {selectedRequest.extra_notes && (
                <div>
                  <span className="text-sm font-semibold">Extra Notes:</span>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{selectedRequest.extra_notes}</p>
                </div>
              )}

              {selectedRequest.intelligences_note && (
                <div>
                  <span className="text-sm font-semibold">Intelligences Note:</span>
                  <p className="mt-1 text-muted-foreground">{selectedRequest.intelligences_note}</p>
                </div>
              )}

              {selectedRequest.pdf_url && (
                <div>
                  <span className="text-sm font-semibold">PDF:</span>
                  <p className="mt-1">
                    <a
                      href={selectedRequest.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {selectedRequest.pdf_url}
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminGeniusOffers;
