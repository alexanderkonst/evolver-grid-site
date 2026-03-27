import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Eye,
  EyeOff,
  MessageSquareQuote,
  Users,
  Contact,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface Testimonial {
  id: string;
  person_name: string;
  title: string;
  short_quote: string;
  full_quote: string;
  sort_order: number;
  is_active: boolean;
  surface: string;
  created_at: string;
  updated_at: string;
}

interface FounderCanvas {
  id: string;
  name: string;
  archetype: string;
  tagline: string;
  session_date: string;
  session_number: string;
  sigil: string;
  uniqueness: string;
  myth_lie: string;
  myth_truth: string;
  myth_line: string;
  tribe: string;
  pain: string;
  promise: string;
  color_primary: string;
  color_glow: string;
  color_bg: string;
  color_border: string;
  status: string;
  consent_given: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type TabId = "testimonials" | "canvases" | "contacts";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "testimonials", label: "Testimonials", icon: <MessageSquareQuote className="w-4 h-4" /> },
  { id: "canvases", label: "Canvases", icon: <Users className="w-4 h-4" /> },
  { id: "contacts", label: "Contacts", icon: <Contact className="w-4 h-4" /> },
];

const ADMIN_EMAILS = ['alexanderkonst@gmail.com', 'alex@evolvergrid.com'];

// ─── Testimonials Tab ───────────────────────────────────────────────────────────

const EMPTY_TESTIMONIAL: Omit<Testimonial, "id" | "created_at" | "updated_at"> = {
  person_name: "",
  title: "",
  short_quote: "",
  full_quote: "",
  sort_order: 0,
  is_active: true,
  surface: "ignite",
};

function TestimonialsTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "Failed to load testimonials", variant: "destructive" });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const isNew = !editing.id;
    const payload = {
      person_name: editing.person_name,
      title: editing.title,
      short_quote: editing.short_quote,
      full_quote: editing.full_quote,
      sort_order: editing.sort_order ?? 0,
      is_active: editing.is_active ?? true,
      surface: editing.surface ?? "ignite",
    };

    if (isNew) {
      const { error } = await (supabase as any)
        .from("testimonials")
        .insert(payload);
      if (error) {
        toast({ title: "Failed to create", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Testimonial created" });
        setEditing(null);
        fetchItems();
      }
    } else {
      const { error } = await (supabase as any)
        .from("testimonials")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Failed to update", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Testimonial updated" });
        setEditing(null);
        fetchItems();
      }
    }
    setSaving(false);
  };

  const toggleActive = async (item: Testimonial) => {
    const { error } = await (supabase as any)
      .from("testimonials")
      .update({ is_active: !item.is_active, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      toast({ title: "Failed to toggle", variant: "destructive" });
    } else {
      setItems((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, is_active: !t.is_active } : t))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <PremiumLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} testimonial{items.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => setEditing({ ...EMPTY_TESTIMONIAL, sort_order: items.length + 1 })}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">#</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Person</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Short Quote</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Surface</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Active</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Edit</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="py-3 px-3 text-sm text-muted-foreground">{item.sort_order}</td>
                <td className="py-3 px-3 text-sm">
                  <p className="font-medium">{item.person_name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.title}</p>
                </td>
                <td className="py-3 px-3 text-sm text-muted-foreground truncate max-w-[300px]">
                  "{item.short_quote}"
                </td>
                <td className="py-3 px-3 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent">{item.surface}</span>
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`p-1 rounded ${item.is_active ? "text-green-400" : "text-muted-foreground"}`}
                  >
                    {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </td>
                <td className="py-3 px-3">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(item)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing?.id ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Person Name</Label>
                  <Input
                    value={editing.person_name ?? ""}
                    onChange={(e) => setEditing({ ...editing, person_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Title / Role</Label>
                  <Input
                    value={editing.title ?? ""}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Short Quote</Label>
                <Textarea
                  rows={2}
                  value={editing.short_quote ?? ""}
                  onChange={(e) => setEditing({ ...editing, short_quote: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Full Quote</Label>
                <Textarea
                  rows={5}
                  value={editing.full_quote ?? ""}
                  onChange={(e) => setEditing({ ...editing, full_quote: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Surface</Label>
                  <Select
                    value={editing.surface ?? "ignite"}
                    onValueChange={(val) => setEditing({ ...editing, surface: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ignite">Ignite</SelectItem>
                      <SelectItem value="founders">Founders</SelectItem>
                      <SelectItem value="landing">Landing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Sort Order</Label>
                  <Input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <Switch
                    checked={editing.is_active ?? true}
                    onCheckedChange={(val) => setEditing({ ...editing, is_active: val })}
                  />
                  <Label className="text-xs">Active</Label>
                </div>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                <BoldText>{saving ? "SAVING..." : editing.id ? "UPDATE" : "CREATE"}</BoldText>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Canvases Tab ───────────────────────────────────────────────────────────────

const EMPTY_CANVAS: Omit<FounderCanvas, "id" | "created_at" | "updated_at"> = {
  name: "",
  archetype: "",
  tagline: "",
  session_date: "",
  session_number: "",
  sigil: "◉",
  uniqueness: "",
  myth_lie: "",
  myth_truth: "",
  myth_line: "",
  tribe: "",
  pain: "",
  promise: "",
  color_primary: "#8460ea",
  color_glow: "rgba(132,96,234,0.35)",
  color_bg: "rgba(132,96,234,0.06)",
  color_border: "rgba(132,96,234,0.25)",
  status: "in-progress",
  consent_given: false,
  sort_order: 0,
  is_active: true,
};

function CanvasesTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<FounderCanvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<FounderCanvas> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("founder_canvases")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "Failed to load canvases", variant: "destructive" });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const isNew = !editing.id;
    const { id, created_at, updated_at, ...payload } = editing as any;

    if (isNew) {
      const { error } = await (supabase as any)
        .from("founder_canvases")
        .insert(payload);
      if (error) {
        toast({ title: "Failed to create", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Canvas created" });
        setEditing(null);
        fetchItems();
      }
    } else {
      const { error } = await (supabase as any)
        .from("founder_canvases")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        toast({ title: "Failed to update", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Canvas updated" });
        setEditing(null);
        fetchItems();
      }
    }
    setSaving(false);
  };

  const toggleActive = async (item: FounderCanvas) => {
    const { error } = await (supabase as any)
      .from("founder_canvases")
      .update({ is_active: !item.is_active, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      toast({ title: "Failed to toggle", variant: "destructive" });
    } else {
      setItems((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, is_active: !c.is_active } : c))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <PremiumLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} canvas{items.length !== 1 ? "es" : ""}</p>
        <Button size="sm" onClick={() => setEditing({ ...EMPTY_CANVAS, sort_order: items.length + 1 })}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative rounded-xl border p-4 transition-all hover:shadow-lg"
            style={{
              borderColor: item.color_border,
              backgroundColor: item.color_bg,
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-lg mr-2">{item.sigil}</span>
                <span className="font-serif font-semibold">{item.name}</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{
                  backgroundColor: item.status === "complete" ? "rgba(94,175,139,0.2)" : "rgba(212,154,94,0.2)",
                  color: item.status === "complete" ? "#5eaf8b" : "#d49a5e"
                }}>
                  {item.status}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleActive(item)}
                  className={`p-1 rounded ${item.is_active ? "text-green-400" : "text-muted-foreground"}`}
                >
                  {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(item)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm font-medium" style={{ color: item.color_primary }}>{item.archetype}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.tagline}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.session_date} · {item.session_number}</p>
          </div>
        ))}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing?.id ? `Edit Canvas — ${editing.name}` : "Add Founder Canvas"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              {/* Basic info */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Archetype</Label>
                  <Input value={editing.archetype ?? ""} onChange={(e) => setEditing({ ...editing, archetype: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Sigil</Label>
                  <Input value={editing.sigil ?? "◉"} onChange={(e) => setEditing({ ...editing, sigil: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Tagline</Label>
                <Input value={editing.tagline ?? ""} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Session Date</Label>
                  <Input value={editing.session_date ?? ""} onChange={(e) => setEditing({ ...editing, session_date: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Session Number</Label>
                  <Input value={editing.session_number ?? ""} onChange={(e) => setEditing({ ...editing, session_number: e.target.value })} />
                </div>
              </div>

              {/* Canvas content */}
              <div>
                <Label className="text-xs">Uniqueness</Label>
                <Textarea rows={2} value={editing.uniqueness ?? ""} onChange={(e) => setEditing({ ...editing, uniqueness: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Myth — Lie</Label>
                  <Textarea rows={2} value={editing.myth_lie ?? ""} onChange={(e) => setEditing({ ...editing, myth_lie: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Myth — Truth</Label>
                  <Textarea rows={2} value={editing.myth_truth ?? ""} onChange={(e) => setEditing({ ...editing, myth_truth: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Myth — Line</Label>
                  <Textarea rows={2} value={editing.myth_line ?? ""} onChange={(e) => setEditing({ ...editing, myth_line: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Tribe</Label>
                <Textarea rows={2} value={editing.tribe ?? ""} onChange={(e) => setEditing({ ...editing, tribe: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Pain</Label>
                <Textarea rows={2} value={editing.pain ?? ""} onChange={(e) => setEditing({ ...editing, pain: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Promise</Label>
                <Textarea rows={2} value={editing.promise ?? ""} onChange={(e) => setEditing({ ...editing, promise: e.target.value })} />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editing.color_primary ?? "#8460ea"}
                      onChange={(e) => setEditing({ ...editing, color_primary: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <Input
                      className="text-xs"
                      value={editing.color_primary ?? "#8460ea"}
                      onChange={(e) => setEditing({ ...editing, color_primary: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Glow</Label>
                  <Input className="text-xs" value={editing.color_glow ?? ""} onChange={(e) => setEditing({ ...editing, color_glow: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Background</Label>
                  <Input className="text-xs" value={editing.color_bg ?? ""} onChange={(e) => setEditing({ ...editing, color_bg: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Border</Label>
                  <Input className="text-xs" value={editing.color_border ?? ""} onChange={(e) => setEditing({ ...editing, color_border: e.target.value })} />
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={editing.status ?? "in-progress"}
                    onValueChange={(val) => setEditing({ ...editing, status: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Sort Order</Label>
                  <Input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editing.consent_given ?? false}
                      onCheckedChange={(val) => setEditing({ ...editing, consent_given: val })}
                    />
                    <Label className="text-xs">Consent</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editing.is_active ?? true}
                      onCheckedChange={(val) => setEditing({ ...editing, is_active: val })}
                    />
                    <Label className="text-xs">Active</Label>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={handleSave} disabled={saving}>
                <BoldText>{saving ? "SAVING..." : editing.id ? "UPDATE" : "CREATE"}</BoldText>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Contacts Tab (Coming Soon) ─────────────────────────────────────────────────

function ContactsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Contact className="w-12 h-12 text-muted-foreground/30 mb-4" />
      <h3 className="text-lg font-serif mb-2">
        <BoldText>TRIBE CONTACTS</BoldText>
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Coming in Phase 2. When the outreach tracker hits 15+ contacts, 
        this tab will manage the full pipeline from prospect → facilitator.
      </p>
      <p className="text-xs text-muted-foreground/50 mt-4">
        Currently tracked in <span className="font-mono">docs/02-strategy/tribe_outreach_tracker.md</span>
      </p>
    </div>
  );
}

// ─── Main Admin Page ────────────────────────────────────────────────────────────

const AdminContentManager = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("testimonials");

  const checkAdminRole = (userEmail: string | undefined): boolean => {
    if (!userEmail) return false;
    return ADMIN_EMAILS.includes(userEmail.toLowerCase());
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          setIsAdmin(checkAdminRole(session.user.email));
        }
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAdmin(checkAdminRole(session.user.email));
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <PremiumLoader size="lg" />
      </div>
    );
  }

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
            <Button onClick={() => navigate("/auth?redirect=/admin/content")}>
              <BoldText>SIGN IN</BoldText>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            <BackButton to="/" label="Back to Home" variant="outline" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-serif text-center mb-2">
            <BoldText>CONTENT MANAGER</BoldText>
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-8">
            Manage your live business surfaces — zero code required
          </p>

          {/* Tab Bar */}
          <div className="flex gap-1 mb-8 border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "testimonials" && <TestimonialsTab />}
          {activeTab === "canvases" && <CanvasesTab />}
          {activeTab === "contacts" && <ContactsTab />}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminContentManager;
