import { ENVIRONMENT } from "@akshay-na/exoframe/lib/common/Environment";
import {
  Express,
  ExpressBuilder,
  Server,
} from "@akshay-na/exoframe/lib/express/ExpressBuilder";
import { InMemoryMongoDb } from "./connections/InMemoryMongoDb";
import { MongoDBConnection } from "./connections/MongoDB";

//Import Routes
import "./routers/routes/index";

export default class Application {
  private expressBuilder: ExpressBuilder;
  private mongoDBConnection: MongoDBConnection | InMemoryMongoDb;
  private static application: Express;
  private static server: Server;

  constructor() {
    this.expressBuilder = new ExpressBuilder();
    this.mongoDBConnection = MongoDBConnection.getInstance();
  }

  public getInstance(): Express {
    if (!Application.application) {
      throw new Error("App not initialized yet!");
    }
    return Application.application;
  }

  public async initialize(): Promise<Express> {
    try {
      this.mongoDBConnection = await InMemoryMongoDb.getInstance();
      Application.application = this.expressBuilder.initialize();
      return Application.application;
    } catch (error) {
      console.error("Error initializing application:", error);
      process.exit(1);
    }
  }

  public startServer(): void {
    if (!Application.application) {
      throw new Error("Application is not initialized!");
    }

    const PORT = ENVIRONMENT.get("PORT") ?? 8888;
    Application.server = Application.application.listen(PORT, () => {
      console.log(`🚀 API ready on: http://localhost:${PORT}`);
    });

    process.on(
      "SIGTERM",
      this.gracefulShutdown.bind(this, Application.application)
    );
    process.on(
      "SIGINT",
      this.gracefulShutdown.bind(this, Application.application)
    );
  }

  public async gracefulShutdown() {
    try {
      console.log("Shutting down gracefully...");

      if (Application.server) {
        Application.server.close(() => {
          console.log("Express server has been shut down.");
        });
      }

      // Gracefully disconnect from MongoDB
      await this.mongoDBConnection.disconnect();

      console.log("Server and services shut down.");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1); // Exit with error code if shutdown fails
    }
  }
}
