// Application route constants for type-safe navigation

export const ROUTES = {
  // Public routes
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  LISTINGS: '/listings',
  LISTING_DETAIL: (id: string) => `/listings/${id}`,
  
  // Auth routes
  LOGIN: '/auth/login',
  SIGNUP: '/auth/sign-up',
  SIGNUP_SUCCESS: '/auth/sign-up-success',
  
  // Buyer routes
  BUYER_REQUESTS: '/buyer/requests',
  BUYER_REQUEST_CREATE: '/buyer/requests/create',
  BUYER_REQUEST_DETAIL: (id: string) => `/buyer/requests/${id}`,
  BUYER_REQUEST_EDIT: (id: string) => `/buyer/requests/${id}/edit`,
  BUYER_LISTINGS: '/buyer/listings',
  BUYER_LISTING_DETAIL: (id: string) => `/buyer/listings/${id}`,
  BUYER_LISTING_EDIT: (id: string) => `/buyer/listings/${id}/edit`,
  BUYER_ORDERS: '/buyer/orders',
  BUYER_ORDER_DETAIL: (id: string) => `/buyer/orders/${id}`,
  
  // Public request routes
  REQUEST_MAKE_OFFER: (id: string) => `/requests/${id}/make-offer`,
  
  // Seller routes
  SELLER_EXPLORE: '/seller/explore',
  SELLER_PRODUCTS: '/seller/products',
  SELLER_PRODUCT_CREATE: '/seller/products/create',
  SELLER_PRODUCT_EDIT: (id: string) => `/seller/products/${id}/edit`,
  SELLER_ORDERS: '/seller/orders',
  SELLER_ORDER_DETAIL: (id: string) => `/seller/orders/${id}`,
  SELLER_REQUEST_OFFER: (id: string) => `/seller/requests/${id}/offer`,
  
  // Shared routes
  MESSAGES: '/messages',
  MESSAGE_CONVERSATION: (id: string) => `/messages?conversation=${id}`,
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  EXPLORE: '/explore',
  CHECKOUT: '/checkout',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
