import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, MessageSquare, Eye } from "lucide-react";
import DashboardNav from "@/components/dashboard-nav";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const { data: requests } = await supabase
    .from("requests")
    .select("*")
    .eq("buyer_id", user?.id)
    .limit(5);
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, {profile?.first_name || user?.email}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">

          {(profile?.user_type === "buyer" ||
            profile?.user_type === "both") && (
            <Card className="border-border shadow-none rounded-lg hover:bg-secondary/20 transition-colors">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="flex items-center gap-2 text-xl font-medium text-foreground">
                  <Eye className="w-5 h-5 text-foreground" />
                  My Requests
                </CardTitle>
                <CardDescription>Track your buyer requests</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-4xl font-serif font-bold mb-6 text-foreground">
                  {requests?.length || 0}
                </p>
                <Link href="/buyer/requests">
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-none">
                    View Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="border-border shadow-none rounded-lg hover:bg-secondary/20 transition-colors">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 text-xl font-medium text-foreground">
                <MessageSquare className="w-5 h-5 text-foreground" />
                Messages
              </CardTitle>
              <CardDescription>View your conversations</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="h-[60px] flex items-center text-muted-foreground text-sm mb-2">
                Check your latest messages
              </div>
              <Link href="/messages">
                <Button className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-none">
                  Go to Messages
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {(profile?.user_type === "buyer" || profile?.user_type === "both") && (
          <>
            <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
              Recent Requests
            </h2>
            <div className="grid gap-6 mb-8">
              {requests && requests.length > 0 ? (
                requests.map((request: any) => (
                  <Card
                    key={request.id}
                    className="border-border shadow-none rounded-lg hover:bg-secondary/20 transition-colors"
                  >
                    <CardHeader className="pb-2 pt-6 px-6">
                      <CardTitle className="text-lg font-medium text-foreground">
                        {request.title}
                      </CardTitle>
                      <CardDescription>{request.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <p className="text-xl font-bold text-foreground">
                        ${request.budget_min} - ${request.budget_max}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wider font-medium">
                        Status: {request.status}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed border-border shadow-none rounded-lg bg-transparent">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      No requests yet.
                    </p>
                    <Link
                      href="/buyer/requests/create"
                    >
                      <Button variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background">
                        Create one now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
