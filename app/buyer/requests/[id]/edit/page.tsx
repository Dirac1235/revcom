import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditRequestForm } from "./form";

export default async function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: requestId } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch request and check ownership in one go if possible, or just fetch
  const { data: request } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (!request) notFound();

  if (request.buyer_id !== user.id) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mb-6">You don't have permission to edit this request.</p>
        <Button asChild>
          <Link href="/buyer/requests">Back to My Requests</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8 space-y-2">
          <Link 
            href={`/buyer/requests/${requestId}`} 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to details
          </Link>
          <h1 className="text-3xl font-bold tracking-tight font-serif pt-2">Edit Request</h1>
          <p className="text-muted-foreground">Adjust your requirements to get better offers from sellers.</p>
        </div>

        <EditRequestForm request={request} />
      </main>
    </div>
  );
}