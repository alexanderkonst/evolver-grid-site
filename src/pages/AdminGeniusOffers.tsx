import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
}

const STATUS_OPTIONS = [
  { value: "intake_received", label: "Intake Received" },
  { value: "apple_seed_in_progress", label: "AppleSeed In Progress" },
  { value: "excalibur_in_progress", label: "Excalibur In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const AdminGeniusOffers = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<GeniusOfferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<GeniusOfferRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("genius_offer_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="pt-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK</BoldText>
          </Link>
        </div>
      </div>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-serif text-center mb-8">
            <BoldText>GENIUS OFFER REQUESTS</BoldText>
          </h1>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-muted-foreground">No requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Source</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">View</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="py-3 px-4 text-sm">{req.name}</td>
                      <td className="py-3 px-4 text-sm">{req.email}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(req.created_at)}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={req.source_branch === "ai" ? "text-accent" : "text-primary"}>
                          {req.source_branch || (req.has_ai_assistant ? "ai" : "tests")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          req.status === "offer_delivered" ? "bg-accent/20 text-accent" :
                          req.status === "in_progress" ? "bg-primary/20 text-primary" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {STATUS_OPTIONS.find(s => s.value === req.status)?.label || req.status}
                        </span>
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
                <span className="text-sm font-semibold">Has AI Assistant:</span>
                <p className="text-muted-foreground">{selectedRequest.has_ai_assistant ? "Yes" : "No"}</p>
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminGeniusOffers;