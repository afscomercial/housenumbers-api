import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { AppDataSource } from './infrastructure/database/DataSource';
import { TypeOrmSnippetRepository } from './infrastructure/database/repositories/TypeOrmSnippetRepository';
import { TypeOrmUserRepository } from './infrastructure/database/repositories/TypeOrmUserRepository';
import { LlamaLLMService } from './infrastructure/llm/LlamaLLMService';
import { JWTService } from './infrastructure/auth/JWTService';

import { CreateSnippetUseCase } from './application/use-cases/CreateSnippetUseCase';
import { GetSnippetUseCase } from './application/use-cases/GetSnippetUseCase';
import { GetAllSnippetsUseCase } from './application/use-cases/GetAllSnippetsUseCase';
import { AuthenticateUserUseCase } from './application/use-cases/AuthenticateUserUseCase';
import { SummaryService } from './application/services/SummaryService';

import { AuthController } from './presentation/controllers/AuthController';
import { SnippetController } from './presentation/controllers/SnippetController';
import { createAuthRoutes } from './presentation/routes/authRoutes';
import { createSnippetRoutes } from './presentation/routes/snippetRoutes';
import { errorMiddleware } from './presentation/middleware/errorMiddleware';

import { UserSeeder } from './shared/utils/seedUser';

export class App {
  public app: express.Application;
  private jwtService: JWTService;
  private llamaService: LlamaLLMService;

  constructor() {
    this.app = express();
    this.jwtService = new JWTService(
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRES_IN || '24h'
    );
    this.llamaService = new LlamaLLMService();
  }

  async initialize(): Promise<void> {
    await this.initializeDatabase();
    await this.setupMiddlewares();
    await this.setupRoutes();
    await this.setupSwagger();
    await this.setupErrorHandling();
    await this.seedDefaultUser();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await AppDataSource.initialize();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async setupMiddlewares(): Promise<void> {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use(limiter);
  }

  private async setupRoutes(): Promise<void> {
    // Repositories
    const snippetRepository = new TypeOrmSnippetRepository();
    const userRepository = new TypeOrmUserRepository();

    // Services
    const summaryService = new SummaryService(this.llamaService);

    // Use Cases
    const createSnippetUseCase = new CreateSnippetUseCase(snippetRepository, summaryService);
    const getSnippetUseCase = new GetSnippetUseCase(snippetRepository);
    const getAllSnippetsUseCase = new GetAllSnippetsUseCase(snippetRepository);
    const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);

    // Controllers
    const authController = new AuthController(authenticateUserUseCase, this.jwtService);
    const snippetController = new SnippetController(
      createSnippetUseCase,
      getSnippetUseCase,
      getAllSnippetsUseCase
    );

    // Routes
    this.app.use('/auth', createAuthRoutes(authController));
    this.app.use('/snippets', createSnippetRoutes(snippetController, this.jwtService));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  }

  private async setupSwagger(): Promise<void> {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Housenumbers API',
          version: '1.0.0',
          description: 'AI-powered text summarization API using clean architecture',
        },
        servers: [
          {
            url: process.env.API_URL || 'http://localhost:3000',
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
          schemas: {
            Snippet: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000',
                },
                text: {
                  type: 'string',
                  example: 'This is the original text that was summarized',
                },
                summary: {
                  type: 'string',
                  example: 'This is the AI-generated summary',
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2023-01-01T00:00:00.000Z',
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2023-01-01T00:00:00.000Z',
                },
              },
            },
          },
        },
      },
      apis: ['./src/presentation/routes/*.ts'],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private async setupErrorHandling(): Promise<void> {
    this.app.use(errorMiddleware);
  }

  private async seedDefaultUser(): Promise<void> {
    const userRepository = new TypeOrmUserRepository();
    const userSeeder = new UserSeeder(userRepository);
    await userSeeder.seedDefaultUser();
  }

  async close(): Promise<void> {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    if (this.llamaService) {
      await this.llamaService.dispose();
    }
  }
}