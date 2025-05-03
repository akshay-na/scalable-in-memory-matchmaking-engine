import { ENVIRONMENT } from "@akshay-na/exoframe/lib/common/Environment";
import { RuntimeError } from "@akshay-na/exoframe/lib/common/RuntimeError";
import {
  Express,
  ExpressBuilder,
  Server,
} from "@akshay-na/exoframe/lib/express/ExpressBuilder";

import { InMemoryMongoDb } from "../connections/InMemoryMongoDb";
import { InMemoryRedis } from "../connections/InMemoryRedis";
import { MongoDBConnection } from "../connections/MongoDB";
import { RedisConnection } from "../connections/Redis";

//Import Routes

import { MatchPrecomputeWorker } from "../worker/MatchPrecomputeWorker";
import "./routers/routes/index";

export default class Application {
  private expressBuilder: ExpressBuilder;
  private mongoDBConnection: MongoDBConnection;
  private redisConnection: RedisConnection;
  private static application: Express;
  private static server: Server;

  constructor() {
    this.expressBuilder = new ExpressBuilder();
    this.mongoDBConnection = MongoDBConnection.getInstance();
    this.redisConnection = RedisConnection.getInstance();
  }

  public getInstance(): Express {
    if (!Application.application) {
      throw new RuntimeError("App not initialized yet!");
    }
    return Application.application;
  }

  public async initialize(): Promise<Express> {
    try {
      await InMemoryMongoDb.getInstance();
      await InMemoryRedis.getInstance();

      await this.mongoDBConnection.connect(
        ENVIRONMENT.get("DATABASE_URL") || InMemoryMongoDb.uri
      );

      await this.redisConnection.connect(
        ENVIRONMENT.get("REDIS_URL") || (await InMemoryRedis.uri())
      );

      MatchPrecomputeWorker.init(this.redisConnection.getclient());

      Application.application = this.expressBuilder.initialize();
      return Application.application;
    } catch (error) {
      console.error("Error initializing application:", error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    if (!Application.application)
      throw new RuntimeError("App not initialized yet!");

    await this.mongoDBConnection.disconnect();
    await this.redisConnection.disconnect();

    await InMemoryMongoDb.stop();
    await InMemoryRedis.stop();
  }

  public startServer(): void {
    if (!Application.application) {
      throw new Error("Application is not initialized!");
    }

    const PORT = ENVIRONMENT.get("PORT") ?? 8888;
    Application.server = Application.application.listen(PORT, () => {
      console.log(`🚀 API ready on: http://localhost:${PORT}`);
    });

    process.on("SIGTERM", this.closeServer.bind(this, Application.application));
    process.on("SIGINT", this.closeServer.bind(this, Application.application));
  }

  public async closeServer() {
    try {
      if (Application.server) {
        Application.server.close();
      }

      await this.shutdown();

      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1); // Exit with error code if shutdown fails
    }
  }
}
