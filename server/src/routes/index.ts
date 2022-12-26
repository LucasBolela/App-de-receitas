import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { authRoutes } from './auth';
import { recipesRoutes } from './recipes';
import { timezoneRoute } from './timezones';
import { userRoutes } from './user';
export const routes = Router();

routes.use(timezoneRoute);
routes.use(authRoutes);

routes.use(authMiddleware);

routes.use(userRoutes);
routes.use(recipesRoutes);