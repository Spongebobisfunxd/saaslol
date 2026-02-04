import { Router } from 'express';
import { AuthController } from './controller';
import { validateRequest } from '../../middleware/validateRequest';
import { authenticate } from '../../middleware/authenticate';
import { authLimiter } from '../../middleware/rateLimiter';
import { registerSchema, loginSchema, refreshTokenSchema } from './validators';

const router = Router();

router.post('/register', authLimiter, validateRequest({ body: registerSchema }), AuthController.register);
router.post('/login', authLimiter, validateRequest({ body: loginSchema }), AuthController.login);
router.post('/phone-login', authLimiter, AuthController.phoneLogin);
router.post('/refresh', validateRequest({ body: refreshTokenSchema }), AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export { router as authRoutes };
