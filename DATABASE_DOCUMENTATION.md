# MongoDB Database Files Documentation

Complete setup for MongoDB Atlas integration with full TypeScript support, collection initialization, validation, and utility functions.

## 📁 New Database Files

### Core Files

#### `db-mongo-updated.ts`
**Main database connection module** - Enhanced version with full initialization support.

Features:
- Automatic collection and index creation
- Connection pooling configuration
- Database integrity verification
- Health check functionality
- Transaction support

```typescript
import { connectDB, getDB, closeDB, healthCheck } from "./db-mongo-updated";

// Connect and initialize database
const db = await connectDB();

// Get current database instance
const db = getDB();

// Health check
const health = await healthCheck();

// Close connection
await closeDB();
```

#### `db-initialize.ts`
**Collection and index initialization** - Sets up all 16 collections with proper schema validation and indexes.

Features:
- Automatic collection creation
- Index setup for performance
- TTL (Time To Live) configuration
- Collection name constants
- Database integrity verification

```typescript
import { initializeCollections, COLLECTIONS, verifyDatabaseIntegrity } from "./db-initialize";

const db = getDB();
await initializeCollections(db);
const isValid = await verifyDatabaseIntegrity(db);
```

**Collections Created:**
1. `users` - User accounts and authentication
2. `moodEntries` - Daily mood tracking
3. `goals` - User goals with progress tracking
4. `mentors` - Mentor profiles
5. `mentees` - Mentee profiles
6. `mentorships` - Mentor-mentee relationships
7. `mentorTasks` - Tasks within mentorships
8. `reactions` - Reactions to content
9. `reactionStreaks` - User engagement streaks
10. `anonymousChatMessages` - Anonymous chat (24h TTL)
11. `communityPosts` - Community forum posts
12. `communityComments` - Post comments
13. `resources` - Mental health resources
14. `crisisSupport` - Crisis support records
15. `adminLogs` - Admin activity (90-day TTL)
16. `userSettings` - User preferences

---

### Schema & Validation Files

#### `schemas/mongodb-types.ts`
**TypeScript interfaces** - Type definitions for all MongoDB documents.

```typescript
import { User, Goal, Mentor, Mentee, MoodEntry } from "./schemas/mongodb-types";

const user: User = {
  username: "john_doe",
  email: "john@example.com",
  password: "hashed_password",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

All interfaces exported:
- `User`
- `MoodEntry`
- `Goal`
- `Mentor`
- `Mentee`
- `Mentorship`
- `MentorTask`
- `Reaction`
- `ReactionStreak`
- `AnonymousChatMessage`
- `CommunityPost`
- `CommunityComment`
- `Resource`
- `CrisisSupport`
- `AdminLog`
- `UserSettings`

#### `schemas/mongodb-validators.ts`
**Zod validation schemas** - Runtime validation for API inputs and database operations.

```typescript
import { 
  userInsertSchema, 
  goalInsertSchema, 
  mentorInsertSchema 
} from "./schemas/mongodb-validators";

// Validate incoming data
const result = userInsertSchema.parse(userData);

// Type-safe with inference
type User = z.infer<typeof userInsertSchema>;
```

Exports for all document types:
- `*InsertSchema` - For creating new documents
- `*UpdateSchema` - For updating documents (all fields optional)

---

### Utility Functions

#### `db-utilities.ts`
**Helper functions** - Common MongoDB operations with type safety.

**Basic CRUD:**
```typescript
import {
  findById,
  insertOne,
  updateById,
  deleteById,
  find,
} from "./db-utilities";

// Create
const userId = await insertOne("users", { username: "john", ... });

// Read
const user = await findById("users", userId);
const users = await find("users", { role: "mentor" });

// Update
await updateById("users", userId, { email: "new@example.com" });

// Delete
await deleteById("users", userId);
```

**Advanced Operations:**
```typescript
// Pagination
const result = await paginate("communityPosts", {}, 1, 20);
// { data: [...], total: 100, page: 1, pages: 5 }

