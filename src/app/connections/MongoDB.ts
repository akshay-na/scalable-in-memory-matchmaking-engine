import mongoose from "mongoose";

export class MongoDBConnection {
  private static instance: MongoDBConnection;

  private constructor() {}

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  public async connect(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri, {
        minPoolSize: 5,
        waitQueueTimeoutMS: 10_000,
        socketTimeoutMS: 30_000,
        serverSelectionTimeoutMS: 5_000,
        family: 4,
        autoIndex: process.env.NODE_ENV !== "production",
        dbName: process.env.DB_NAME ?? "spark-app",
      });
      console.log("MongoDB connection successful");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw new Error("Could not connect to MongoDB");
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log("MongoDB disconnected");
    } catch (error) {
      console.error("Error disconnecting MongoDB:", error);
    }
  }
}
