# Quick Reference: MongoDB Database Operations

## Imports

```typescript
import { connectDB, getDB, closeDB, healthCheck, withTransaction } from "./db-mongo-updated";
import { COLLECTIONS, initializeCollections, verifyDatabaseIntegrity } from "./db-initialize";
import {
  findById, insertOne, insertMany, updateById, deleteById,
  find, count, exists, paginate, aggregate, bulkWrite,
  increment, addToArray, removeFromArray,
  getCollectionStats, getDatabaseStats
} from "./db-utilities";
import { objectIdSchema, toObjectId, isValidObjectId } from "./db-utilities";
```

## Common Operations

### Database Connection

```typescript
// Initialize database
const db = await connectDB();

// Get current instance
const db = getDB();

// Close connection
await closeDB();

// Check health
const health = await healthCheck();
```

### Create (Insert)

```typescript
// Single document
const id = await insertOne("users", {
  username: "john",
  password: "hashed",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Multiple documents
const ids = await insertMany("goals", [
  { userId: id, title: "Goal 1", ... },
  { userId: id, title: "Goal 2", ... },
]);
```

### Read (Find)

```typescript
// By ID
const user = await findById("users", userId);

// Single match
const user = await find("users", { username: "john" })[0];

// Multiple matches
const mentors = await find("mentors", { isActive: true });

// With pagination
const { data, total, page, pages } = await paginate(
  "communityPosts",
  {},
  1, // page
  20 // size
);

// Count
const total = await count("goals", { isCompleted: true });

// Check existence
const exists = await exists("users", { email: "john@example.com" });
```

### Update

```typescript
// By ID (auto-sets updatedAt)
await updateById("users", userId, { email: "new@example.com" });

// Multiple documents
await updateMany("mentors", { isActive: false }, { currentMentees: 0 });

// Increment field
await increment("users", userId, "totalReactions", 1);

// Add to array
await addToArray("posts", postId, "tags", "new-tag");

// Remove from array
await removeFromArray("posts", postId, "tags", "old-tag");
```

### Delete

```typescript
// By ID
await deleteById("users", userId);

// Multiple
await deleteMany("mentorTasks", { status: "completed" });
```

### Query & Filter Examples

```typescript
// Collection names
const coll = COLLECTIONS.USERS;
const coll = COLLECTIONS.MOOD_ENTRIES;
const coll = COLLECTIONS.GOALS;
const coll = COLLECTIONS.MENTORS;
const coll = COLLECTIONS.MENTEES;
const coll = COLLECTIONS.MENTORSHIPS;
const coll = COLLECTIONS.MENTOR_TASKS;
const coll = COLLECTIONS.REACTIONS;
const coll = COLLECTIONS.COMMUNITY_POSTS;
const coll = COLLECTIONS.CRISIS_SUPPORT;

// Filters
{ username: "john" } // equals
{ role: { $in: ["mentor", "admin"] } } // in
{ ratings: { $gte: 3.5 } } // greater than or equal
{ createdAt: { $gt: new Date("2024-01-01") } } // after date
{ isActive: true, role: "mentor" } // AND conditions
{ $or: [{ role: "admin" }, { isActive: false }] } // OR

// Sorting
{ createdAt: -1 } // descending (newest first)
{ createdAt: 1 } // ascending (oldest first)
{ rating: -1, createdAt: -1 } // multiple sort
```

### Aggregation Pipelines

```typescript
// Group and count
const pipeline = [
  { $match: { isCompleted: true } },
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
];
const results = await aggregate("goals", pipeline);

// Complex pipeline
const pipeline = [
  { $match: { userId: new ObjectId(userId) } },
  { $lookup: {
      from: "mentors",
      localField: "mentorId",
      foreignField: "_id",
      as: "mentor"
    }
  },
  { $unwind: "$mentor" },
  { $project: { title: 1, "mentor.name": 1 } },
];
```

### Transactions

```typescript
await withTransaction(async (db) => {
  // All operations atomic
  await updateById("mentee", menteeId, { hasActiveMentor: true });
  await updateById("mentor", mentorId, { currentMentees: 1 });
  await insertOne("mentorships", {
    mentorId, menteeId, status: "active", createdAt: new Date()
  });
});
```

