// Zod schemas for runtime validation on web + mobile forms and API responses.
import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^(\+?\d{10,15})$/u, "Enter a valid phone number");

export const emailSchema = z.string().email("Enter a valid email");

export const loginSchema = z.object({
  identifier: z.string().min(3, "Email or phone required"),
  password: z.string().min(6, "Password too short"),
});

export const phoneLoginSchema = z.object({
  phone: phoneSchema,
});

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: z.string().regex(/^\d{4,6}$/u, "Enter the 4-6 digit code"),
});

export const completeProfileSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: emailSchema.optional().or(z.literal("")),
  city_id: z.number().int().positive("Pick a city"),
});

export const createBookingSchema = z.object({
  business_id: z.number().int().positive(),
  service_id: z.number().int().positive(),
  variant_id: z.number().int().positive().optional(),
  address_id: z.number().int().positive().optional(),
  scheduled_at: z.string().datetime().optional(),
  customer_name: z.string().min(2),
  customer_phone: phoneSchema,
  customer_email: emailSchema.optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export const submitReviewSchema = z.object({
  booking_id: z.number().int().positive().optional(),
  business_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const createLeadSchema = z.object({
  business_id: z.number().int().positive(),
  source: z.enum(["search", "listing", "contact_form", "phone_click"]),
  name: z.string().min(2).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional().or(z.literal("")),
  message: z.string().max(2000).optional(),
});

export const vendorOnboardingProfileSchema = z.object({
  name: z.string().min(2, "Business name required"),
  description: z.string().max(5000).optional(),
  short_description: z.string().max(300).optional(),
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  city_id: z.number().int().positive(),
  state_id: z.number().int().positive(),
  locality_id: z.number().int().positive().optional(),
  address: z.string().min(5).max(500),
  pin_code: z.string().regex(/^\d{4,8}$/u).optional(),
  category_ids: z.array(z.number().int().positive()).min(1, "Pick at least one category"),
});

export const createServiceSchema = z.object({
  business_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  short_description: z.string().max(300).optional(),
  base_price: z.number().nonnegative(),
  discounted_price: z.number().nonnegative().optional(),
  price_unit: z.enum(["fixed", "per_hour", "per_visit"]).default("fixed"),
  duration_minutes: z.number().int().positive().default(60),
});
