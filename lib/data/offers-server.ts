"use server";

import { createClient } from "@/lib/supabase/server";

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function getOffersByRequest(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getOffersByRequestWithSellers(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(`
      *,
      seller:profiles!seller_id (*)
    `)
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getOffersBySeller(sellerId: string, limit?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("offers")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

export async function getOfferById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getOfferBySellerAndRequest(sellerId: string, requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("request_id", requestId)
    .single();
  
  if (error) return null;
  return data;
}

export async function createOffer(payload: {
  seller_id: string;
  request_id: string;
  price: number;
  description: string;
  delivery_timeline: string;
  delivery_cost?: number;
  payment_terms?: string;
  attachments?: string[];
  status?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .insert({
      seller_id: payload.seller_id,
      request_id: payload.request_id,
      price: payload.price,
      description: payload.description,
      delivery_timeline: payload.delivery_timeline,
      delivery_cost: payload.delivery_cost || 0,
      payment_terms: payload.payment_terms || null,
      attachments: payload.attachments || null,
      status: payload.status || "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Single server action for submitting an offer so one Supabase client (and auth session) is used for offer + conversation + notification. Fixes 42501 when Server Action context loses cookies. */
export async function submitOfferAction(payload: {
  seller_id: string;
  request_id: string;
  buyer_id: string;
  request_title: string;
  price: number;
  description: string;
  delivery_timeline: string;
  delivery_cost?: number;
  payment_terms?: string;
  attachments?: string[];
  status?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated. Please sign in again.");
  }
  if (user.id !== payload.seller_id) {
    throw new Error("You can only submit offers as yourself.");
  }

  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .insert({
      seller_id: payload.seller_id,
      request_id: payload.request_id,
      price: payload.price,
      description: payload.description,
      delivery_timeline: payload.delivery_timeline,
      delivery_cost: payload.delivery_cost ?? 0,
      payment_terms: payload.payment_terms ?? null,
      attachments: payload.attachments ?? null,
      status: payload.status ?? "pending",
    })
    .select()
    .single();

  if (offerError) {
    throw new Error(offerError.message || "Failed to create offer");
  }

  const { data: existingConv } = await supabase
    .from("conversations")
    .select("*")
    .or(
      `and(participant_1_id.eq.${payload.seller_id},participant_2_id.eq.${payload.buyer_id}),and(participant_1_id.eq.${payload.buyer_id},participant_2_id.eq.${payload.seller_id})`,
    )
    .maybeSingle();

  if (!existingConv) {
    const { error: convError } = await supabase.from("conversations").insert({
      participant_1_id: payload.seller_id,
      participant_2_id: payload.buyer_id,
      listing_id: null,
      request_id: payload.request_id,
    });
    if (convError) {
      throw new Error(convError.message || "Failed to create conversation");
    }
  }

  const { error: notifError } = await supabase.from("notifications").insert({
    user_id: payload.buyer_id,
    type: "new_offer",
    title: "New Offer Received",
    message: `You have a new offer for "${payload.request_title}"`,
    link: `/buyer/requests/${payload.request_id}`,
  });
  if (notifError) {
    throw new Error(notifError.message || "Failed to send notification");
  }

  return { offer };
}

export async function updateOffer(id: string, updates: Partial<{
  price: number;
  description: string;
  delivery_timeline: string;
  delivery_cost: number;
  payment_terms: string;
  attachments: string[];
  status: string;
}>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("offers")
    .update(updates)
    .eq("id", id);
  
  if (error) throw error;
}

export async function updateOfferStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("offers")
    .update({ status })
    .eq("id", id);
  
  if (error) throw error;
}

export async function deleteOffer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("offers")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
}

export async function acceptOffer(offerId: string, userId: string) {
  const supabase = await createClient();

  try {
    // Step 1: Validate offer exists and is pending
    const { data: offerData, error: offerError } = await supabase
      .from("offers")
      .select("*")
      .eq("id", offerId)
      .single();

    if (offerError || !offerData) throw new Error("Offer not found");
    if (offerData.status !== "pending") throw new Error("Offer is no longer pending");

    // Step 2: Validate request exists and is open
    const { data: requestData, error: requestError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", offerData.request_id)
      .single();

    if (requestError || !requestData) throw new Error("Request not found");
    if (requestData.status !== "open") throw new Error("Request is no longer open");

    // Step 3: Validate user is the buyer of this request
    if (userId && requestData.buyer_id !== userId) {
      throw new Error("You are not authorized to accept this offer");
    }

    // Step 4: Update accepted offer to 'accepted'
    const { error: updateAcceptedError } = await supabase
      .from("offers")
      .update({ status: "accepted" })
      .eq("id", offerId);

    if (updateAcceptedError) throw updateAcceptedError;

    // Step 5: Reject all other pending offers for this request
    const { error: rejectOthersError } = await supabase
      .from("offers")
      .update({ status: "rejected" })
      .eq("request_id", offerData.request_id)
      .eq("status", "pending")
      .neq("id", offerId);

    if (rejectOthersError) throw rejectOthersError;

    // Step 6: Close the request
    const { error: closeRequestError } = await supabase
      .from("requests")
      .update({ status: "closed" })
      .eq("id", offerData.request_id);

    if (closeRequestError) throw closeRequestError;

    // Step 7: Create order
    const { data: orderData, error: createOrderError } = await supabase
      .from("orders")
      .insert({
        buyer_id: requestData.buyer_id,
        seller_id: offerData.seller_id,
        request_id: requestData.id,
        title: requestData.title,
        description: offerData.description,
        quantity: requestData.quantity,
        agreed_price: offerData.price,
        delivery_location: requestData.delivery_location,
        status: "pending",
      })
      .select()
      .single();

    if (createOrderError) throw createOrderError;
    if (!orderData) throw new Error("Failed to create order");

    // Step 8: Create conversation if doesn't exist
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("*")
      .or(`and(participant_1_id.eq.${requestData.buyer_id},participant_2_id.eq.${offerData.seller_id}),and(participant_1_id.eq.${offerData.seller_id},participant_2_id.eq.${requestData.buyer_id})`)
      .single();

    if (!existingConversation) {
      await supabase
        .from("conversations")
        .insert({
          participant_1_id: requestData.buyer_id,
          participant_2_id: offerData.seller_id,
          request_id: requestData.id,
        });
    }

    // Step 9: Send notification to seller
    await supabase
      .from("notifications")
      .insert({
        user_id: offerData.seller_id,
        type: "offer_accepted",
        title: "Offer Accepted",
        message: `Your offer was accepted for "${requestData.title}"`,
        link: `/seller/orders/${orderData.id}`,
      });

    return orderData;
  } catch (error) {
    throw new Error((error as Error).message || "Failed to accept offer");
  }
}

export async function rejectOffer(offerId: string, userId: string) {
  const supabase = await createClient();

  try {
    // Step 1: Validate offer exists and is pending
    const { data: offerData, error: offerError } = await supabase
      .from("offers")
      .select("*")
      .eq("id", offerId)
      .single();

    if (offerError || !offerData) throw new Error("Offer not found");
    if (offerData.status !== "pending") throw new Error("Offer is no longer pending");

    // Step 2: Validate request exists and is open
    const { data: requestData, error: requestError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", offerData.request_id)
      .single();

    if (requestError || !requestData) throw new Error("Request not found");
    if (requestData.status !== "open") throw new Error("Request is no longer open");

    // Step 3: Validate user is the buyer of this request
    if (userId && requestData.buyer_id !== userId) {
      throw new Error("You are not authorized to reject this offer");
    }

    // Step 4: Update offer to 'rejected'
    const { error: updateError } = await supabase
      .from("offers")
      .update({ status: "rejected" })
      .eq("id", offerId);

    if (updateError) throw updateError;

    // Step 5: Send notification to seller
    await supabase
      .from("notifications")
      .insert({
        user_id: offerData.seller_id,
        type: "offer_rejected",
        title: "Offer Rejected",
        message: `Your offer for "${requestData.title}" was rejected by the buyer`,
        link: `/seller/requests/${requestData.id}`,
      });

    return true;
  } catch (error) {
    throw new Error((error as Error).message || "Failed to reject offer");
  }
}