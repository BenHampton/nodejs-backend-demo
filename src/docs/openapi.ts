import { z } from 'zod';
import type { ZodType } from 'zod';

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
    responses: {
      '200': {
        description: 'env + test payload',
      },
    },
  },
};

export { bearer };
