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

  const scheduleDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  const userId = "USR-001";
  const therapistUserId = "USR-002";
  const therapistId = "THR-001";
  const supervisorId = "SUP-001";
  const apptId = "APT-001";
  const gatewayId = "GTW-001";
  const paymentId = "PAY-001";
  const resourceId = "RES-001";
  const entryId = "ENT-001";
  const journalId = "JRN-001";
  const goalId = "GOL-001";
  const contactId = "EMC-001";
  const diagnosisId = "DGN-001";
  const userDiagId = "UDG-001";
  const assessmentId = "ASM-001";
  const questionId = "QST-001";
  const userAssessId = "UAS-001";

  // USERS
  await insertMany(COLLECTIONS.USERS, [
    {
      userId,
      email: "rahul@example.com",
      password: "hashed_password_user",
      firstName: "Rahul",
      lastName: "Sharma",
    },
    {
      userId: therapistUserId,
      email: "aarti@example.com",
      password: "hashed_password_therapist",
      firstName: "Aarti",
      lastName: "Kulkarni",
    },
  ]);

  // SUPERVISOR
  await insertMany(COLLECTIONS.SUPERVISORS, [
    {
      supervisorId,
      name: "Dr. Priya Menon",
      contact: "+91-9000000001",
    },
  ]);

  // THERAPISTS
  await insertMany(COLLECTIONS.THERAPISTS, [
    {
      therapistId,
      userId: therapistUserId,
      supervisorId,
      licenseNo: "LIC-MH-001",
      specialization: "Anxiety",
    },
  ]);

  // APPOINTMENTS
  await insertMany(COLLECTIONS.APPOINTMENTS, [
    {
      apptId,
      userId,
      therapistId,
      schedule: scheduleDate,
    },
  ]);

  // PAYMENT_GATEWAY
  await insertMany(COLLECTIONS.PAYMENT_GATEWAYS, [
    {
      gatewayId,
      name: "Razorpay",
      transactionFee: 2.0,
    },
  ]);

  // PAYMENT
  await insertMany(COLLECTIONS.PAYMENTS, [
    {
      paymentId,
      apptId,
      therapistId,
      gatewayId,
      amount: 1200,
      date: new Date(),
      method: "upi",
    },
  ]);

  // RESOURCES
  await insertMany(COLLECTIONS.RESOURCES, [
    {
      resourceId,
      therapistId,
      title: "5 minute grounding exercise",
      description: "Simple daily grounding practice",
      type: "article",
    },
  ]);

  // MOOD_ENTRIES
  await insertMany(COLLECTIONS.MOOD_ENTRIES, [
    {
      entryId,
      userId,
      moodLv: 4,
      notes: "Feeling better today",
      date: new Date(),
    },
  ]);

  // JOURNAL_ENTRIES
  await insertMany(COLLECTIONS.JOURNAL_ENTRIES, [
    {
      journalId,
      userId,
      title: "Daily reflection",
      content: "Practiced breathing and mindfulness.",
    },
  ]);

  // GOALS
  await insertMany(COLLECTIONS.GOALS, [
    {
      goalId,
      userId,
      title: "Sleep by 11 PM",
      status: "in_progress",
    },
  ]);

  // EMERGENCY_CONTACTS
  await insertMany(COLLECTIONS.EMERGENCY_CONTACTS, [
    {
      contactId,
      userId,
      name: "Aman Sharma",
      phone: "+91-9000000002",
    },
  ]);

  // DIAGNOSIS
  await insertMany(COLLECTIONS.DIAGNOSES, [
    {
      diagnosisId,
      name: "Generalized Anxiety Disorder",
      icdCode: "F41.1",
    },
  ]);

  // ASSESSMENTS
  await insertMany(COLLECTIONS.ASSESSMENTS, [
    {
      assessmentId,
      name: "PHQ-9",
      category: "depression",
    },
  ]);

  // ASSESSMENT_QUESTIONS
  await insertMany(COLLECTIONS.ASSESSMENT_QUESTIONS, [
    {
      questionId,
      assessmentId,
      questionText: "Little interest or pleasure in doing things?",
      supervisorId,
    },
  ]);

  // USER_ASSESSMENTS
  await insertMany(COLLECTIONS.USER_ASSESSMENTS, [
    {
      userAssessId,
      userId,
      assessId: assessmentId,
      assignedTherapistId: therapistId,
      assignedSupervisorId: supervisorId,
      totalScore: 6,
    },
  ]);

  // USER_DIAGNOSES
  await insertMany(COLLECTIONS.USER_DIAGNOSES, [
    {
      userDiagId,
      userId,
      diagnosisId,
      assessId: assessmentId,
      severity: "moderate",
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
