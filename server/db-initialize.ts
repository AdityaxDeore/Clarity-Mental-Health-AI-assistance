import { Db, Collection } from "mongodb";

/**
 * Initialize MongoDB collections with validation rules and indexes
 */
export async function initializeCollections(db: Db): Promise<void> {
  try {
    console.log("[MongoDB] Initializing collections and indexes...");

    // 1. Users Collection
    await ensureCollection(db, "users");
    const usersCollection = db.collection("users");
    await dropIndexIfExists(usersCollection, "email_1");
    await usersCollection.createIndexes([
      { key: { username: 1 }, unique: true },
      { key: { email: 1 }, unique: true, sparse: true },
      { key: { firstName: 1, lastName: 1 } },
      { key: { role: 1 } },
      { key: { createdAt: 1 } },
    ]);
    console.log("[MongoDB] ✓ users collection ready");

    // 2. Therapists Collection
    await ensureCollection(db, "therapists");
    await db.collection("therapists").createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { supervisorId: 1 } },
      { key: { specialization: 1 } },
      { key: { availabilityStatus: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ therapists collection ready");

    // 3. Supervisors Collection
    await ensureCollection(db, "supervisors");
    await db.collection("supervisors").createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { department: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ supervisors collection ready");

    // 4. Appointments Collection
    await ensureCollection(db, "appointments");
    await db.collection("appointments").createIndexes([
      { key: { userId: 1, schedule: -1 } },
      { key: { therapistId: 1, schedule: -1 } },
      { key: { userId: 1, scheduledAt: -1 } },
      { key: { therapistId: 1, scheduledAt: -1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ appointments collection ready");

    // 5. Payment Gateways Collection
    await ensureCollection(db, "paymentGateways");
    await db.collection("paymentGateways").createIndexes([
      { key: { providerCode: 1 }, unique: true },
      { key: { transactionFee: 1 } },
      { key: { isActive: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ paymentGateways collection ready");

    // 6. Payments Collection
    await ensureCollection(db, "payments");
    await db.collection("payments").createIndexes([
      { key: { appointmentId: 1 }, unique: true },
      { key: { paymentGatewayId: 1 } },
      { key: { method: 1, date: -1 } },
      { key: { status: 1 } },
      { key: { paidAt: -1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ payments collection ready");

    // 7. Mood Entries Collection
    await ensureCollection(db, "moodEntries");
    await db.collection("moodEntries").createIndexes([
      { key: { userId: 1, date: -1 } },
      { key: { date: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ moodEntries collection ready");

    // 8. Journal Entries Collection
    await ensureCollection(db, "journalEntries");
    await db.collection("journalEntries").createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      { key: { moodTag: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ journalEntries collection ready");

    // 9. Goals Collection
    await ensureCollection(db, "goals");
    await db.collection("goals").createIndexes([
      { key: { userId: 1, isCompleted: 1 } },
      { key: { userId: 1, category: 1 } },
      { key: { targetDate: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ goals collection ready");

    // 10. Emergency Contacts Collection
    await ensureCollection(db, "emergencyContacts");
    await db.collection("emergencyContacts").createIndexes([
      { key: { userId: 1, isPrimary: -1 } },
      { key: { phone: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ emergencyContacts collection ready");

    // 11. Assessments Collection
    await ensureCollection(db, "assessments");
    await db.collection("assessments").createIndexes([
      { key: { category: 1, isActive: 1 } },
      { key: { createdByTherapistId: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ assessments collection ready");

    // 12. Assessment Questions Collection
    await ensureCollection(db, "assessmentQuestions");
    await db.collection("assessmentQuestions").createIndexes([
      { key: { assessmentId: 1, order: 1 }, unique: true },
      { key: { assessmentId: 1 } },
      { key: { supervisorId: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ assessmentQuestions collection ready");

    // 13. User Assessments Collection
    await ensureCollection(db, "userAssessments");
    await db.collection("userAssessments").createIndexes([
      { key: { userId: 1, assessmentId: 1, submittedAt: -1 } },
      { key: { userId: 1, submittedAt: -1 } },
      { key: { assessmentId: 1, submittedAt: -1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ userAssessments collection ready");

    // 14. Diagnoses Collection
    await ensureCollection(db, "diagnoses");
    await db.collection("diagnoses").createIndexes([
      { key: { code: 1 }, unique: true },
      { key: { icdCode: 1 }, unique: true },
      { key: { name: 1 } },
      { key: { severity: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ diagnoses collection ready");

    // 15. User Diagnoses Collection
    await ensureCollection(db, "userDiagnoses");
    await db.collection("userDiagnoses").createIndexes([
      { key: { userId: 1, diagnosedAt: -1 } },
      { key: { diagnosisId: 1, diagnosedAt: -1 } },
      { key: { sourceUserAssessmentId: 1 } },
      { key: { diagnosedByTherapistId: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ userDiagnoses collection ready");

    // 16. Mentors Collection
    await ensureCollection(db, "mentors");
    await db.collection("mentors").createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { region: 1 } },
      { key: { isActive: 1, currentMentees: 1 } },
      { key: { domains: 1 } },
      { key: { rating: -1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ mentors collection ready");

    // 17. Mentees Collection
    await ensureCollection(db, "mentees");
    await db.collection("mentees").createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { region: 1 } },
      { key: { hasActiveMentor: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ mentees collection ready");

    // 18. Mentorships Collection
    await ensureCollection(db, "mentorships");
    await db.collection("mentorships").createIndexes([
      { key: { mentorId: 1, menteeId: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { mentorId: 1, status: 1 } },
      { key: { menteeId: 1, status: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ mentorships collection ready");

    // 19. Mentor Tasks Collection
    await ensureCollection(db, "mentorTasks");
    await db.collection("mentorTasks").createIndexes([
      { key: { mentorshipId: 1, status: 1 } },
      { key: { dueDate: 1 } },
      { key: { priority: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ mentorTasks collection ready");

    // 20. Reactions Collection
    await ensureCollection(db, "reactions");
    await db.collection("reactions").createIndexes([
      { key: { userId: 1, targetType: 1 } },
      { key: { targetType: 1, targetId: 1 } },
      { key: { userId: 1, targetType: 1, targetId: 1, type: 1 }, unique: true },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ reactions collection ready");

    // 21. Reaction Streaks Collection
    await ensureCollection(db, "reactionStreaks");
    await db.collection("reactionStreaks").createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { currentStreak: -1 } },
      { key: { longestStreak: -1 } },
      { key: { updatedAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ reactionStreaks collection ready");

    // 22. Anonymous Chat Messages Collection
    await ensureCollection(db, "anonymousChatMessages");
    await db.collection("anonymousChatMessages").createIndexes([
      { key: { chatId: 1, createdAt: -1 } },
      { key: { userId: 1 } },
      { key: { createdAt: 1 }, expireAfterSeconds: 86400 }, // 24-hour TTL
    ]);
    console.log("[MongoDB] ✓ anonymousChatMessages collection ready");

    // 23. Community Posts Collection
    await ensureCollection(db, "communityPosts");
    await db.collection("communityPosts").createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      { key: { category: 1, createdAt: -1 } },
      { key: { tags: 1 } },
      { key: { isDraft: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ communityPosts collection ready");

    // 24. Community Comments Collection
    await ensureCollection(db, "communityComments");
    await db.collection("communityComments").createIndexes([
      { key: { postId: 1, createdAt: -1 } },
      { key: { userId: 1, createdAt: -1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ communityComments collection ready");

    // 25. Resources Collection
    await ensureCollection(db, "resources");
    await db.collection("resources").createIndexes([
      { key: { type: 1 } },
      { key: { category: 1 } },
      { key: { tags: 1 } },
      { key: { views: -1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ resources collection ready");

    // 26. Therapist Resources Collection (many-to-many)
    await ensureCollection(db, "therapistResources");
    await db.collection("therapistResources").createIndexes([
      { key: { therapistId: 1, resourceId: 1 }, unique: true },
      { key: { therapistId: 1, recommendedAt: -1 } },
      { key: { resourceId: 1, recommendedAt: -1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ therapistResources collection ready");

    // 27. Crisis Support Collection
    await ensureCollection(db, "crisisSupport");
    await db.collection("crisisSupport").createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      { key: { status: 1 } },
      { key: { severity: 1 } },
      { key: { createdAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ crisisSupport collection ready");

    // 28. Admin Logs Collection
    await ensureCollection(db, "adminLogs");
    await db.collection("adminLogs").createIndexes([
      { key: { adminId: 1, createdAt: -1 } },
      { key: { action: 1 } },
      { key: { targetType: 1, targetId: 1 } },
      { key: { createdAt: 1 }, expireAfterSeconds: 7776000 }, // 90-day TTL
    ]);
    console.log("[MongoDB] ✓ adminLogs collection ready");

    // 29. User Settings Collection
    await ensureCollection(db, "userSettings");
    await db.collection("userSettings").createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { updatedAt: -1 } },
    ]);
    console.log("[MongoDB] ✓ userSettings collection ready");

    console.log("[MongoDB] ✅ All collections initialized successfully!");
  } catch (error) {
    console.error("[MongoDB] Collection initialization error:", error);
    throw error;
  }
}

/**
 * Helper function to ensure a collection exists
 */
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

/**
 * Get collection names for validation
 */
export const COLLECTIONS = {
  USERS: "users",
  THERAPISTS: "therapists",
  SUPERVISORS: "supervisors",
  APPOINTMENTS: "appointments",
  PAYMENTS: "payments",
  PAYMENT_GATEWAYS: "paymentGateways",
  MOOD_ENTRIES: "moodEntries",
  JOURNAL_ENTRIES: "journalEntries",
  GOALS: "goals",
  EMERGENCY_CONTACTS: "emergencyContacts",
  ASSESSMENTS: "assessments",
  ASSESSMENT_QUESTIONS: "assessmentQuestions",
  USER_ASSESSMENTS: "userAssessments",
  DIAGNOSES: "diagnoses",
  USER_DIAGNOSES: "userDiagnoses",
  MENTORS: "mentors",
  MENTEES: "mentees",
  MENTORSHIPS: "mentorships",
  MENTOR_TASKS: "mentorTasks",
  REACTIONS: "reactions",
  REACTION_STREAKS: "reactionStreaks",
  ANONYMOUS_CHAT: "anonymousChatMessages",
  COMMUNITY_POSTS: "communityPosts",
  COMMUNITY_COMMENTS: "communityComments",
  RESOURCES: "resources",
  THERAPIST_RESOURCES: "therapistResources",
  CRISIS_SUPPORT: "crisisSupport",
  ADMIN_LOGS: "adminLogs",
  USER_SETTINGS: "userSettings",
} as const;

/**
 * Drop all collections (for development/testing only)
 */
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

/**
 * Verify database integrity
 */
export async function verifyDatabaseIntegrity(db: Db): Promise<boolean> {
  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    const requiredCollections = Object.values(COLLECTIONS);

    const missing = requiredCollections.filter(
      (collection) => !collectionNames.includes(collection)
    );

    if (missing.length > 0) {
      console.warn(
        "[MongoDB] Missing collections:",
        missing.join(", ")
      );
      return false;
    }

    console.log("[MongoDB] ✅ Database integrity verified");
    return true;
  } catch (error) {
    console.error("[MongoDB] Integrity check failed:", error);
    return false;
  }
}
