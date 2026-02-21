import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import EditRequestForm from "./form";

const categories = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Services",
  "Other",
];

export default async function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: requestId } = await params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: request } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
          <Link href="/buyer/requests">
            <Button>Back to Requests</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if user owns this request
  if (request.buyer_id !== user.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You can only edit your own requests.</p>
          <Link href="/buyer/requests">
            <Button>Back to Requests</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href={`/buyer/requests/${requestId}`} className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            ← Back to Request
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Request</h1>
          <p className="text-muted-foreground">Update your buyer request details</p>
        </div>

        <EditRequestForm request={request} requestId={requestId} />
      </main>
    </div>
  );
}
