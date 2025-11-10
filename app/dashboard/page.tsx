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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name || user?.email}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {(profile?.user_type === "buyer" ||
            profile?.user_type === "both") && (
            <Card className="hover:shadow-xl transition-all duration-300 border-indigo-100 dark:border-indigo-900/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  My Requests
                </CardTitle>
                <CardDescription>Track your buyer requests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                  {requests?.length || 0}
                </p>
                <Link href="/buyer/requests">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30">
                    View Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-xl transition-all duration-300 border-purple-100 dark:border-purple-900/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Messages
              </CardTitle>
              <CardDescription>View your conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/messages">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30">
                  Go to Messages
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {(profile?.user_type === "buyer" || profile?.user_type === "both") && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
              Recent Requests
            </h2>
            <div className="grid gap-4 mb-8">
              {requests && requests.length > 0 ? (
                requests.map((request: any) => (
                  <Card
                    key={request.id}
                    className="hover:shadow-xl transition-all duration-300 border-blue-100 dark:border-blue-900/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                  >
                    <CardHeader>
                      <CardTitle className="text-blue-600 dark:text-blue-400">
                        {request.title}
                      </CardTitle>
                      <CardDescription>{request.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${request.budget_min} - ${request.budget_max}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Status: {request.status}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-blue-100 dark:border-blue-900/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">
                      No requests yet.{" "}
                      <Link
                        href="/buyer/requests/create"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Create one now
                      </Link>
                    </p>
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
