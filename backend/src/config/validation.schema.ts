import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(4000),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_RESET_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_TTL: Joi.string().required(),
  JWT_REFRESH_TTL: Joi.string().required(),
  JWT_RESET_TTL: Joi.string().required(),
  GEMINI_API_KEY: Joi.string().allow('').optional(),
  APP_URL: Joi.string().uri().required(),
  CORS_ORIGIN: Joi.string().required(),
});