## Type Safety with Zod

```typescript
import { userInsertSchema, goalUpdateSchema } from "./schemas/mongodb-validators";

// Validate on insert
const valid = userInsertSchema.parse(data);
await insertOne("users", valid);

// Validate on update
const valid = goalUpdateSchema.parse(data);
await updateById("goals", id, valid);

// Type inference
type User = z.infer<typeof userInsertSchema>;
type GoalUpdate = z.infer<typeof goalUpdateSchema>;
```

## ID Handling

```typescript
import { ObjectId } from "mongodb";
import { toObjectId, isValidObjectId } from "./db-utilities";

// Convert string to ObjectId
const id = toObjectId("507f1f77bcf86cd799439011");

// Validate ObjectId string
if (isValidObjectId(idString)) {
  const id = new ObjectId(idString);
}

// In queries
const user = await findById("users", "507f1f77bcf86cd799439011");
```

## Error Handling

```typescript
try {
  const user = await findById("users", invalidId);
  if (!user) {
    // Handle not found
  }
} catch (error) {
  if (error instanceof Error) {
    console.error("Database error:", error.message);
  }
}
```

## Batch Operations

```typescript
// Bulk write
await bulkWrite("users", [
  { updateOne: {
      filter: { role: "user" },
      update: { $set: { isVerified: true } }
    }
  },
  { deleteOne: { filter: { role: "deleted" } } },
]);

// Insert many
const ids = await insertMany("goals", goals);

// Update many
await updateMany("reactions", { type: "like" }, { type: "heart" });

// Delete many
await deleteMany("mentorTasks", { status: "cancelled" });
```

## Collection Constants

```typescript
// Use these for collection names
import { COLLECTIONS } from "./db-initialize";

COLLECTIONS.USERS
COLLECTIONS.MOOD_ENTRIES
COLLECTIONS.GOALS
COLLECTIONS.MENTORS
COLLECTIONS.MENTEES
COLLECTIONS.MENTORSHIPS
COLLECTIONS.MENTOR_TASKS
COLLECTIONS.REACTIONS
COLLECTIONS.REACTION_STREAKS
COLLECTIONS.ANONYMOUS_CHAT
COLLECTIONS.COMMUNITY_POSTS
COLLECTIONS.COMMUNITY_COMMENTS
COLLECTIONS.RESOURCES
COLLECTIONS.CRISIS_SUPPORT
COLLECTIONS.ADMIN_LOGS
COLLECTIONS.USER_SETTINGS
```

## Statistics & Monitoring

```typescript
// Get collection statistics
const stats = await getCollectionStats("users");
console.log(`Total users: ${stats.count}`);
console.log(`Collection size: ${stats.size} bytes`);

// Get database statistics
const dbStats = await getDatabaseStats();
console.log(`Database size: ${dbStats.dataSize} bytes`);

// Verify database
const isValid = await verifyDatabaseIntegrity(getDB());

// List all collections
const collections = await getAllCollectionNames();
```

## API Response Example

```typescript
// Get paginated goals
const result = await paginate("goals", { isCompleted: false }, 1, 10);

// Response structure
{
  data: [
    { _id: ObjectId, title: "Learn React", ... },
    { _id: ObjectId, title: "Daily exercise", ... },
    // ... 8 more
  ],
  total: 42,      // total matching documents
  page: 1,        // current page
  pages: 5        // total pages
}
```

## Performance Tips

1. **Use indexes** - Already created for common queries
2. **Paginate results** - Don't fetch all documents
3. **Project fields** - Use aggregation to select only needed fields
4. **Batch operations** - Use bulkWrite for multiple changes
5. **Connection pooling** - Configured in db-mongo-updated.ts
6. **Transactions** - For multi-document consistency

---

**Quick Links:**
- [Full Documentation](./DATABASE_DOCUMENTATION.md)
- [MongoDB Atlas Setup](./MONGODB_SETUP.md)
- [Database Initialization](./scripts/mongo-init.ts)
