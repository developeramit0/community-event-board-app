import { z } from "zod";
import { EVENT_CATEGORIES, AVAILABLE_STICKERS, CARD_THEMES } from "./constants";

export const signupSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createEventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  category: z.enum(EVENT_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid event category" }),
  }),
  city: z.string().trim().min(2, "City name must be at least 2 characters").max(60),
  startsAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format (must be valid ISO date string)",
  }),
  priceInPaise: z
    .number()
    .int("Price in paise must be an integer")
    .min(0, "Price cannot be negative"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().trim().url("Image URL must be a valid URL"),
});

export const updateEventStatusSchema = z.object({
  isActive: z.boolean({ required_error: "isActive boolean is required" }),
});

export const eventsQuerySchema = z.object({
  category: z.enum(EVENT_CATEGORIES).optional(),
  city: z.string().trim().optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(9),
});

export const updateFavouritesSchema = z.object({
  categories: z
    .array(z.enum(EVENT_CATEGORIES))
    .min(1, "Select at least one favourite category"),
});

export const updateCardDesignSchema = z.object({
  theme: z.string().refine((theme) => Boolean(CARD_THEMES[theme]), {
    message: "Theme must be one of sunset, ocean, or forest",
  }),
  stickers: z
    .array(z.string().refine((s) => (AVAILABLE_STICKERS as readonly string[]).includes(s), {
      message: "Invalid sticker emoji",
    }))
    .max(3, "You can select up to 3 stickers only"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>;
export type EventsQueryInput = z.infer<typeof eventsQuerySchema>;
export type UpdateFavouritesInput = z.infer<typeof updateFavouritesSchema>;
export type UpdateCardDesignInput = z.infer<typeof updateCardDesignSchema>;
