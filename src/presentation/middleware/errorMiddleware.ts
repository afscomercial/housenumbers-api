import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    });
  }

  console.error('Unexpected error:', error);
  
  return res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    },
  });
};