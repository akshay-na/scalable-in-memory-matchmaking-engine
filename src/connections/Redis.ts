import { RuntimeError } from "@akshay-na/exoframe/lib/common/RuntimeError";
import Redis, { Redis as RedisClient } from "ioredis";

export class RedisConnection {
  private static instance: RedisConnection;
  private client: RedisClient | null = null;

  private constructor() {}

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  public async connect(uri: string): Promise<void> {
    if (this.client) {
      console.log("Already connected to Redis.");
      return;
    }

    try {
      this.client = new Redis(uri, {
        reconnectOnError: (err) => {
          console.log("Redis reconnect error:", err);
          return true;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        connectTimeout: 10000,
      });

      this.client.on("connect", () => {
        console.log("Redis connection successful");
      });

      this.client.on("error", (err) => {
        console.error("Redis connection error:", err);
        throw new RuntimeError("Could not connect to Redis");
      });

      await this.client;
    } catch (error) {
      console.error("Redis connection error:", error);
      throw new RuntimeError("Could not connect to Redis");
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.client) {
      console.log("No active Redis connection to disconnect");
      return;
    }

    try {
      await this.client.quit();
      console.log("Redis disconnected");
    } catch (error) {
      console.error("Error disconnecting Redis:", error);
    }
  }

  public getClient(): RedisClient {
    if (!this.client) {
      throw new RuntimeError("Redis client is not connected");
    }
    return this.client;
  }
}
