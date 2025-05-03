// InMemoryRedis.ts
import { RuntimeError } from "@akshay-na/exoframe/lib/common/RuntimeError";
import { RedisMemoryServer } from "redis-memory-server";

export type { RedisMemoryServer };

export class InMemoryRedis {
  private static server: RedisMemoryServer | undefined;

  private constructor() {}

  public static async getInstance(): Promise<RedisMemoryServer> {
    if (!InMemoryRedis.server) {
      InMemoryRedis.server = new RedisMemoryServer({
        instance: { port: 63801 },

        autoStart: true,
      });

      await InMemoryRedis.server.getPort();
    }
    return InMemoryRedis.server;
  }

  public static async uri(): Promise<string> {
    if (!InMemoryRedis.server)
      throw new RuntimeError("IN_MEMORY_REDIS_NOT_INITIALIZED");

    const host = await InMemoryRedis.server.getHost();
    const port = await InMemoryRedis.server.getPort();
    return `redis://${host}:${port}`;
  }

  public static async stop(): Promise<void> {
    if (!InMemoryRedis.server)
      throw new RuntimeError("IN_MEMORY_REDIS_NOT_INITIALIZED");

    await InMemoryRedis.server.stop();
    InMemoryRedis.server = undefined;
  }
}
