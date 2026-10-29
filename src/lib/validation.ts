import { z } from 'zod';
export const checkoutSchema = z
  .object({
    key: z.uuid(),
    items: z
      .array(
        z
          .object({
            variant_id: z.uuid(),
            quantity: z.number().int().min(1).max(20),
          })
          .strict(),
      )
      .min(1)
      .max(30),
  })
  .strict();
export const productSchema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(160),
  description: z.string().max(5000),
  price: z.number().int().positive().max(10000000),
  category_id: z.uuid().nullable(),
  collection_id: z.uuid().nullable(),
  status: z.enum(['draft', 'active', 'archived']),
  featured: z.boolean(),
});
export const variantSchema = z.object({
  product_id: z.uuid(),
  sku: z.string().trim().min(1).max(100),
  size: z.string().min(1).max(30),
  color: z.string().min(1).max(50),
  cost: z.number().int().nonnegative().nullable(),
});
export const stockSchema = z.object({
  variant_id: z.uuid(),
  delta: z
    .number()
    .int()
    .min(-100000)
    .max(100000)
    .refine((v) => v !== 0),
  reason: z.string().trim().min(5).max(500),
});
