import 'dotenv/config';
import { App } from './app';

const PORT = parseInt(process.env.PORT || '8080', 10);

async function bootstrap() {
  const app = new App();
  
  try {
    await app.initialize();
    
    const server = app.app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔒 HTTP server closed');
        
        try {
          await app.close();
          console.log('Application closed successfully');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();