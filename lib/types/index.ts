// Core type definitions for the Revcom marketplace application

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  user_type: 'buyer' | 'seller' | 'both';
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
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
  status: 'open' | 'closed' | 'completed';
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
  status: 'active' | 'inactive' | 'sold';
  image_url: string | null;
  images?: string[];
  inventory_quantity?: number;
  specifications?: Record<string, any>;
  views?: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  request_id: string | null;
  title: string;
  description: string;
  quantity: number;
  agreed_price: number;
  delivery_location: string | null;
  status: 'pending' | 'accepted' | 'shipped' | 'delivered' | 'cancelled';
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
  reviewer_id: string;
  reviewee_id: string;
  listing_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
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

export interface OrderWithDetails extends Order {
  buyer?: Profile;
  seller?: Profile;
  items?: OrderItem[];
}
