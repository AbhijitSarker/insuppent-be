import express from 'express';

import { LeadRoutes } from '../modules/lead/lead.routes.js';
import purchaseRoutes from '../modules/purchase/leadPurchase.routes.js';
import { AdminRoutes } from '../modules/admin/admin.routes.js';
import { UserRoutes } from '../modules/user/user.routes.js';

import AuthRoutes from '../modules/auth/auth.routes.js';
import { SettingsRoutes } from '../modules/settings/settings.routes.js';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/leads',
    route: LeadRoutes,
  },
  {
    path: '/purchase',
    route: purchaseRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/settings',
    route: SettingsRoutes,
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
