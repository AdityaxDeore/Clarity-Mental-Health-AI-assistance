import { MongoClient, Db, ServerApiVersion } from "mongodb";
import { initializeCollections, verifyDatabaseIntegrity } from "./db-initialize";

let client: MongoClient | null = null;
let db: Db | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Connect to MongoDB Atlas with full initialization
 */
export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = requiredEnv("MONGODB_URI");
  const dbName = process.env.MONGODB_DB_NAME || "clarity";

  try {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    console.log("[MongoDB] Connected to Atlas cluster");

    // Select database
    db = client.db(dbName);
    console.log(`[MongoDB] Using database: ${dbName}`);

    // Test the connection
    await client.db("admin").command({ ping: 1 });
    console.log("[MongoDB] Connection ping successful");

    // Initialize collections and indexes
    await initializeCollections(db);

    // Verify database integrity
    await verifyDatabaseIntegrity(db);

    return db;
  } catch (error) {
    console.error("[MongoDB] Connection failed:", error);
    throw error;
  }
}

/**
 * Get database instance (throws if not connected)
 */
export function getDB(): Db {
  if (!db) {
    throw new Error("MongoDB not initialized. Call connectDB() first.");
  }
  return db;
}

/**
 * Get MongoDB client instance
 */
export function getClient(): MongoClient {
  if (!client) {
    throw new Error("MongoDB client not initialized. Call connectDB() first.");
  }
  return client;
}

/**
 * Close database connection gracefully
 */
export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("[MongoDB] Connection closed");
  }
}

/**
 * Session management for transactions
 */
export async function withTransaction<T>(
  callback: (db: Db) => Promise<T>
): Promise<T> {
  const session = getClient().startSession();

  try {
    return await session.withTransaction(async () => {
      return await callback(getDB());
    });
  } finally {
    await session.endSession();
  }
}

/**
 * Health check function
 */
export async function healthCheck(): Promise<{ ok: boolean; details: any }> {
  try {
    const database = getDB();
    await database.admin().ping();

    // Get collection stats
    const collections = await database.listCollections().toArray();

    return {
      ok: true,
      details: {
        database: "mongodb",
        collections: collections.length,
        status: "healthy",
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database check failed";
    return {
      ok: false,
      details: {
        database: "mongodb",
        status: "unhealthy",
        error: message,
      },
    };
  }
}
