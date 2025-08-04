import { z } from 'zod';

const updateLeadZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    zipCode: z.string().optional(),
    state: z.string().optional(),
    type: z.enum(['auto', 'home', 'mortgage', 'other']).optional(),
    status: z.enum(['public', 'private']).optional(),
    saleCount: z.number().int().min(0).optional(),
    maxLeadSaleCount: z.number().int().min(1).optional(),
  }),
});

export const LeadValidation = {
  updateLeadZodSchema,
};
