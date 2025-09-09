import { z } from 'zod';

export const AdminValidation = {
  createAdmin: z.object({
    body: z.object({
      name: z.string({
        required_error: 'Name is required',
      }),
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email('Invalid email format'),
      password: z
        .string({
          required_error: 'Password is required',
        })
        .min(6, 'Password must be at least 6 characters'),
      role: z.enum(['admin', 'super_admin']).optional(),
      status: z.enum(['active', 'inactive']).optional(),
    }),
  }),

  loginAdmin: z.object({
    body: z.object({
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email('Invalid email format'),
      password: z
        .string({
          required_error: 'Password is required',
        })
        .min(6, 'Password must be at least 6 characters'),
    }),
  }),

  changePassword: z.object({
    body: z.object({
      currentPassword: z.string({
        required_error: 'Current password is required',
      }),
      newPassword: z.string({
        required_error: 'New password is required',
      })
      .min(6, 'Password must be at least 6 characters'),
    }),
  }),

  updateAdmin: z.object({
    body: z.object({
      name: z.string().optional(),
      email: z.string().email('Invalid email format').optional(),
      password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .optional(),
      role: z.enum(['admin', 'super_admin']).optional(),
      status: z.enum(['active', 'inactive']).optional(),
    }),
  }),
};
