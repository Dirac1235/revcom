import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/data/profiles-server";
import { getBuyerRequests } from "@/lib/data/requests-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  FileText,
  MessageSquare,
  DollarSign,
  Calendar,
  Tag,
  TrendingUp,
  Clock,
  CheckCircle,
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
  { label: string; className: string; icon: React.ReactNode }
> = {
  open: {
    label: "Open",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  negotiating: {
    label: "Negotiating",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: <TrendingUp className="w-3 h-3" />,
  },
  closed: {
    label: "Closed",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    icon: <Clock className="w-3 h-3" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${config.className}`}
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {[
        {
          label: "Total",
          value: requests.length,
          color: "text-foreground",
          bg: "bg-secondary/60",
        },
        {
          label: "Open",
          value: open,
          color: "text-green-700 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-900/10",
        },
        {
          label: "Negotiating",
          value: negotiating,
          color: "text-yellow-700 dark:text-yellow-400",
          bg: "bg-yellow-50 dark:bg-yellow-900/10",
        },
        {
          label: "Closed",
          value: closed,
          color: "text-gray-500",
          bg: "bg-gray-50 dark:bg-gray-800/40",
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bg} rounded-xl p-4 text-center`}
        >
          <p className={`text-3xl font-bold tracking-tight ${stat.color}`}>
            {stat.value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Request Card ──────────────────────────────────────────────────────────────

function RequestCard({ request }: { request: any }) {
  const offerCount = request.offers?.[0]?.count ?? 0;

  return (
    <Card className="border-border shadow-none rounded-xl hover:shadow-sm transition-all group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left: content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <StatusBadge status={request.status} />
              {request.category && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  {request.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {timeAgo(request.created_at)}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-1 truncate group-hover:text-foreground/80 transition-colors">
              {request.title}
            </h3>

            {request.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {request.description}
              </p>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              {(request.budget_min || request.budget_max) && (
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                  {request.budget_min?.toLocaleString()} –{" "}
                  {request.budget_max?.toLocaleString()}
                </div>
              )}

              {offerCount > 0 && (
                <Link href={`/buyer/requests/${request.id}`}>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {offerCount} offer{offerCount !== 1 ? "s" : ""}
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <Link href={`/buyer/requests/${request.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-border hover:bg-secondary gap-1.5 text-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </Button>
            </Link>
            <Link href={`/buyer/requests/${request.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-border hover:bg-secondary gap-1.5 text-xs"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Card className="border-dashed border-border shadow-none rounded-xl bg-transparent">
      <CardContent className="py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-xl bg-secondary/60">
            <FileText className="w-10 h-10 text-muted-foreground/40" />
          </div>
        </div>
        <h3 className="text-base font-semibold mb-1">No requests yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
          Post your first request and let sellers come to you with competitive
          offers.
        </p>
        <Link href="/buyer/requests/create">
          <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-none gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Request
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function BuyerRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/auth/login");

  // Fetch requests with offer count
  const { data: requestsRaw } = await supabase
    .from("requests")
    .select("*, offers(count)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  const requests = requestsRaw || [];

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif tracking-tight text-foreground">
              My Requests
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your buyer requests and track incoming offers
            </p>
          </div>
          <Link href="/buyer/requests/create" className=" ">
            <Button className="bg-primary text-primary-foreground hover:bg-foreground/90 shadow-none gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              New Request
            </Button>
          </Link>
        </div>

        {/* Stats (only show if there are requests) */}
        {requests.length > 0 && <SummaryStats requests={requests} />}

        {/* List */}
        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map((request: any) => (
              <RequestCard key={request.id} request={request} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}
