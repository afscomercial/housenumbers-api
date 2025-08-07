import Joi from 'joi';

export const createSnippetSchema = Joi.object({
  text: Joi.string()
    .min(1)
    .max(10000)
    .required()
    .messages({
      'string.base': 'Text must be a string',
      'string.empty': 'Text cannot be empty',
      'string.min': 'Text must have at least 1 character',
      'string.max': 'Text cannot exceed 10000 characters',
      'any.required': 'Text is required',
    }),
});

export const snippetIdSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.base': 'ID must be a string',
      'string.uuid': 'ID must be a valid UUID',
      'any.required': 'ID is required',
    }),
});