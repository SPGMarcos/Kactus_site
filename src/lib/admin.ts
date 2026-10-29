import 'server-only';
import { z } from 'zod';
import { productSchema, variantSchema } from './validation';
export const entitySchemas = {
  products: productSchema,
  variants: variantSchema,
  categories: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().regex(/^[a-z0-9-]+$/),
  }),
  collections: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    month: z.iso.date(),
    active: z.boolean(),
  }),
  expenses: z.object({
    description: z.string().min(3).max(500),
    amount: z.number().int().positive(),
    incurred_on: z.iso.date(),
  }),
  orders: z.object({
    fulfillment_status: z.enum(['preparing', 'shipped', 'ready', 'completed']),
    tracking: z.string().max(150).nullable(),
  }),
  product_images: z.object({
    product_id: z.uuid(),
    path: z.string().min(1).max(300),
    alt: z.string().min(2).max(200),
    position: z.number().int().min(0).max(100),
  }),
};
export const settingsSchema = z.object({
  whatsapp: z
    .string()
    .regex(/^[0-9+ ()-]*$/)
    .max(30)
    .nullable(),
  address: z.string().max(500).nullable(),
  delivery_policy: z.string().max(10000),
  returns_policy: z.string().max(10000),
  privacy_policy: z.string().max(15000),
  test_pickup: z.boolean(),
});
