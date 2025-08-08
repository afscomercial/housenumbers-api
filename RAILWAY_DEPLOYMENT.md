# Railway Deployment Guide

## Required Environment Variables

You need to set these environment variables in your Railway project:

### Required Environment Variables
```
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
AUTH_USERNAME=admin
AUTH_PASSWORD=your_secure_admin_password_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Optional Configuration
```
NODE_ENV=production
PORT=3000
JWT_EXPIRES_IN=24h
DATABASE_PATH=/app/data/database.sqlite
API_URL=${{RAILWAY_STATIC_URL}}
```

## Database Migration

**No manual migration needed** - The application handles database initialization automatically:

1. **Development mode**: `synchronize: true` - Automatically creates/updates tables
2. **Production mode**: `synchronize: false` - Tables are created on first run via TypeORM initialization
3. **Default user seeding**: Automatically creates the admin user on startup if it doesn't exist

## AI Service Configuration

The application now uses **OpenAI GPT-3.5-turbo** for text summarization instead of local models.

**Benefits:**
- No model files to manage
- Fast and reliable API responses
- Lower resource requirements
- Better scalability

**Railway Configuration:**
- Build resources: 2GB RAM, 2 vCPU for compilation
- Runtime resources: 1GB RAM, 1 vCPU for API service



## Deployment Steps

1. **Create Railway Project**
   ```bash
   railway new housenumbers-api
   ```

2. **Set Required Environment Variables** (in Railway dashboard)
   - `JWT_SECRET` (generate a secure random string)
   - `AUTH_USERNAME` (default admin user)  
   - `AUTH_PASSWORD` (secure password for admin)
   - `OPENAI_API_KEY` (your OpenAI API key)

3. **Deploy**
   ```bash
   railway up
   ```

4. **Verify Deployment**
   - Check health endpoint: `https://your-app.railway.app/health`
   - API documentation: `https://your-app.railway.app/api-docs`

## API Endpoints

- **POST** `/auth/login` - Get JWT token
- **POST** `/snippets` - Create text snippet with AI summary (requires Bearer token)
- **GET** `/snippets` - Get all snippets (requires Bearer token)  
- **GET** `/snippets/:id` - Get specific snippet (requires Bearer token)
- **GET** `/health` - Health check endpoint
- **GET** `/api-docs` - Swagger API documentation

## Notes

- The Docker build process includes TypeScript compilation
- SQLite database is stored in persistent volume at `/app/data/`
- Application runs as non-root user for security
- Health checks are configured for Railway monitoring
- Rate limiting is enabled (100 requests per 15 minutes per IP)