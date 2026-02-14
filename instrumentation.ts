import { connectToRedis } from './lib/redis';

export function register() {
  connectToRedis();
}
