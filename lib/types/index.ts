// Core type definitions for the Revcom marketplace application

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  user_type: "buyer" | "seller" | "both";
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone_number: string | null;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  buyer_id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  quantity: number | null;
  deadline: string | null;
  delivery_location: string | null;
  status: "open" | "closed" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  status: "active" | "inactive" | "sold";
  image_url: string | null;
  images?: string[];
  inventory_quantity?: number;
  specifications?: Record<string, any>;
  views?: number;
  average_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  request_id: string | null;
  listing_id: string | null;
  title: string;
  description: string;
  quantity: number;
  agreed_price: number;
  delivery_location: string | null;
  delivery_phone: string | null;
  delivery_notes: string | null;
  order_notes: string | null;
  payment_method: string | null;
  status: "pending" | "accepted" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  listing_id: string | null;
  request_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  helpful_count: number;
  verified_purchase: boolean;
  seller_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithDetails extends Review {
  buyer?: Profile;
  product?: Product;
}

export interface Offer {
  id: string;
  seller_id: string;
  request_id: string;
  price: number;
  description: string;
  delivery_timeline: string;
  delivery_cost: number;
  payment_terms: string | null;
  attachments: string[] | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  updated_at: string;
}

export interface OfferWithDetails extends Offer {
  seller?: Profile;
  request?: Request;
}

// Extended types with relations
export interface ConversationWithDetails extends Conversation {
  otherProfile?: Profile;
  lastMessage?: Message;
}

export interface RequestWithBuyer extends Request {
  buyer?: Profile;
}

export interface ProductWithSeller extends Product {
  seller?: Profile;
}

export interface ProductQuestion {
  id: string;
  product_id: string;
  author_id: string;
  content: string;
  is_seller_answer: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductQuestionWithAuthor extends ProductQuestion {
  author?: Profile;
  answers?: ProductQuestionWithAuthor[];
}

export interface OrderWithDetails extends Order {
  buyer?: Profile;
  seller?: Profile;
  items?: OrderItem[];
}
