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

  const users = [
    { userId: "USR-001", email: "rahul@example.com", password: "hash_user_1", firstName: "Rahul", lastName: "Sharma" },
    { userId: "USR-002", email: "neha@example.com", password: "hash_user_2", firstName: "Neha", lastName: "Patil" },
    { userId: "USR-003", email: "arjun@example.com", password: "hash_user_3", firstName: "Arjun", lastName: "Verma" },
    { userId: "USR-004", email: "sneha@example.com", password: "hash_user_4", firstName: "Sneha", lastName: "Rao" },
    { userId: "USR-005", email: "manav@example.com", password: "hash_user_5", firstName: "Manav", lastName: "Singh" },
    { userId: "USR-006", email: "aarti@example.com", password: "hash_thr_1", firstName: "Aarti", lastName: "Kulkarni" },
    { userId: "USR-007", email: "rohan@example.com", password: "hash_thr_2", firstName: "Rohan", lastName: "Nair" },
    { userId: "USR-008", email: "kiran@example.com", password: "hash_thr_3", firstName: "Kiran", lastName: "Mehta" },
    { userId: "USR-009", email: "pooja@example.com", password: "hash_thr_4", firstName: "Pooja", lastName: "Iyer" },
    { userId: "USR-010", email: "vivek@example.com", password: "hash_thr_5", firstName: "Vivek", lastName: "Joshi" },
  ];

  const supervisors = [
    { supervisorId: "SUP-001", name: "Dr. Priya Menon", contact: "+91-9000000001" },
    { supervisorId: "SUP-002", name: "Dr. Anand Kulkarni", contact: "+91-9000000002" },
    { supervisorId: "SUP-003", name: "Dr. Seema Arora", contact: "+91-9000000003" },
    { supervisorId: "SUP-004", name: "Dr. Tarun Gupta", contact: "+91-9000000004" },
    { supervisorId: "SUP-005", name: "Dr. Nisha Reddy", contact: "+91-9000000005" },
  ];

  const therapists = [
    { therapistId: "THR-001", userId: "USR-006", supervisorId: "SUP-001", licenseNo: "LIC-MH-001", specialization: "Anxiety" },
    { therapistId: "THR-002", userId: "USR-007", supervisorId: "SUP-002", licenseNo: "LIC-MH-002", specialization: "Depression" },
    { therapistId: "THR-003", userId: "USR-008", supervisorId: "SUP-003", licenseNo: "LIC-MH-003", specialization: "Trauma" },
    { therapistId: "THR-004", userId: "USR-009", supervisorId: "SUP-004", licenseNo: "LIC-MH-004", specialization: "Stress" },
    { therapistId: "THR-005", userId: "USR-010", supervisorId: "SUP-005", licenseNo: "LIC-MH-005", specialization: "Sleep Issues" },
  ];

  const gateways = [
    { gatewayId: "GTW-001", name: "Razorpay", transactionFee: 2.0 },
    { gatewayId: "GTW-002", name: "Stripe", transactionFee: 2.4 },
    { gatewayId: "GTW-003", name: "PayU", transactionFee: 1.9 },
    { gatewayId: "GTW-004", name: "PhonePe", transactionFee: 1.8 },
    { gatewayId: "GTW-005", name: "Paytm", transactionFee: 2.1 },
  ];

  const userIds = ["USR-001", "USR-002", "USR-003", "USR-004", "USR-005"];
  const therapistIds = ["THR-001", "THR-002", "THR-003", "THR-004", "THR-005"];

  const appointments = Array.from({ length: 8 }, (_, i) => ({
    apptId: `APT-${String(i + 1).padStart(3, "0")}`,
    userId: userIds[i % userIds.length],
    therapistId: therapistIds[i % therapistIds.length],
    schedule: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
  }));

  const payments = appointments.map((appt, i) => ({
    paymentId: `PAY-${String(i + 1).padStart(3, "0")}`,
    apptId: appt.apptId,
    therapistId: appt.therapistId,
    gatewayId: gateways[i % gateways.length].gatewayId,
    amount: 1000 + i * 150,
    date: new Date(Date.now() - i * 12 * 60 * 60 * 1000),
    method: ["upi", "card", "netbanking", "wallet", "cash"][i % 5],
  }));

  const resources = Array.from({ length: 7 }, (_, i) => ({
    resourceId: `RES-${String(i + 1).padStart(3, "0")}`,
    therapistId: therapistIds[i % therapistIds.length],
    title: `Mental wellness resource ${i + 1}`,
    description: `Helpful guidance content ${i + 1}`,
    type: ["article", "video", "podcast", "worksheet", "guide"][i % 5],
  }));

  const moodEntries = Array.from({ length: 10 }, (_, i) => ({
    entryId: `ENT-${String(i + 1).padStart(3, "0")}`,
    userId: userIds[i % userIds.length],
    moodLv: (i % 5) + 1,
    notes: `Mood entry note ${i + 1}`,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
  }));

  const journalEntries = Array.from({ length: 8 }, (_, i) => ({
    journalId: `JRN-${String(i + 1).padStart(3, "0")}`,
    userId: userIds[i % userIds.length],
    title: `Journal Day ${i + 1}`,
    content: `Reflection content for day ${i + 1}.`,
  }));

  const goals = Array.from({ length: 8 }, (_, i) => ({
    goalId: `GOL-${String(i + 1).padStart(3, "0")}`,
    userId: userIds[i % userIds.length],
    title: `Goal ${i + 1}`,
    status: ["planned", "in_progress", "completed"][i % 3],
  }));

  const emergencyContacts = Array.from({ length: 5 }, (_, i) => ({
    contactId: `EMC-${String(i + 1).padStart(3, "0")}`,
    userId: userIds[i],
    name: `Emergency Contact ${i + 1}`,
    phone: `+91-98888000${i + 1}`,
  }));

  const diagnoses = [
    { diagnosisId: "DGN-001", name: "Generalized Anxiety Disorder", icdCode: "F41.1" },
    { diagnosisId: "DGN-002", name: "Major Depressive Disorder", icdCode: "F32.1" },
    { diagnosisId: "DGN-003", name: "Panic Disorder", icdCode: "F41.0" },
    { diagnosisId: "DGN-004", name: "PTSD", icdCode: "F43.1" },
    { diagnosisId: "DGN-005", name: "Adjustment Disorder", icdCode: "F43.2" },
    { diagnosisId: "DGN-006", name: "Insomnia", icdCode: "F51.0" },
  ];

  const assessments = [
    { assessmentId: "ASM-001", name: "PHQ-9", category: "depression" },
    { assessmentId: "ASM-002", name: "GAD-7", category: "anxiety" },
    { assessmentId: "ASM-003", name: "PSS", category: "stress" },
    { assessmentId: "ASM-004", name: "WHO-5", category: "wellbeing" },
    { assessmentId: "ASM-005", name: "ISI", category: "sleep" },
  ];

  const assessmentQuestions = Array.from({ length: 10 }, (_, i) => ({
    questionId: `QST-${String(i + 1).padStart(3, "0")}`,
    assessmentId: assessments[i % assessments.length].assessmentId,
    supervisorId: supervisors[i % supervisors.length].supervisorId,
    questionText: `Assessment question ${i + 1}?`,
  }));

  const userAssessments = Array.from({ length: 8 }, (_, i) => ({
    userAssessId: `UAS-${String(i + 1).padStart(3, "0")}`,
    userId: userIds[i % userIds.length],
    assessId: assessments[i % assessments.length].assessmentId,
    assignedTherapistId: therapistIds[i % therapistIds.length],
    assignedSupervisorId: supervisors[i % supervisors.length].supervisorId,
    totalScore: 4 + i,
  }));

  const userDiagnoses = Array.from({ length: 6 }, (_, i) => ({
    userDiagId: `UDG-${String(i + 1).padStart(3, "0")}`,
    userId: userIds[i % userIds.length],
    diagnosisId: diagnoses[i].diagnosisId,
    assessId: assessments[i % assessments.length].assessmentId,
    severity: ["mild", "moderate", "severe"][i % 3],
  }));

  await insertMany(COLLECTIONS.USERS, users);
  await insertMany(COLLECTIONS.SUPERVISORS, supervisors);
  await insertMany(COLLECTIONS.THERAPISTS, therapists);
  await insertMany(COLLECTIONS.APPOINTMENTS, appointments);
  await insertMany(COLLECTIONS.PAYMENT_GATEWAYS, gateways);
  await insertMany(COLLECTIONS.PAYMENTS, payments);
  await insertMany(COLLECTIONS.RESOURCES, resources);
  await insertMany(COLLECTIONS.MOOD_ENTRIES, moodEntries);
  await insertMany(COLLECTIONS.JOURNAL_ENTRIES, journalEntries);
  await insertMany(COLLECTIONS.GOALS, goals);
  await insertMany(COLLECTIONS.EMERGENCY_CONTACTS, emergencyContacts);
  await insertMany(COLLECTIONS.DIAGNOSES, diagnoses);
  await insertMany(COLLECTIONS.ASSESSMENTS, assessments);
  await insertMany(COLLECTIONS.ASSESSMENT_QUESTIONS, assessmentQuestions);
  await insertMany(COLLECTIONS.USER_ASSESSMENTS, userAssessments);
  await insertMany(COLLECTIONS.USER_DIAGNOSES, userDiagnoses);

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
