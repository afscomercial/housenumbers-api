import Joi from 'joi';

export const loginSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.base': 'Username must be a string',
      'string.empty': 'Username cannot be empty',
      'string.min': 'Username must have at least 3 characters',
      'string.max': 'Username cannot exceed 50 characters',
      'any.required': 'Username is required',
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must have at least 6 characters',
      'string.max': 'Password cannot exceed 100 characters',
      'any.required': 'Password is required',
    }),
});