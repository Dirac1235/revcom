// Product and service categories
export const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Home & Garden',
  'Sports & Outdoors',
  'Toys & Games',
  'Services',
  'Industrial Equipment',
  'Office Supplies',
  'Food & Beverages',
  'Health & Beauty',
  'Automotive',
  'Construction Materials',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];

// Order status options
export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

// Request status options
export const REQUEST_STATUSES = [
  'open',
  'closed',
  'completed',
] as const;

export type RequestStatus = typeof REQUEST_STATUSES[number];

// Product status options
export const PRODUCT_STATUSES = [
  'active',
  'inactive',
  'sold',
] as const;

export type ProductStatus = typeof PRODUCT_STATUSES[number];

// User type options
export const USER_TYPES = [
  'buyer',
  'seller',
  'both',
] as const;

export type UserType = typeof USER_TYPES[number];

// Price ranges for filtering
export const PRICE_RANGES = [
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100 - $500', min: 100, max: 500 },
  { label: '$500 - $1,000', min: 500, max: 1000 },
  { label: '$1,000 - $5,000', min: 1000, max: 5000 },
  { label: '$5,000 - $10,000', min: 5000, max: 10000 },
  { label: 'Over $10,000', min: 10000, max: Infinity },
] as const;

// Sorting options
export const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]['value'];
