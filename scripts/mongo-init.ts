#!/usr/bin/env node

/**
 * MongoDB initialization/reset script for the final ER model.
 *
 * Usage:
 *   npx tsx scripts/mongo-init.ts
 *   npx tsx scripts/mongo-init.ts --seed
 *   npx tsx scripts/mongo-init.ts --drop
 */

import "dotenv/config";
import { connectDB, closeDB, getDB } from "../server/db-mongo-updated";
import {
  initializeCollections,
  dropAllCollections,
  verifyDatabaseIntegrity,
  COLLECTIONS,
} from "../server/db-initialize";
import { insertMany } from "../server/db-utilities";

const args = process.argv.slice(2);
const shouldSeed = args.includes("--seed");
const shouldDrop = args.includes("--drop");

async function seedSampleData() {
  console.log("\n[Init] Seeding ER-model sample data...");

  const now = new Date();

  // USERS
  const userIds = await insertMany(COLLECTIONS.USERS, [
    {
      username: "user_rahul",
      email: "rahul@example.com",
      password: "hashedpassword123",
      firstName: "Rahul",
      lastName: "Sharma",
      role: "user",
      createdAt: now,
      updatedAt: now,
    },
    {
      username: "therapist_aarti",
      email: "aarti@example.com",
      password: "hashedpassword123",
      firstName: "Aarti",
      lastName: "Kulkarni",
      role: "mentor",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // SUPERVISOR
  const supervisorIds = await insertMany(COLLECTIONS.SUPERVISORS, [
    {
      name: "Dr. Priya Menon",
      contact: "+91-9000000001",
      userId: userIds[1],
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // THERAPISTS
  const therapistIds = await insertMany(COLLECTIONS.THERAPISTS, [
    {
      userId: userIds[1],
      supervisorId: supervisorIds[0],
      specialization: "Anxiety & Stress",
      licenseNumber: "LIC-MH-001",
      experienceYears: 7,
      consultationFee: 1200,
      availabilityStatus: "available",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // APPOINTMENTS
  const appointmentIds = await insertMany(COLLECTIONS.APPOINTMENTS, [
    {
      userId: userIds[0],
      therapistId: therapistIds[0],
      schedule: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // PAYMENT_GATEWAY
  const gatewayIds = await insertMany(COLLECTIONS.PAYMENT_GATEWAYS, [
    {
      name: "Razorpay",
      providerCode: "RAZORPAY",
      transactionFee: 2.0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // PAYMENT
  await insertMany(COLLECTIONS.PAYMENTS, [
    {
      appointmentId: appointmentIds[0],
      paymentGatewayId: gatewayIds[0],
      amount: 1200,
      date: now,
      method: "upi",
      currency: "INR",
      status: "paid",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // MOOD_ENTRIES
  await insertMany(COLLECTIONS.MOOD_ENTRIES, [
    {
      userId: userIds[0],
      moodId: 4,
      moodValue: 4,
      notes: "Feeling more stable today.",
      date: now,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // JOURNAL_ENTRIES
  await insertMany(COLLECTIONS.JOURNAL_ENTRIES, [
    {
      userId: userIds[0],
      title: "Daily reflection",
      content: "Today I practiced breathing and felt better.",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // GOALS
  await insertMany(COLLECTIONS.GOALS, [
    {
      userId: userIds[0],
      title: "Sleep by 11 PM",
      status: "in_progress",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // EMERGENCY_CONTACTS
  await insertMany(COLLECTIONS.EMERGENCY_CONTACTS, [
    {
      userId: userIds[0],
      name: "Aman Sharma",
      relationship: "Brother",
      phone: "+91-9000000002",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // RESOURCES
  await insertMany(COLLECTIONS.RESOURCES, [
    {
      title: "5 minute grounding exercise",
      description: "Simple daily grounding practice.",
      type: "article",
      category: "self-help",
      url: "https://example.com/grounding",
      tags: ["anxiety", "breathing"],
      isOfficial: true,
      views: 0,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ASSESSMENTS
  const assessmentIds = await insertMany(COLLECTIONS.ASSESSMENTS, [
    {
      name: "PHQ-9",
      title: "Patient Health Questionnaire",
      category: "depression",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ASSESSMENT_QUESTIONS
  await insertMany(COLLECTIONS.ASSESSMENT_QUESTIONS, [
    {
      assessmentId: assessmentIds[0],
      supervisorId: supervisorIds[0],
      questionText: "Little interest or pleasure in doing things?",
      questionType: "scale",
      order: 1,
      weight: 1,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // USER_ASSESSMENTS
  const userAssessmentIds = await insertMany(COLLECTIONS.USER_ASSESSMENTS, [
    {
      userId: userIds[0],
      assessmentId: assessmentIds[0],
      responses: [],
      totalScore: 6,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // DIAGNOSIS
  const diagnosisIds = await insertMany(COLLECTIONS.DIAGNOSES, [
    {
      code: "DX-ANX-001",
      icdCode: "F41.1",
      name: "Generalized Anxiety Disorder",
      severity: "moderate",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // USER_DIAGNOSES
  await insertMany(COLLECTIONS.USER_DIAGNOSES, [
    {
      userId: userIds[0],
      diagnosisId: diagnosisIds[0],
      sourceUserAssessmentId: userAssessmentIds[0],
      diagnosedByTherapistId: therapistIds[0],
      diagnosedAt: now,
      severity: "moderate",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("[Init] ✅ ER-model sample data seeded");
}

async function main() {
  try {
    console.log("🚀 MongoDB ER-Model Initialization");
    console.log("===================================\n");

    await connectDB({ skipInitialization: shouldDrop });

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

    await initializeCollections(getDB());

    const isIntegral = await verifyDatabaseIntegrity(getDB());
    if (!isIntegral) {
      throw new Error("Database integrity check failed");
    }

    if (shouldSeed) {
      await seedSampleData();
    }

    console.log("\n✅ Database initialization complete!");
    console.log("[Init] Final ER-model database is ready");
  } catch (error) {
    console.error("\n❌ Database initialization failed!");
    console.error(error);
    process.exit(1);
  } finally {
    await closeDB();
  }
}

main();
