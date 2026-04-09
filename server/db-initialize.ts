import { Collection, Db } from "mongodb";

/**
 * Initialize MongoDB collections and indexes for the final ER model only.
 */
export async function initializeCollections(db: Db): Promise<void> {
  try {
    console.log("[MongoDB] Initializing ER-model collections and indexes...");

    // 1. USERS
    await ensureCollection(db, "users");
    const usersCollection = db.collection("users");
    await dropIndexIfExists(usersCollection, "email_1");
    await dropIndexIfExists(usersCollection, "username_1");
    await usersCollection.createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { email: 1 }, unique: true },
      { key: { firstName: 1, lastName: 1 } },
    ]);
    console.log("[MongoDB] ✓ users collection ready");

    // 2. THERAPISTS
    await ensureCollection(db, "therapists");
    await db.collection("therapists").createIndexes([
      { key: { therapistId: 1 }, unique: true },
      { key: { userId: 1 }, unique: true },
      { key: { supervisorId: 1 } },
      { key: { specialization: 1 } },
      { key: { licenseNo: 1 }, unique: true },
    ]);
    console.log("[MongoDB] ✓ therapists collection ready");

    // 3. APPOINTMENTS
    await ensureCollection(db, "appointments");
    await db.collection("appointments").createIndexes([
      { key: { apptId: 1 }, unique: true },
      { key: { userId: 1, schedule: -1 } },
      { key: { therapistId: 1, schedule: -1 } },
    ]);
    console.log("[MongoDB] ✓ appointments collection ready");

    // 4. PAYMENT
    await ensureCollection(db, "payments");
    await db.collection("payments").createIndexes([
      { key: { paymentId: 1 }, unique: true },
      { key: { apptId: 1 }, unique: true },
      { key: { therapistId: 1 } },
      { key: { gatewayId: 1 } },
      { key: { date: -1 } },
      { key: { method: 1 } },
    ]);
    console.log("[MongoDB] ✓ payments collection ready");

    // 5. PAYMENT_GATEWAY
    await ensureCollection(db, "paymentGateways");
    await db.collection("paymentGateways").createIndexes([
      { key: { gatewayId: 1 }, unique: true },
      { key: { name: 1 }, unique: true },
      { key: { transactionFee: 1 } },
    ]);
    console.log("[MongoDB] ✓ paymentGateways collection ready");

    // 6. MOOD_ENTRIES
    await ensureCollection(db, "moodEntries");
    await db.collection("moodEntries").createIndexes([
      { key: { entryId: 1 }, unique: true },
      { key: { userId: 1, date: -1 } },
      { key: { moodLv: 1 } },
    ]);
    console.log("[MongoDB] ✓ moodEntries collection ready");

    // 7. JOURNAL_ENTRIES
    await ensureCollection(db, "journalEntries");
    await db.collection("journalEntries").createIndexes([
      { key: { journalId: 1 }, unique: true },
      { key: { userId: 1 } },
    ]);
    console.log("[MongoDB] ✓ journalEntries collection ready");

    // 8. GOALS
    await ensureCollection(db, "goals");
    await db.collection("goals").createIndexes([
      { key: { goalId: 1 }, unique: true },
      { key: { userId: 1, status: 1 } },
    ]);
    console.log("[MongoDB] ✓ goals collection ready");

    // 9. EMERGENCY_CONTACTS
    await ensureCollection(db, "emergencyContacts");
    await db.collection("emergencyContacts").createIndexes([
      { key: { contactId: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { phone: 1 } },
    ]);
    console.log("[MongoDB] ✓ emergencyContacts collection ready");

    // 10. RESOURCES
    await ensureCollection(db, "resources");
    await db.collection("resources").createIndexes([
      { key: { resourceId: 1 }, unique: true },
      { key: { therapistId: 1 } },
      { key: { type: 1 } },
      { key: { title: 1 } },
    ]);
    console.log("[MongoDB] ✓ resources collection ready");

    // 11. ASSESSMENTS
    await ensureCollection(db, "assessments");
    await db.collection("assessments").createIndexes([
      { key: { assessmentId: 1 }, unique: true },
      { key: { name: 1 } },
      { key: { category: 1 } },
    ]);
    console.log("[MongoDB] ✓ assessments collection ready");

    // 12. ASSESSMENT_QUESTIONS
    await ensureCollection(db, "assessmentQuestions");
    await db.collection("assessmentQuestions").createIndexes([
      { key: { questionId: 1 }, unique: true },
      { key: { assessmentId: 1 } },
      { key: { supervisorId: 1 } },
    ]);
    console.log("[MongoDB] ✓ assessmentQuestions collection ready");

    // 13. USER_ASSESSMENTS
    await ensureCollection(db, "userAssessments");
    await db.collection("userAssessments").createIndexes([
      { key: { userAssessId: 1 }, unique: true },
      { key: { userId: 1, assessId: 1 } },
      { key: { assignedTherapistId: 1 } },
      { key: { assignedSupervisorId: 1 } },
    ]);
    console.log("[MongoDB] ✓ userAssessments collection ready");

    // 14. DIAGNOSIS
    await ensureCollection(db, "diagnoses");
    await db.collection("diagnoses").createIndexes([
      { key: { diagnosisId: 1 }, unique: true },
      { key: { icdCode: 1 }, unique: true },
      { key: { name: 1 } },
    ]);
    console.log("[MongoDB] ✓ diagnoses collection ready");

    // 15. USER_DIAGNOSES
    await ensureCollection(db, "userDiagnoses");
    await db.collection("userDiagnoses").createIndexes([
      { key: { userDiagId: 1 }, unique: true },
      { key: { userId: 1, diagnosisId: 1 }, unique: true },
      { key: { assessId: 1 } },
    ]);
    console.log("[MongoDB] ✓ userDiagnoses collection ready");

    // 16. SUPERVISOR
    await ensureCollection(db, "supervisors");
    await db.collection("supervisors").createIndexes([
      { key: { supervisorId: 1 }, unique: true },
      { key: { name: 1 } },
    ]);
    console.log("[MongoDB] ✓ supervisors collection ready");

    console.log("[MongoDB] ✅ ER-model collections initialized successfully!");
  } catch (error) {
    console.error("[MongoDB] Collection initialization error:", error);
    throw error;
  }
}