// Count
const count = await count("mentors", { isActive: true });

// Increment fields
await increment("users", userId, "totalReactions");

// Array operations
await addToArray("communityPosts", postId, "tags", "new-tag");
await removeFromArray("communityPosts", postId, "tags", "old-tag");

// Aggregation
const pipeline = [
  { $match: { userId: new ObjectId(userId) } },
  { $group: { _id: "$category", count: { $sum: 1 } } },
];
const results = await aggregate("goals", pipeline);

// Bulk operations
await bulkWrite("users", [
  { updateOne: { filter: { role: "admin" }, update: { $set: { active: true } } } },
  { deleteOne: { filter: { role: "deleted" } } },
]);
```

**Statistics & Validation:**
```typescript
// Collection stats
const stats = await getCollectionStats("users");

// Database stats
const dbStats = await getDatabaseStats();

// ID validation
const isValid = isValidObjectId("507f1f77bcf86cd799439011");
const objectId = toObjectId("507f1f77bcf86cd799439011");

// List all collections
const collections = await getAllCollectionNames();
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd server
npm install
```

Required packages:
- `mongodb` - MongoDB driver (should be in package.json)
- `dotenv` - Environment variables
- `zod` - Schema validation

### 2. Configure MongoDB Atlas

See [MONGODB_SETUP.md](../MONGODB_SETUP.md) for detailed setup instructions.

Quick steps:
1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   MONGODB_DB_NAME=clarity
   ```

### 3. Initialize Database

```bash
# Initialize collections and indexes
npx ts-node ../scripts/mongo-init.ts

# Or with sample data
npx ts-node ../scripts/mongo-init.ts --seed

# Reset database (DANGEROUS!)
npx ts-node ../scripts/mongo-init.ts --drop --seed
```

### 4. Update Your Server Code

In `server/index.ts` or wherever you start your app:

```typescript
import { connectDB, closeDB } from "./db-mongo-updated";

async function startServer() {
  // Connect to database (initializes collections)
  await connectDB();

  // Your Express app setup...
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await closeDB();
    process.exit(0);
  });
}

startServer();
```

---

## 📝 Usage Examples

### Creating Documents

```typescript
import { insertOne } from "./db-utilities";
import { userInsertSchema } from "./schemas/mongodb-validators";

// Validate and create user
const userData = userInsertSchema.parse({
  username: "john_doe",
  password: "hashed_pwd",
  email: "john@example.com",
  role: "user",
});

const userId = await insertOne("users", userData);
```

### Updating Documents

```typescript
import { updateById } from "./db-utilities";
import { userUpdateSchema } from "./schemas/mongodb-validators";

// Validate and update
const updateData = userUpdateSchema.parse({ email: "new@example.com" });
const updated = await updateById("users", userId, updateData);
```

### Complex Queries

#### Get user's achievements
```typescript
const user = await findById("users", userId);
const goals = await find("goals", { userId, isCompleted: true });
const reactions = await count("reactions", { userId });
```

#### Find active mentorships
```typescript
const mentorships = await find("mentorships", { status: "active" }, 0, 50);
```

#### Paginated community posts
```typescript
const page = await paginate(
  "communityPosts",
  { isDraft: false },
  1, // page
  10, // page size
  { createdAt: -1 } // sort
);
```

#### Get mentor statistics
```typescript
const pipeline = [
  { $match: { isActive: true } },
  {
    $group: {
      _id: "$region",
      count: { $sum: 1 },
      avgMentees: { $avg: "$currentMentees" },
    },
  },
  { $sort: { count: -1 } },
];

const stats = await aggregate("mentors", pipeline);
```

### Transactions

```typescript
import { withTransaction } from "./db-mongo-updated";

await withTransaction(async (db) => {
  // Multiple operations atomic
  const mentee = await db.collection("mentees").findOne({ _id: menteeId });
  const mentor = await db.collection("mentors").findOne({ _id: mentorId });
  
  await db.collection("mentorships").insertOne({
    mentorId,
    menteeId,
    status: "active",
    createdAt: new Date(),
  });
});
```

