import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BuyerListingEditForm from "@/components/buyer-listing-edit-form";

export default async function EditBuyerListingPage({
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

  const { data: listing } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) {
    redirect("/buyer/listings");
  }

  if (listing.buyer_id !== user.id) {
    redirect("/buyer/listings");
  }

  return <BuyerListingEditForm listing={listing} />;
}
