import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/data/profiles";
import { getBuyerRequests } from "@/lib/data/requests";
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
import { Plus, Edit } from "lucide-react";
import DashboardNav from "@/components/dashboard-nav";

export default async function BuyerRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const profile = await getProfileById(supabase, user.id);
  const requests = await getBuyerRequests(supabase, user.id);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Requests
            </h1>
            <p className="text-muted-foreground">
              Create and manage your buyer listings
            </p>
          </div>
          <Link href="/buyer/requests/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Request
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {requests && requests.length > 0 ? (
            requests.map((request: any) => (
              <Card
                key={request.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.title}</CardTitle>
                      <CardDescription>{request.category}</CardDescription>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {request.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {request.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm">
                      Budget: ${request.budget_min} - ${request.budget_max}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Posted {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/buyer/requests/${request.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/buyer/requests/${request.id}`}>
                      <Button variant="outline" size="sm">
                        View Responses
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  You haven't posted any requests yet.
                </p>
                <Link href="/buyer/requests/create">
                  <Button>Create Your First Request</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
