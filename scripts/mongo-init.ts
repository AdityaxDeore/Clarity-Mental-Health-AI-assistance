#!/usr/bin/env node

/**
 * MongoDB Database Initialization & Migration Script
 * Run this script to set up or reset your MongoDB Atlas database
 * 
 * Usage:
 *   npx ts-node scripts/mongo-init.ts          # Initialize collections
 *   npx ts-node scripts/mongo-init.ts --seed   # Initialize + add sample data
 *   npx ts-node scripts/mongo-init.ts --drop   # Drop all collections (DANGEROUS!)
 */

import "dotenv/config";
import { connectDB, closeDB, getDB } from "../server/db-mongo-updated";
import { 
  initializeCollections, 
  dropAllCollections, 
  verifyDatabaseIntegrity,
  COLLECTIONS 
} from "../server/db-initialize";
import { insertMany } from "../server/db-utilities";

const args = process.argv.slice(2);
const shouldSeed = args.includes("--seed");
const shouldDrop = args.includes("--drop");

async function seedSampleData() {
  console.log("\n[Init] Seeding sample data...");

  // Create sample users
  const sampleUsers = [
    {
      username: "mentor_user",
      email: "mentor@example.com",
      password: "hashedpassword123", // In production, use bcrypt
      role: "mentor",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: "mentee_user",
      email: "mentee@example.com",
      password: "hashedpassword123",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: "admin_user",
      email: "admin@example.com",
      password: "hashedpassword123",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const userIds = await insertMany(COLLECTIONS.USERS, sampleUsers);
  console.log("[Init] ✓ Created 3 sample users");

  // Create sample mood entries
  const sampleMoodEntries = [
    {
      userId: userIds[0],
      moodValue: 4,
      date: new Date(),
      notes: "Feeling positive today!",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId: userIds[1],
      moodValue: 3,
      date: new Date(),
      notes: "Regular day",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await insertMany(COLLECTIONS.MOOD_ENTRIES, sampleMoodEntries);
  console.log("[Init] ✓ Created sample mood entries");

  // Create sample goals
  const sampleGoals = [
    {
      userId: userIds[1],
      title: "Complete Python certification",
      description: "Finish the online Python course and get certified",
      category: "academic",
      progress: 45,
      isCompleted: false,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId: userIds[1],
      title: "Daily meditation",
      description: "Meditate for 10 minutes every day",
      category: "wellness",
      progress: 20,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await insertMany(COLLECTIONS.GOALS, sampleGoals);
  console.log("[Init] ✓ Created sample goals");

  // Create sample mentor
  const mentorData = [
    {
      userId: userIds[0],
      name: "John Mentor",
      year: 3,
      region: "East Campus",
      domains: ["Web Development", "JavaScript", "React"],
      bio: "Passionate mentor helping freshers with tech skills",
      maxMentees: 5,
      currentMentees: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mentorIds = await insertMany(COLLECTIONS.MENTORS, mentorData);
  console.log("[Init] ✓ Created sample mentor");

  // Create sample mentee
  const menteeData = [
    {
      userId: userIds[1],
      name: "Jane Mentee",
      year: 1,
      region: "East Campus",
      interests: ["Web Development", "JavaScript"],
      goals: "Learn full-stack development",
      hasActiveMentor: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const menteeIds = await insertMany(COLLECTIONS.MENTEES, menteeData);
  console.log("[Init] ✓ Created sample mentee");

  // Create sample mentorship
  const mentorshipData = [
    {
      mentorId: mentorIds[0],
      menteeId: menteeIds[0],
      status: "active",
      startDate: new Date(),
      matchScore: 85,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await insertMany(COLLECTIONS.MENTORSHIPS, mentorshipData);
  console.log("[Init] ✓ Created sample mentorship");

  console.log("[Init] ✅ Sample data seeding complete!");
}

async function main() {
  try {
    console.log("🚀 MongoDB Database Initialization");
    console.log("====================================\n");

    await connectDB();

    if (shouldDrop) {
      console.log("⚠️  WARNING: Dropping all collections...");
      const answer = await new Promise<string>((resolve) => {
        process.stdout.write("Type 'DROP' to confirm: ");
        process.stdin.once("data", (data) => {
          resolve(data.toString().trim());
        });
      });

      if (answer === "DROP") {
        await dropAllCollections(getDB());
        console.log("[Init] ✅ All collections dropped\n");
      } else {
        console.log("[Init] Drop cancelled\n");
        await closeDB();
        return;
      }
    }

    // Initialize collections
    await initializeCollections(getDB());

    // Verify initialization
    const isIntegral = await verifyDatabaseIntegrity(getDB());

    if (!isIntegral) {
      throw new Error("Database integrity check failed");
    }

    // Seed sample data if requested
    if (shouldSeed) {
      await seedSampleData();
    }

    console.log("\n✅ Database initialization complete!");
    console.log("[Init] Database is ready to use");
  } catch (error) {
    console.error("\n❌ Database initialization failed!");
    console.error(error);
    process.exit(1);
  } finally {
    await closeDB();
  }
}

main();
