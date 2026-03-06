import * as z from "zod";

/**
 * Validation schema for creating a new user
 * Matches backend validation requirements:
 * - Email: Valid email format
 * - Password: 8-128 characters
 * - Confirm Password: Must match password
 * - Category: personal or organization
 * - GST Number: Required for organizations, 15 characters
 * - Shipping Address: All fields required together
 */
export const createUserSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password cannot exceed 128 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    category: z.enum(["personal", "organization"], {
      message: "Please select a category",
    }),
    gstNumber: z.string().optional(),
    shippingAddress1: z.string().min(1, "Address line 1 is required"),
    shippingAddress2: z.string().optional(),
    shippingPin: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
    shippingCity: z.string().min(1, "City is required"),
    shippingState: z.string().min(1, "State is required"),
    shippingCountry: z.string().min(1, "Country is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.category === "organization") {
        return data.gstNumber && data.gstNumber.length === 15;
      }
      return true;
    },
    {
      message:
        "GST number is required and must be 15 characters for organizations",
      path: ["gstNumber"],
    }
  );

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
