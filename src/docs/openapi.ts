import { z } from 'zod';
import type { ZodType } from 'zod';
import { registerSchema, loginSchema } from '../types/auth.dto.js';

// Zod 4 native: schema → OpenAPI 3.0 schema object. No third-party lib.
// io:'input' documents what the client sends (pre-transform); unrepresentable:'any'
// degrades constructs like .toLowerCase()/.trim() to {} instead of throwing.
export const toOpenApi = (s: ZodType) =>
  z.toJSONSchema(s, {
    target: 'openapi-3.0',
    io: 'input',
    unrepresentable: 'any',
  });

const bearer = [{ bearerAuth: [] as string[] }];

export const openapiDocument = {
  openapi: '3.0.3',
  info: { title: 'My API', version: '1.0.0' },
  servers: [{ url: 'http://localhost:3000/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      // populated in S06: RegisterInput, LoginInput (from the Zod schemas)
    } as Record<string, unknown>,
  },
  paths: {
    // operations added per section, e.g. '/auth/register': { post: { ... } }
  } as Record<string, unknown>,
};

openapiDocument.paths['/v1/hello'] = {
  get: {
    tags: ['Hello'],
    responses: { '200': { description: 'env + test payload' } },
  },
};

openapiDocument.components.schemas.RegisterInput = toOpenApi(registerSchema);
openapiDocument.components.schemas.LoginInput = toOpenApi(loginSchema);

openapiDocument.paths['/v1/auth/register'] = {
  post: {
    tags: ['Auth'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/RegisterInput' },
        },
      },
    },
    responses: {
      '201': { description: 'Created' },
      '409': { description: 'Email already in use' },
    },
  },
};

openapiDocument.paths['/v1/auth/login'] = {
  post: {
    tags: ['Auth'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/LoginInput' },
        },
      },
    },
    responses: {
      '200': { description: 'OK' },
      '401': { description: 'Invalid credentials' },
    },
  },
};
openapiDocument.paths['/v1/auth-hello'] = {
  get: {
    tags: ['Protected'],
    security: bearer,
    responses: {
      '200': { description: 'OK' },
      '401': { description: 'Unauthorized' },
    },
  },
};
openapiDocument.paths['/v1/auth/refresh'] = {
  post: {
    tags: ['Auth'],
    responses: {
      '200': { description: 'New access token (refresh cookie)' },
      '401': { description: 'No/invalid refresh token' },
    },
  },
};
openapiDocument.paths['/v1/auth/logout'] = {
  post: { tags: ['Auth'], responses: { '200': { description: 'Logged out' } } },
};

export { bearer };
