import config from '../config/env';
import type { HelloDto } from '../types/hello.dto';

export const getHello = (): HelloDto => ({
  env: config.nodeEnv,
  test: 'hello-world',
});