---

## 🔧 Configuration

### Environment Variables

**Required:**
```env
MONGODB_URI=mongodb+srv://username:password@host/dbname
```

**Optional:**
```env
MONGODB_DB_NAME=clarity          # Database name (default: clarity)
```

### Connection Pool Tuning

In `db-mongo-updated.ts`, adjust for your needs:
```typescript
maxPoolSize: 10,      // Max concurrent connections
minPoolSize: 1,       // Min connections to maintain
retryWrites: true,    // Automatic retry on write failure
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```typescript
import { healthCheck } from "./db-mongo-updated";

const health = await healthCheck();
if (health.ok) {
  console.log(`Database healthy: ${health.details.collections} collections`);
}
```

### Collection Stats

```typescript
import { getCollectionStats, getDatabaseStats } from "./db-utilities";

const userStats = await getCollectionStats("users");
const dbStats = await getDatabaseStats();

console.log(`Users: ${userStats.count}`);
console.log(`Total size: ${dbStats.dataSize} bytes`);
```

### Verify Integrity

```typescript
import { verifyDatabaseIntegrity } from "./db-initialize";

const isValid = await verifyDatabaseIntegrity(getDB());
if (!isValid) {
  console.error("Some collections are missing!");
  // Run initialization again
}
```

---

## 🛡️ Data Validation

All database operations support Zod validation:

```typescript
import { goalInsertSchema, goalUpdateSchema } from "./schemas/mongodb-validators";

// Validate inputs
try {
  const valid = goalInsertSchema.parse(incomingData);
  await insertOne("goals", valid);
} catch (err) {
  console.error("Validation failed:", err.errors);
}
```

---

## 🚨 Error Handling

```typescript
import { connectDB } from "./db-mongo-updated";

try {
  await connectDB();
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes("ECONNREFUSED")) {
      console.error("MongoDB not accessible - check connection string");
    } else {
      console.error("Connection error:", error.message);
    }
  }
  process.exit(1);
}
```

---

## 📖 File Structure

```
server/
├── db-mongo-updated.ts          # Main connection module
├── db-mongo.ts                  # Deprecated (redirects to updated)
├── db-initialize.ts             # Collection initialization
├── db-utilities.ts              # Helper functions
├── schemas/
│   ├── mongodb-types.ts         # TypeScript interfaces
│   └── mongodb-validators.ts    # Zod validation schemas
└── index.ts                     # Express app

scripts/
└── mongo-init.ts                # Database initialization script

MONGODB_SETUP.md                 # Complete setup guide
```

---

## ✅ Verification Checklist

After setup:
- [ ] `.env` has correct `MONGODB_URI`
- [ ] `MONGODB_DB_NAME` matches your database name
- [ ] Run `npx ts-node ../scripts/mongo-init.ts` succeeds
- [ ] API `/api/db-health` returns 200 with healthy status
- [ ] All 16 collections appear in Atlas
- [ ] Sample data appears if seeded

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Check IP whitelisting in Atlas Network Access |
| Auth failed | Verify username/password in MONGODB_URI |
| Collections missing | Run `mongo-init.ts` script |
| Wrong database | Check MONGODB_DB_NAME in .env |
| Slow queries | Review indexes created during initialization |
| Out of memory | Increase connection pool limits or page results |

---

## 🔗 Related Files

- [MONGODB_SETUP.md](../MONGODB_SETUP.md) - Detailed MongoDB Atlas setup
- [server/index.ts](../server/index.ts) - Server implementation
- [scripts/mongo-init.ts](../scripts/mongo-init.ts) - Initialization script

---

## 📝 Notes

- All timestamps use UTC (`new Date()`)
- IDs are MongoDB ObjectId (`_id` field)
- Collections have automatic `updatedAt` timestamps
- Indexes are created for common queries
- Anonymous chat expires after 24 hours (TTL)
- Admin logs expire after 90 days (TTL)

---

**Last Updated:** 2024
**Version:** 1.0.0
