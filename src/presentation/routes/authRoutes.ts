import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Authenticate user and get JWT token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 50
   *                 example: admin
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 maxLength: 100
   *                 example: password123
   *     responses:
   *       200:
   *         description: Authentication successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                 expiresIn:
   *                   type: string
   *                   example: 24h
   *       400:
   *         description: Validation error
   *       401:
   *         description: Invalid credentials
   */
  router.post('/login', (req, res, next) => authController.login(req, res, next));

  return router;
};