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
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import DashboardNav from "@/components/dashboard-nav";
import { getProfileById } from "@/lib/data/profiles-server";
import { getRequestById } from "@/lib/data/requests-server";
import { getConversationsByRequestId } from "@/lib/data/conversations-server";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const profile = await getProfileById(user.id);
  const request = await getRequestById(id);
  const conversations = await getConversationsByRequestId(id);

  if (!request) {
    redirect("/buyer/requests");
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/buyer/requests" className="mb-4 inline-block">
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">{request.title}</CardTitle>
                <CardDescription>{request.category}</CardDescription>
              </div>
              <Badge>{request.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{request.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Budget Range</p>
                <p className="text-lg font-semibold">
                  ${request.budget_min} - ${request.budget_max}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posted</p>
                <p className="text-lg font-semibold">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4">
          Seller Responses ({conversations?.length || 0})
        </h2>
        <div className="grid gap-4">
          {conversations && conversations.length > 0 ? (
            conversations.map((conv: any) => (
              <Card key={conv.id}>
                <CardHeader>
                  <CardTitle>Conversation {conv.id.slice(0, 8)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/messages/${conv.id}`}>
                    <Button>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View Conversation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  No responses yet. Sellers will see your request and contact
                  you.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
