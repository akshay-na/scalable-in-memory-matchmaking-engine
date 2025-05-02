import { MongoMemoryServer } from "mongodb-memory-server";

export class InMemoryMongoDb {
  private constructor(private readonly mongoServer: MongoMemoryServer) {}

  public static async getInstance(): Promise<InMemoryMongoDb> {
    const server = await MongoMemoryServer.create();
    return new InMemoryMongoDb(server);
  }

  public get uri(): string {
    return this.mongoServer.getUri();
  }

  public async disconnect(): Promise<void> {
    await this.mongoServer.stop();
  }
}
