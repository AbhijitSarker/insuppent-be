import express from 'express';

import { LeadRoutes } from '../modules/lead/lead.routes.js';
import purchaseRoutes from '../modules/purchase/leadPurchase.routes.js';
import { AdminRoutes } from '../modules/admin/admin.routes.js';
import { AdminAuthRoutes } from '../modules/admin/auth/admin.auth.routes.js';
import { UserRoutes } from '../modules/user/user.routes.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { SettingsRoutes } from '../modules/settings/settings.routes.js';
import userAuthRoutes from '../modules/userAuth/userAuth.routes.js';
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
    path: '/admin/auth',
    route: AdminAuthRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
    middleware: adminAuth
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/settings',
    route: SettingsRoutes,
  },
  {
    path: '/user/auth',
    route: userAuthRoutes,
  },

];

moduleRoutes.forEach(route => {
  if (route.middleware) {
    router.use(route.path, route.middleware, route.route);
  } else {
    router.use(route.path, route.route);
  }
});

export default router;
