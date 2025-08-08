# Housenumbers API

A chat AI API for text summarization built with clean architecture, TypeScript, and Express.js. The API uses a quantized LLM (Llama-2-7b-chat) to automatically generate summaries of provided text snippets.

## Features

- AI-powered text summarization using Llama-2-7b-chat
- Clean Architecture with clear separation of concerns
- Test-Driven Development (TDD) with Jest
- JWT-based authentication
- OpenAPI/Swagger documentation
- Docker containerization
- Railway deployment ready
- SQLite database with TypeORM
- Rate limiting and security middleware

## Architecture

The project follows Clean Architecture principles:

```
src/
├── domain/                 # Enterprise business rules
│   ├── entities/          # Domain entities
│   └── repositories/      # Repository interfaces
├── application/           # Application business rules
│   ├── services/         # Application services
│   └── use-cases/        # Use case implementations
├── infrastructure/       # Frameworks & drivers
│   ├── database/         # Database implementation
│   ├── llm/             # LLM service implementation
│   └── auth/            # Authentication implementation
├── presentation/         # Interface adapters
│   ├── controllers/     # HTTP controllers
│   ├── routes/         # Route definitions
│   ├── middleware/     # Express middleware
│   └── validators/     # Input validation
└── shared/              # Shared utilities
    ├── errors/         # Error definitions
    ├── types/          # Type definitions
    └── utils/          # Utility functions
```

## API Endpoints

### Authentication
- `POST /auth/login` - Authenticate and get JWT token

### Snippets
- `POST /snippets` - Create snippet with AI summary (Protected)
- `GET /snippets/:id` - Get snippet by ID (Protected)
- `GET /snippets` - Get all snippets (Protected)

### Other
- `GET /health` - Health check endpoint
- `GET /api-docs` - Swagger documentation

## Prerequisites

- Node.js 22+ (use .nvmrc)
- Docker and Docker Compose
- The Llama-2-7b-chat quantized model (see setup below)

## Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd housenumbers
nvm use  # Use Node.js version from .nvmrc
npm install
```

### 2. Download the AI Model

Download the quantized Llama-2 model:

```bash
# Create models directory
mkdir -p models

# Download the model (approximately 3.8GB)
curl -L -o models/llama-2-7b-chat.Q4_K_S.gguf \
  "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_S.gguf?download=true"
```

### 3. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Authentication (change these!)
AUTH_USERNAME=admin
AUTH_PASSWORD=secure_password_123

# Database
DATABASE_PATH=./data/database.sqlite

# AI Model
MODEL_PATH=./models/phi-2.Q4_0.gguf
MODEL_CONTEXT_SIZE=2048
MODEL_GPU_LAYERS=0  # Set to higher value if you have GPU support
```

### 4. Run Database Migrations

```bash
npm run migrate
```

## Development

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Build and run production
npm run build
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix
```

## Docker Deployment

### Local Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Production Docker

```bash
# Build production image
docker build -t housenumbers-api .

# Run production container
docker run -p 3000:3000 \
  -e JWT_SECRET="your_secret" \
  -e AUTH_USERNAME="admin" \
  -e AUTH_PASSWORD="your_password" \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/models:/app/models \
  housenumbers-api
```

## Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard:
   - `JWT_SECRET`
   - `AUTH_USERNAME`
   - `AUTH_PASSWORD`
   - Other variables as needed
3. Ensure the AI model is available in your deployment (you may need to upload it separately or download it during deployment)

## Usage Examples

### 1. Login to get JWT token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "secure_password_123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### 2. Create a snippet with AI summary

```bash
curl -X POST http://localhost:3000/snippets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions. The term may also be applied to any machine that exhibits traits associated with a human mind such as learning and problem-solving. The ideal characteristic of artificial intelligence is its ability to rationalize and take actions that have the best chance of achieving a specific goal."
  }'
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "text": "Artificial Intelligence (AI) refers to...",
  "summary": "AI simulates human intelligence in machines, enabling learning and problem-solving capabilities.",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### 3. Get all snippets

```bash
curl -X GET http://localhost:3000/snippets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get a specific snippet

```bash
curl -X GET http://localhost:3000/snippets/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

## Performance Considerations

- The AI model requires significant RAM (4-8GB recommended)
- First request may take longer due to model initialization
- Consider GPU acceleration for better performance (set `MODEL_GPU_LAYERS` > 0)
- Use appropriate `MODEL_CONTEXT_SIZE` based on your memory constraints

## Security

- Change default username/password in production
- Use a strong JWT secret
- Enable HTTPS in production
- Configure appropriate rate limiting
- Review CORS settings for production use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Troubleshooting

### Common Issues

1. **Model loading fails**: Ensure the model file is downloaded and path is correct
2. **Memory issues**: Reduce `MODEL_CONTEXT_SIZE` or add more RAM
3. **Port conflicts**: Change the PORT environment variable
4. **Database issues**: Check file permissions for the data directory

### Support

For issues and questions, please check:
1. This README
2. API documentation at `/api-docs`
3. Application logs
4. GitHub issues
