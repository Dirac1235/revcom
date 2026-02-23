import { z } from 'zod';
import { CATEGORIES, REQUEST_STATUSES, PRODUCT_STATUSES } from '@/lib/constants/categories';

// Request validation schema
export const requestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters'),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  budget_min: z.number().min(0, 'Minimum budget must be positive').optional().nullable(),
  budget_max: z.number().min(0, 'Maximum budget must be positive').optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
}).refine((data) => {
  if (data.budget_min && data.budget_max) {
    return data.budget_max >= data.budget_min;
  }
  return true;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budget_max'],
});

export type RequestFormData = z.infer<typeof requestSchema>;

// Product validation schema
export const productSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters'),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  inventory_quantity: z.number().int().min(0, 'Inventory must be 0 or greater').default(0),
  image_url: z.string().url('Must be a valid URL').optional().nullable(),
  images: z.array(z.string().url()).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  status: z.enum(PRODUCT_STATUSES).default('active'),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Profile update validation schema
export const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().nullable(),
  avatar_url: z.string().url('Must be a valid URL').optional().nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Message validation schema
export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message must be less than 1000 characters'),
});

export type MessageFormData = z.infer<typeof messageSchema>;

// Order creation validation schema
export const orderSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  agreed_price: z.number().min(0.01, 'Price must be greater than 0'),
  delivery_location: z.string().optional().nullable(),
});

export type OrderFormData = z.infer<typeof orderSchema>;

// Search/filter validation schema
export const searchFilterSchema = z.object({
  query: z.string().optional(),
  category: z.enum([...CATEGORIES, 'All'] as const).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  status: z.enum([...REQUEST_STATUSES, ...PRODUCT_STATUSES] as const).optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'popular']).optional(),
});

export type SearchFilterData = z.infer<typeof searchFilterSchema>;

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

export const questionSchema = z.object({
  content: z.string().min(5, 'Question must be at least 5 characters').max(500, 'Question must be less than 500 characters'),
});

export type QuestionFormData = z.infer<typeof questionSchema>;
