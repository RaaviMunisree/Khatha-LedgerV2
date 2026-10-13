import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must contain at least 2 characters",
      ),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .optional()
      .or(z.literal("")),

    phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    password: z
      .string()
      .min(
        8,
        "Password must contain at least 8 characters",
      ),

    role: z.enum([
      "SHOP_OWNER",
      "CUSTOMER",
    ]),

    customerId: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, context) => {
    if (
      data.role === "CUSTOMER" &&
      !data.customerId
    ) {
      context.addIssue({
        code: "custom",
        path: ["customerId"],
        message:
          "Customer ID is required for customer registration",
      });
    }
  });

export type LoginFormData =
  z.infer<typeof loginSchema>;

export type RegisterFormData =
  z.infer<typeof registerSchema>;