async function ensureCollection(db: Db, collectionName: string): Promise<void> {
  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName);
  }
}

async function dropIndexIfExists(collection: Collection, indexName: string): Promise<void> {
  const indexes = await collection.indexes();
  const exists = indexes.some((index) => index.name === indexName);
  if (exists) {
    await collection.dropIndex(indexName);
    console.log(`[MongoDB] Dropped conflicting index: ${collection.collectionName}.${indexName}`);
  }
}

export const COLLECTIONS = {
  USERS: "users",
  THERAPISTS: "therapists",
  APPOINTMENTS: "appointments",
  PAYMENTS: "payments",
  PAYMENT_GATEWAYS: "paymentGateways",
  MOOD_ENTRIES: "moodEntries",
  JOURNAL_ENTRIES: "journalEntries",
  GOALS: "goals",
  EMERGENCY_CONTACTS: "emergencyContacts",
  RESOURCES: "resources",
  ASSESSMENTS: "assessments",
  ASSESSMENT_QUESTIONS: "assessmentQuestions",
  USER_ASSESSMENTS: "userAssessments",
  DIAGNOSES: "diagnoses",
  USER_DIAGNOSES: "userDiagnoses",
  SUPERVISORS: "supervisors",
} as const;

export async function dropAllCollections(db: Db): Promise<void> {
  try {
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`[MongoDB] Dropped collection: ${collection.name}`);
    }
    console.log("[MongoDB] All collections dropped");
  } catch (error) {
    console.error("[MongoDB] Error dropping collections:", error);
  }
}

export async function verifyDatabaseIntegrity(db: Db): Promise<boolean> {
  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    const requiredCollections = Object.values(COLLECTIONS);

    const missing = requiredCollections.filter(
      (collection) => !collectionNames.includes(collection)
    );

    if (missing.length > 0) {
      console.warn("[MongoDB] Missing collections:", missing.join(", "));
      return false;
    }

    console.log("[MongoDB] ✅ Database integrity verified");
    return true;
  } catch (error) {
    console.error("[MongoDB] Integrity check failed:", error);
    return false;
  }
}
