import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/data/profiles-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  ArrowRight,
  FileText,
  MessageSquare,
  Banknote,
  CalendarDays,
  Tag,
  Sparkles,
  Handshake,
  PackageCheck,
  Target,
  Search,
  Lightbulb
} from "lucide-react";
// ─── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  open: {
    label: "Receiving Offers",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500",
    icon: <Sparkles className="w-3 h-3" />,
  },
  negotiating: {
    label: "In Talks",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500",
    icon: <Handshake className="w-3 h-3" />,
  },
  closed: {
    label: "Fulfilled",
    bg: "bg-slate-50 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-300 dark:border-slate-700",
    icon: <PackageCheck className="w-3 h-3" />,
  },
};
function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.closed;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
// ─── Summary Stats ─────────────────────────────────────────────────────────────
function SummaryStats({ requests }: { requests: any[] }) {
  const open = requests.filter((r) => r.status === "open").length;
  const negotiating = requests.filter((r) => r.status === "negotiating").length;
  const closed = requests.filter((r) => r.status === "closed").length;
  const stats = [
    {
      label: "Total Requests",
      value: requests.length,
      icon: <Target className="w-4 h-4 text-blue-600" />,
      bg: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      label: "Active / Open",
      value: open,
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      label: "In Negotiations",
      value: negotiating,
      icon: <Handshake className="w-4 h-4 text-amber-600" />,
      bg: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      label: "Successfully Closed",
      value: closed,
      icon: <PackageCheck className="w-4 h-4 text-slate-600" />,
      bg: "bg-slate-50 dark:bg-slate-900/50",
    },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="border border-border/50 shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-foreground">
                {stat.value}
              </h4>
              <p className="text-xs text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
// ─── Request Card ──────────────────────────────────────────────────────────────
function RequestCard({ request }: { request: any }) {
  const offerCount = request.offers?.[0]?.count ?? 0;
  const config = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.closed;
  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Accent left border */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.border}`} />
      
      <CardContent className="p-4 pl-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          {/* Left: Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={request.status} />
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-l border-border pl-2">
                {request.category && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {request.category}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {timeAgo(request.created_at)}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                {request.title}
              </h3>
              {request.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {request.description}
                </p>
              )}
            </div>
            {(request.budget_min || request.budget_max) && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/50 text-xs font-medium text-secondary-foreground">
                <Banknote className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                ${request.budget_min?.toLocaleString()} – ${request.budget_max?.toLocaleString()}
              </div>
            )}
          </div>
          {/* Right: Actions & Offers */}
          <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md w-full sm:w-auto text-center border border-blue-100 dark:border-blue-900/30 flex items-center justify-center gap-1">
              <MessageSquare className="w-3 h-3 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{offerCount} Offers</span>
            </div>
            <div className="flex gap-2 w-full">
              <Link href={`/buyer/requests/${request.id}/edit`} className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </Link>
              <Link href={`/buyer/requests/${request.id}`} className="flex-1 sm:flex-none">
                <Button size="sm" className="w-full">
                  Review
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="grid lg:grid-cols-5 gap-6 items-start">
      <Card className="lg:col-span-3 border border-border/50 shadow-sm rounded-lg">
        <CardContent className="py-12 text-center px-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-lg bg-background border shadow-sm">
              <Search className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">No requests yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
            Stop searching and let the market come to you. Post exactly what you need, set your budget, and review competitive offers.
          </p>
          <Link href="/buyer/requests/create">
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Create Your First Request
            </Button>
          </Link>
        </CardContent>
      </Card>
      {/* Helper tips for an empty screen */}
      <div className="lg:col-span-2 space-y-4">
        <h4 className="font-medium text-base flex items-center gap-1">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Tips for great offers
        </h4>
        <div className="space-y-3">
          {[
            { title: "Be Specific", desc: "Include brands, models, and acceptable conditions." },
            { title: "Realistic Budgets", desc: "Setting a fair market range attracts serious sellers quickly." },
            { title: "Respond Promptly", desc: "Sellers are more likely to negotiate if you stay active." }
          ].map((tip, i) => (
            <div key={i} className="flex gap-3 items-start bg-card p-3 rounded-lg border shadow-sm">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs shrink-0">
                {i + 1}
              </div>
              <div>
                <h5 className="font-medium text-sm mb-0.5">{tip.title}</h5>
                <p className="text-xs text-muted-foreground">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function BuyerRequestsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/auth/login");
  const filterStatus = searchParams.status || "all";
  // Fetch requests
  let query = supabase
    .from("requests")
    .select("*, offers(count)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });
  if (filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }
  const { data: requestsRaw } = await query;
  const requests = requestsRaw || [];
  // For the tabs, we need the total counts (ignoring the current filter)
  const { data: allRequests } = await supabase
    .from("requests")
    .select("status")
    .eq("buyer_id", user.id);
 
  const hasAnyRequests = (allRequests?.length ?? 0) > 0;
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Request Command Center
              </h1>
              <p className="text-muted-foreground mt-1 text-base max-w-xl">
                Track your active requests, manage seller negotiations, and find exactly what you're looking for.
              </p>
            </div>
            <Link href="/buyer/requests/create">
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                Post New Request
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasAnyRequests && <SummaryStats requests={allRequests || []} />}
        {hasAnyRequests ? (
          <div className="space-y-4">
            {/* Status Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: "all", label: "All Requests" },
                { id: "open", label: "Receiving Offers" },
                { id: "negotiating", label: "In Talks" },
                { id: "closed", label: "Fulfilled" },
              ].map((tab) => (
                <Link key={tab.id} href={`/buyer/requests${tab.id === 'all' ? '' : `?status=${tab.id}`}`}>
                  <Badge
                    variant={filterStatus === tab.id ? "default" : "secondary"}
                    className={`px-3 py-1 text-sm rounded-md cursor-pointer hover:bg-primary/80 transition-colors whitespace-nowrap ${
                      filterStatus === tab.id ? "shadow-sm" : "hover:bg-secondary/80"
                    }`}
                  >
                    {tab.label}
                  </Badge>
                </Link>
              ))}
            </div>
            <div className="space-y-3">
              {requests.length > 0 ? (
                requests.map((request: any) => (
                  <RequestCard key={request.id} request={request} />
                ))
              ) : (
                <div className="text-center py-8 bg-card rounded-lg border border-border/50">
                  <p className="text-muted-foreground">No requests found for this status.</p>
                  <Link href="/buyer/requests" className="text-primary font-medium hover:underline mt-1 inline-block text-sm">
                    Clear filters
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}