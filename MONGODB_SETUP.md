# MongoDB Atlas Setup Guide for Clarity

## Prerequisites

1. **MongoDB Atlas Account** - Create one at https://www.mongodb.com/cloud/atlas
2. **Node.js** - Version 16 or higher
3. **npm** - Comes with Node.js

## Step 1: Create MongoDB Atlas Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a new project (or use existing one)
4. Click "Build a Database"
5. Select **Free Tier** when prompted
6. Choose your cloud provider and region
7. Click "Create Deployment"
8. Wait for cluster to be ready (5-10 minutes)

## Step 2: Configure Network & User

### Network Access
1. In Atlas, go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (for development)
   - For production, use specific IP addresses
4. Confirm

### Database User
1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Create credentials:
   - **Username**: `THE_DEDUCTER` (or your choice)
   - **Password**: Create a strong password (URL-encode special characters)
4. Give **"Cluster Manager"** permissions
5. Click **"Add User"**

## Step 3: Get Connection String

1. In Atlas, go to **Clusters** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Drivers"**
4. Select **"Node.js"** driver
5. Copy the connection string
6. Replace `<password>` with your actual password (URL-encoded)
7. Replace `<username>` with your username

Example:
```
mongodb+srv://THE_DEDUCTER:your_password@clarity.w4xrdiw.mongodb.net/clarity?retryWrites=true&w=majority
```

## Step 4: Update .env File

Edit `backend/.env`:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://THE_DEDUCTER:your_password@clarity.w4xrdiw.mongodb.net/clarity?retryWrites=true&w=majority
MONGODB_DB_NAME=clarity

# Other configurations...
JWT_SECRET=your_secret_key
PORT=5000
```

**Important:**
- If your password has special characters, URL-encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `:` → `%3A`
- Never commit `.env` to version control

## Step 5: Initialize Database Collections

Run the initialization script:

```bash
# From project root
cd server

# Install dependencies if needed
npm install

# Initialize collections
npx ts-node ../scripts/mongo-init.ts

# Or, initialize with sample data
npx ts-node ../scripts/mongo-init.ts --seed
```

Expected output:
```
🚀 MongoDB Database Initialization
====================================

[MongoDB] Connected to Atlas cluster
[MongoDB] Using database: clarity
[MongoDB] Connection ping successful
[MongoDB] Initializing collections and indexes...
[MongoDB] ✓ users collection ready
[MongoDB] ✓ moodEntries collection ready
...
✅ Database initialization complete!
```

## Step 6: Verify Connection

Start your backend server:

```bash
npm start
```

Test the database connection:

```bash
curl http://localhost:5000/api/db-health
```

Expected response:
```json
{
  "database": "mongodb",
  "collections": 16,
  "status": "healthy"
}
```

## Database Schema Overview

The system creates 16 collections automatically:

| Collection | Purpose |
|-----------|---------|
| `users` | User accounts and authentication |
| `moodEntries` | Daily mood tracking |
| `goals` | User goals and progress |
| `mentors` | Mentor profiles |
| `mentees` | Mentee profiles |
| `mentorships` | Mentor-mentee relationships |
| `mentorTasks` | Tasks within mentorships |
| `reactions` | Reactions to posts/comments |
| `reactionStreaks` | User engagement streaks |
| `anonymousChatMessages` | Anonymous chat history |
| `communityPosts` | Community forum posts |
| `communityComments` | Comments on posts |
| `resources` | Mental health resources |
| `crisisSupport` | Crisis support records |
| `adminLogs` | Admin activity logs |
| `userSettings` | User preferences |

## Common Operations

### Clear All Data (Development Only)

```bash
npx ts-node ../scripts/mongo-init.ts --drop --seed
```

### View MongoDB Data

1. In Atlas, go to your cluster
2. Click **"Browse Collections"**
3. Expand and explore your data

### Create Backups

In Atlas:
1. Go to **Backup** (left sidebar)
2. Click **"Back up now"** for on-demand backup
3. Or enable automatic backups

## Troubleshooting

### Connection Failed

1. ✅ Check internet connectivity
2. ✅ Verify credentials in `.env`
3. ✅ Confirm IP is whitelisted in Network Access
4. ✅ Check cluster status (should be "Active")

### Collections Not Created

1. Delete `.env` and recreate it with correct values
2. Run init script again: `npx ts-node ../scripts/mongo-init.ts`

### Permission Errors

1. Go to **Database Access** in Atlas
2. Verify user has "Cluster Manager" privileges
3. Reset password if needed

### Wrong Database

Check `MONGODB_DB_NAME` in `.env`:
- Verify it matches your intended database
- Atlas creates it automatically on first connection

## Security Best Practices

1. **Never commit `.env`** - Add to `.gitignore`
2. **Use strong passwords** - Minimum 20 characters
3. **Limit network access** - Use IP whitelisting in production
4. **Regular backups** - Enable automatic backups in Atlas
5. **Monitor access** - Review Atlas audit logs regularly
6. **Rotate credentials** - Update passwords every 90 days
7. **Use environment variables** - Never hardcode credentials

## Production Setup

For production deployment:

1. **Use specific IP addresses** instead of "Allow from Anywhere"
2. **Enable M10 or higher tier** cluster
3. **Enable encryption at rest** and **in transit**
4. **Set up VPC peering** for internal networks
5. **Enable audit logging** for compliance
6. **Implement rate limiting** on API endpoints
7. **Use connection pooling** in your application

## Additional Resources

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- MongoDB Node.js Driver: https://www.mongodb.com/docs/drivers/node
- Connection String Reference: https://www.mongodb.com/docs/manual/reference/connection-string

## Support

For issues:
1. Check MongoDB Atlas status page
2. Review error logs in Atlas
3. Check server logs: `npm run logs` or `pm2 logs`
4. Review this guide carefully
5. Contact support if needed
