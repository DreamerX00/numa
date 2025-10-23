import { z } from "zod";

// ================================
// PAYMENT VALIDATION SCHEMAS
// ================================

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
});

export const createPaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3, "Currency must be 3 characters").default("INR"),
  orderId: z.string().optional(),
});

// ================================
// ORDER VALIDATION SCHEMAS
// ================================

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, "Product ID is required"),
    variantId: z.string().nullable().optional(),
    quantity: z.number().int().positive("Quantity must be positive"),
    price: z.number().positive("Price must be positive"),
  })).min(1, "At least one item is required"),
  
  shippingAddress: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    company: z.string().optional(),
    address1: z.string().min(1, "Address is required"),
    address2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().length(2, "Country code must be 2 characters").default("IN"),
    phone: z.string().optional(),
  }),
  
  billingAddress: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    company: z.string().optional(),
    address1: z.string().min(1, "Address is required"),
    address2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().length(2, "Country code must be 2 characters").default("IN"),
    phone: z.string().optional(),
  }).optional(),
  
  paymentMethod: z.enum(["razorpay", "phonepe", "cod"]).default("razorpay"),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED", 
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED"
  ]),
  notes: z.string().max(500).optional(),
});

// ================================
// PRODUCT VALIDATION SCHEMAS
// ================================

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200, "Name must be less than 200 characters"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  subtitle: z.string().max(200).optional(),
  
  price: z.number().positive("Price must be positive"),
  comparePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  
  sku: z.string().optional(),
  barcode: z.string().optional(),
  quantity: z.number().int().nonnegative("Quantity cannot be negative").default(0),
  
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  
  images: z.array(z.string().url("Invalid image URL")).default([]),
  materials: z.array(z.string()).default([]),
  gemstones: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, "Product ID is required"),
});

// ================================
// CART VALIDATION SCHEMAS
// ================================

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().positive("Quantity must be positive").default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be positive"),
});

// ================================
// REVIEW VALIDATION SCHEMAS
// ================================

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().min(1, "Title is required").max(200),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(2000),
  images: z.array(z.string().url()).max(5, "Maximum 5 images allowed").default([]),
});

// ================================
// USER VALIDATION SCHEMAS
// ================================

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  
  language: z.string().length(2).optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  
  emailMarketing: z.boolean().optional(),
  smsMarketing: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

export const createAddressSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]).default("SHIPPING"),
  isDefault: z.boolean().default(false),
  
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  company: z.string().max(100).optional(),
  address1: z.string().min(1, "Address is required").max(200),
  address2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().length(2).default("IN"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
});

// ================================
// ADMIN VALIDATION SCHEMAS
// ================================

export const updateUserRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
  
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
});

// ================================
// SEARCH & FILTER SCHEMAS
// ================================

export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required").max(200),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  sortBy: z.enum(["relevance", "price_asc", "price_desc", "newest", "rating"]).default("relevance"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Validate request body against a Zod schema
 * Returns parsed data or throws validation error
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation that returns result object instead of throwing
 */
export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Format Zod errors for API response
 */
export function formatZodErrors(error: z.ZodError) {
  return error.issues.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}
