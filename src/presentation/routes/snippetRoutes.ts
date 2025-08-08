import { Router } from 'express';
import { SnippetController } from '../controllers/SnippetController';
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { JWTService } from '../../infrastructure/auth/JWTService';

export const createSnippetRoutes = (
  snippetController: SnippetController,
  jwtService: JWTService
): Router => {
  const router = Router();
  const authMiddleware = createAuthMiddleware(jwtService);

  /**
   * @swagger
   * /snippets:
   *   post:
   *     summary: Create a new snippet with AI-generated summary
   *     tags: [Snippets]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - text
   *             properties:
   *               text:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 10000
   *                 example: This is a long text that needs to be summarized by AI...
   *     responses:
   *       201:
   *         description: Snippet created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Snippet'
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  // Test endpoint without auth to debug body parsing
  router.post('/test', (req, res) => {
    console.log('Test endpoint - body:', req.body);
    res.json({ received: req.body, success: true });
  });

  router.post('/', authMiddleware, (req, res, next) => 
    snippetController.createSnippet(req, res, next)
  );

  /**
   * @swagger
   * /snippets/{id}:
   *   get:
   *     summary: Get a snippet by ID
   *     tags: [Snippets]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Snippet ID
   *     responses:
   *       200:
   *         description: Snippet retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Snippet'
   *       400:
   *         description: Invalid ID format
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Snippet not found
   */
  router.get('/:id', authMiddleware, (req, res, next) => 
    snippetController.getSnippet(req, res, next)
  );

  /**
   * @swagger
   * /snippets:
   *   get:
   *     summary: Get all snippets
   *     tags: [Snippets]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Snippets retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Snippet'
   *       401:
   *         description: Unauthorized
   */
  router.get('/', authMiddleware, (req, res, next) => 
    snippetController.getAllSnippets(req, res, next)
  );

  /**
   * @swagger
   * /snippets/{id}:
   *   delete:
   *     summary: Delete a snippet by ID
   *     tags: [Snippets]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Snippet ID
   *     responses:
   *       204:
   *         description: Snippet deleted successfully
   *       400:
   *         description: Invalid ID format
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Snippet not found
   */
  router.delete('/:id', authMiddleware, (req, res, next) => 
    snippetController.deleteSnippet(req, res, next)
  );

  return router;
};