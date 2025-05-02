import { RuntimeError } from "@akshay-na/exoframe/lib/common/RuntimeError";
import { MongoMemoryServer } from "mongodb-memory-server";

export type { MongoMemoryServer };

export class InMemoryMongoDb {
  private static database: MongoMemoryServer | undefined;

  public constructor() {}

  public static async getInstance(): Promise<MongoMemoryServer> {
    if (!InMemoryMongoDb.database)
      InMemoryMongoDb.database = await MongoMemoryServer.create({
        instance: { port: 55931 },
      });

    return InMemoryMongoDb.database;
  }

  public static get uri(): string {
    if (!InMemoryMongoDb.database)
      throw new RuntimeError("IN_MEMORY_DB_NOT_INITIALIZED");
    return InMemoryMongoDb.database.getUri();
  }

  public static async stop(): Promise<void> {
    if (!InMemoryMongoDb.database)
      throw new RuntimeError("IN_MEMORY_DB_NOT_INITIALIZED");
    await InMemoryMongoDb.database.stop();
  }
}
