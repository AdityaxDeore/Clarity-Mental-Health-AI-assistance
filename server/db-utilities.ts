import { Db, ObjectId, Collection, Filter, UpdateOptions } from "mongodb";
import { getDB } from "./db-mongo-updated";
import { COLLECTIONS } from "./db-initialize";

/**
 * Utility functions for common MongoDB operations
 */

/**
 * Get a collection with type safety
 */
export function getCollection<T extends Record<string, any>>(
  collectionName: string
): Collection<T> {
  const db = getDB();
  return db.collection<T>(collectionName);
}

/**
 * Find by ID
 */
export async function findById<T extends { _id?: ObjectId }>(
  collectionName: string,
  id: string | ObjectId
): Promise<T | null> {
  const collection = getCollection<T>(collectionName);
  const objectId = typeof id === "string" ? new ObjectId(id) : id;
  return collection.findOne({ _id: objectId } as Filter<T>);
}

/**
 * Insert document
 */
export async function insertOne<T extends Record<string, any>>(
  collectionName: string,
  document: Omit<T, "_id">
): Promise<ObjectId> {
  const collection = getCollection<T>(collectionName);
  const result = await collection.insertOne(document as T);
  return result.insertedId;
}

/**
 * Insert multiple documents
 */
export async function insertMany<T extends Record<string, any>>(
  collectionName: string,
  documents: Omit<T, "_id">[]
): Promise<ObjectId[]> {
  const collection = getCollection<T>(collectionName);
  const result = await collection.insertMany(documents as T[]);
  return Object.values(result.insertedIds);
}

/**
 * Update document by ID
 */
export async function updateById<T extends { _id?: ObjectId }>(
  collectionName: string,
  id: string | ObjectId,
  update: Partial<Omit<T, "_id">>,
  options?: UpdateOptions
): Promise<boolean> {
  const collection = getCollection<T>(collectionName);
  const objectId = typeof id === "string" ? new ObjectId(id) : id;

  const result = await collection.updateOne(
    { _id: objectId } as Filter<T>,
    { $set: { ...update, updatedAt: new Date() } },
    options
  );

  return result.modifiedCount > 0;
}

/**
 * Update multiple documents
 */
export async function updateMany<T extends Record<string, any>>(
  collectionName: string,
  filter: Filter<T>,
  update: Partial<Omit<T, "_id">>,
  options?: UpdateOptions
): Promise<number> {
  const collection = getCollection<T>(collectionName);

  const result = await collection.updateMany(
    filter,
    { $set: { ...update, updatedAt: new Date() } },
    options
  );

  return result.modifiedCount;
}

/**
 * Delete document by ID
 */
export async function deleteById<T extends { _id?: ObjectId }>(
  collectionName: string,
  id: string | ObjectId
): Promise<boolean> {
  const collection = getCollection<T>(collectionName);
  const objectId = typeof id === "string" ? new ObjectId(id) : id;

  const result = await collection.deleteOne({ _id: objectId } as Filter<T>);
  return result.deletedCount > 0;
}

/**
 * Delete multiple documents
 */
export async function deleteMany<T extends Record<string, any>>(
  collectionName: string,
  filter: Filter<T>
): Promise<number> {
  const collection = getCollection<T>(collectionName);
  const result = await collection.deleteMany(filter);
  return result.deletedCount;
}

/**
 * Find multiple documents
 */
export async function find<T extends Record<string, any>>(
  collectionName: string,
  filter: Filter<T>,
  skip?: number,
  limit?: number
): Promise<T[]> {
  const collection = getCollection<T>(collectionName);
  let query = collection.find(filter);

  if (skip) query = query.skip(skip);
  if (limit) query = query.limit(limit);

  return query.toArray();
}

/**
 * Count documents
 */
export async function count<T extends Record<string, any>>(
  collectionName: string,
  filter?: Filter<T>
): Promise<number> {
  const collection = getCollection<T>(collectionName);
  return collection.countDocuments(filter || {});
}

