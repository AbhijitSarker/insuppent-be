import express from 'express';
import { LeadRoutes } from '../modules/lead/lead.routes.js';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/leads',
    route: LeadRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
