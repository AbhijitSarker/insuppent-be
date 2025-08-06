import express from 'express';
import { LeadRoutes } from '../modules/lead/lead.routes.js';
import { AdminRoutes } from '../modules/admin/admin.routes.js';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/leads',
    route: LeadRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
