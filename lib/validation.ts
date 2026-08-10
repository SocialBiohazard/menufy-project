import { z } from "zod";
import { isValidTimezone } from "@/lib/restaurant-footer";

export const LANGS = ["tr", "en", "ar", "ru"] as const;

const slugField = z
  .string()
  .min(1, "Slug is required")
  .max(80, "Slug is too long")
  .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only");

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional();

const optionalImage = z
  .string()
  .refine(
    (value) => value === "" || value.startsWith("/") || z.string().url().safeParse(value).success,
    "Use a valid image URL",
  )
  .optional();

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Use a full http:// or https:// URL")
  .optional();

const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Use a valid email address",
  )
  .optional();

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Use a valid date",
  )
  .optional();

const hostnameField = z
  .string()
  .trim()
  .toLowerCase()
  .refine(
    (value) => value === "" || /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(value),
    "Use a hostname only, for example menu.example.com",
  );

const hoursPeriodSchema = z.object({
  start: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM time"),
  end: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM time"),
});

const dayHoursSchema = z.object({
  day: z.number().int().min(0).max(6),
  closed: z.boolean(),
  allDay: z.boolean(),
  periods: z.array(hoursPeriodSchema).min(1).max(4),
});

const footerVisibilitySchema = z.object({
  description: z.boolean(),
  phone: z.boolean(),
  whatsapp: z.boolean(),
  email: z.boolean(),
  website: z.boolean(),
  address: z.boolean(),
  maps: z.boolean(),
  hours: z.boolean(),
  reviews: z.boolean(),
  instagram: z.boolean(),
  facebook: z.boolean(),
  tiktok: z.boolean(),
  x: z.boolean(),
  youtube: z.boolean(),
  copyright: z.boolean(),
});

export const restaurantCreateSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required").max(120),
  slug: slugField,
  businessType: optionalText(80, "Business type is too long"),
  templateType: z.string().min(1, "Pick a template"),
});
export type RestaurantCreateInput = z.infer<typeof restaurantCreateSchema>;

export const restaurantCoreSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required").max(120),
  slug: slugField,
  businessType: optionalText(80, "Business type is too long"),
  templateType: z.string().min(1),
  categoryNavigationStyle: z.enum(["DRILLDOWN", "ACCORDION"]),
  defaultLang: z.enum(LANGS),
  enabledLangs: z.array(z.enum(LANGS)).min(1, "Enable at least one language"),
  logo: optionalImage,
  coverImage: optionalImage,
  splashImage: optionalImage,
  splashEnabled: z.boolean(),
  publicHostname: hostnameField,
  slogan: optionalText(240, "Slogan is too long"),
  sloganEn: optionalText(240, "English slogan is too long"),
  sloganAr: optionalText(240, "Arabic slogan is too long"),
  sloganRu: optionalText(240, "Russian slogan is too long"),
  establishedYear: z.coerce
    .number()
    .int()
    .min(1000)
    .max(new Date().getUTCFullYear())
    .optional()
    .nullable(),
  currencyCode: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Use a 3-letter currency code"),
  phone: optionalText(40, "Phone number is too long"),
  email: optionalEmail,
  whatsappNumber: optionalText(40, "WhatsApp number is too long"),
  websiteUrl: optionalUrl,
  address: optionalText(500, "Address is too long"),
  city: optionalText(100, "City is too long"),
  district: optionalText(100, "District is too long"),
  workingHours: optionalText(500, "Working hours are too long"),
  workingHoursEn: optionalText(500, "English working hours are too long"),
  workingHoursAr: optionalText(500, "Arabic working hours are too long"),
  workingHoursRu: optionalText(500, "Russian working hours are too long"),
  timezone: z.string().trim().min(1).max(100).refine(isValidTimezone, "Use a valid IANA timezone"),
  weeklyHours: z.array(dayHoursSchema).length(7).refine(
    (days) => new Set(days.map((day) => day.day)).size === 7,
    "Provide each weekday exactly once",
  ),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  xUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  googleMapsUrl: optionalUrl,
  googleReviewsUrl: optionalUrl,
  kdvNotice: optionalText(500, "Tax notice is too long"),
  kdvNoticeEn: optionalText(500, "English tax notice is too long"),
  kdvNoticeAr: optionalText(500, "Arabic tax notice is too long"),
  kdvNoticeRu: optionalText(500, "Russian tax notice is too long"),
  allergenNotice: optionalText(1000, "Allergen notice is too long"),
  allergenNoticeEn: optionalText(1000, "English allergen notice is too long"),
  allergenNoticeAr: optionalText(1000, "Arabic allergen notice is too long"),
  allergenNoticeRu: optionalText(1000, "Russian allergen notice is too long"),
  nutritionNotice: optionalText(1000, "Nutrition notice is too long"),
  nutritionNoticeEn: optionalText(1000, "English nutrition notice is too long"),
  nutritionNoticeAr: optionalText(1000, "Arabic nutrition notice is too long"),
  nutritionNoticeRu: optionalText(1000, "Russian nutrition notice is too long"),
  footerDescription: optionalText(500, "Footer description is too long"),
  footerDescriptionEn: optionalText(500, "English footer description is too long"),
  footerDescriptionAr: optionalText(500, "Arabic footer description is too long"),
  footerDescriptionRu: optionalText(500, "Russian footer description is too long"),
  footerCopyright: optionalText(240, "Copyright line is too long"),
  footerVisibility: footerVisibilitySchema,
  lastPriceChangeAt: optionalDate,
  attributionText: optionalText(120, "Attribution text is too long"),
  attributionUrl: optionalUrl,
  themeAccent: z.string().optional(),
  themePrimary: z.string().optional(),
  themeSecondary: z.string().optional(),
  themeBackground: z.string().optional(),
  themeBorder: z.string().optional(),
  themeText: z.string().optional(),
});
export type RestaurantCoreInput = z.infer<typeof restaurantCoreSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameEn: z.string().optional(),
  nameAr: z.string().optional(),
  nameRu: z.string().optional(),
  imageUrl: optionalImage,
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameEn: z.string().optional(),
  nameAr: z.string().optional(),
  nameRu: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionRu: z.string().optional(),
  price: z.coerce.number().int().min(0, "Price must be 0 or more"),
  imageUrl: optionalImage,
  ingredients: z.string().optional(),
  portionGrams: z.coerce.number().int().positive().optional().nullable(),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  hasAlcohol: z.boolean().default(false),
  hasPork: z.boolean().default(false),
  allergenIds: z.array(z.number().int()).default([]),
  // optional nutrition
  energyKcal: z.coerce.number().int().optional().nullable(),
  protein: z.coerce.number().optional().nullable(),
  fat: z.coerce.number().optional().nullable(),
  saturatedFat: z.coerce.number().optional().nullable(),
  carbohydrate: z.coerce.number().optional().nullable(),
  sugar: z.coerce.number().optional().nullable(),
  fiber: z.coerce.number().optional().nullable(),
  saltG: z.coerce.number().optional().nullable(),
  nutritionBasis: z.enum(["100g", "100ml", "per portion"]).optional().nullable(),
  nutritionEstimated: z.boolean().default(false),
});
export type ItemInput = z.infer<typeof itemSchema>;