/**
 * Check if document exists
 */
export async function exists<T extends Record<string, any>>(
  collectionName: string,
  filter: Filter<T>
): Promise<boolean> {
  const collection = getCollection<T>(collectionName);
  const doc = await collection.findOne(filter);
  return doc !== null;
}

/**
 * Increment a numeric field
 */
export async function increment<T extends Record<string, any>>(
  collectionName: string,
  id: string | ObjectId,
  field: string,
  amount: number = 1
): Promise<boolean> {
  const collection = getCollection<T>(collectionName);
  const objectId = typeof id === "string" ? new ObjectId(id) : id;

  const result = await collection.updateOne(
    { _id: objectId } as Filter<T>,
    { $inc: { [field]: amount }, $set: { updatedAt: new Date() } }
  );

  return result.modifiedCount > 0;
}

/**
 * Add to array field
 */
export async function addToArray<T extends Record<string, any>>(
  collectionName: string,
  id: string | ObjectId,
  field: string,
  value: any
): Promise<boolean> {
  const collection = getCollection<T>(collectionName);
  const objectId = typeof id === "string" ? new ObjectId(id) : id;

  const result = await collection.updateOne(
    { _id: objectId } as Filter<T>,
    { $push: { [field]: value }, $set: { updatedAt: new Date() } }
  );

  return result.modifiedCount > 0;
}

/**
 * Remove from array field
 */
export async function removeFromArray<T extends Record<string, any>>(
  collectionName: string,
  id: string | ObjectId,
  field: string,
  value: any
): Promise<boolean> {
  const collection = getCollection<T>(collectionName);
  const objectId = typeof id === "string" ? new ObjectId(id) : id;

  const result = await collection.updateOne(
    { _id: objectId } as Filter<T>,
    { $pull: { [field]: value }, $set: { updatedAt: new Date() } }
  );

  return result.modifiedCount > 0;
}

/**
 * Get paginated results
 */
export async function paginate<T extends Record<string, any>>(
  collectionName: string,
  filter: Filter<T>,
  page: number = 1,
  pageSize: number = 20,
  sort?: Record<string, 1 | -1>
): Promise<{ data: T[]; total: number; page: number; pages: number }> {
  const collection = getCollection<T>(collectionName);
  const skip = (page - 1) * pageSize;

  const [data, total] = await Promise.all([
    collection
      .find(filter)
      .sort(sort || { createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    data,
    total,
    page,
    pages: Math.ceil(total / pageSize),
  };
}

/**
 * Aggregate pipeline
 */
export async function aggregate<T extends Record<string, any>, R>(
  collectionName: string,
  pipeline: any[]
): Promise<R[]> {
  const collection = getCollection<T>(collectionName);
  return collection.aggregate<R>(pipeline).toArray();
}

/**
 * Bulk write operations
 */
export async function bulkWrite<T extends Record<string, any>>(
  collectionName: string,
  operations: any[]
): Promise<void> {
  const collection = getCollection<T>(collectionName);
  if (operations.length > 0) {
    await collection.bulkWrite(operations);
  }
}

/**
 * Get collection stats
 */
export async function getCollectionStats(collectionName: string): Promise<any> {
  const db = getDB();
  try {
    return await db.collection(collectionName).stats();
  } catch (error) {
    console.error(`Failed to get stats for ${collectionName}:`, error);
    return null;
  }
}

/**
 * Get database stats
 */
export async function getDatabaseStats(): Promise<any> {
  const db = getDB();
  try {
    return await db.stats();
  } catch (error) {
    console.error("Failed to get database stats:", error);
    return null;
  }
}

/**
 * Validate an ObjectId string
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

/**
 * Convert string to ObjectId
 */
export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

/**
 * Get all collection names
 */
export async function getAllCollectionNames(): Promise<string[]> {
  const db = getDB();
  const collections = await db.listCollections().toArray();
  return collections.map((c) => c.name);
}
