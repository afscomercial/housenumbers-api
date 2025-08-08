import { Request, Response, NextFunction } from 'express';
import { CreateSnippetUseCase } from '../../application/use-cases/CreateSnippetUseCase';
import { GetSnippetUseCase } from '../../application/use-cases/GetSnippetUseCase';
import { GetAllSnippetsUseCase } from '../../application/use-cases/GetAllSnippetsUseCase';
import { DeleteSnippetUseCase } from '../../application/use-cases/DeleteSnippetUseCase';
import { createSnippetSchema, snippetIdSchema } from '../validators/snippetValidators';
import { ValidationError } from '../../shared/errors/AppError';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class SnippetController {
  constructor(
    private createSnippetUseCase: CreateSnippetUseCase,
    private getSnippetUseCase: GetSnippetUseCase,
    private getAllSnippetsUseCase: GetAllSnippetsUseCase,
    private deleteSnippetUseCase: DeleteSnippetUseCase
  ) {}

  async createSnippet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = createSnippetSchema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const snippet = await this.createSnippetUseCase.execute(value);

      res.status(201).json({
        id: snippet.id,
        text: snippet.text,
        summary: snippet.summary,
        createdAt: snippet.createdAt.toISOString(),
        updatedAt: snippet.updatedAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getSnippet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = snippetIdSchema.validate(req.params);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const snippet = await this.getSnippetUseCase.execute(value.id);

      res.json({
        id: snippet.id,
        text: snippet.text,
        summary: snippet.summary,
        createdAt: snippet.createdAt.toISOString(),
        updatedAt: snippet.updatedAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSnippets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const snippets = await this.getAllSnippetsUseCase.execute();

      res.json(
        snippets.map(snippet => ({
          id: snippet.id,
          text: snippet.text,
          summary: snippet.summary,
          createdAt: snippet.createdAt.toISOString(),
          updatedAt: snippet.updatedAt.toISOString(),
        }))
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteSnippet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = snippetIdSchema.validate(req.params);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      await this.deleteSnippetUseCase.execute(value.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}