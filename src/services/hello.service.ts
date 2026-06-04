import config from '../config/env.js';
import type { HelloDto } from '../types/hello.dto.js';

export const getHello = (): HelloDto => ({
  env: config.nodeEnv,
  test: 'hello-world',
});
