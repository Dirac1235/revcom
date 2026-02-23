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

export default async function BuyerListingDetailPage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: listing } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .eq("request_id", id);

  if (!listing) {
    redirect("/buyer/listings");
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/buyer/listings" className="mb-4 inline-block">
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">{listing.title}</CardTitle>
                <CardDescription>{listing.category}</CardDescription>
              </div>
              <Badge>{listing.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{listing.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Budget Range</p>
                <p className="text-lg font-semibold">
                  {listing.budget_min?.toLocaleString()} - {listing.budget_max?.toLocaleString()} ETB
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posted</p>
                <p className="text-lg font-semibold">
                  {new Date(listing.created_at).toLocaleDateString()}
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
                  No responses yet. Sellers will see your listing and contact
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
