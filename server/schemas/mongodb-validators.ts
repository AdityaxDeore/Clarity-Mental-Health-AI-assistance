import { z } from "zod";
import { ObjectId } from "mongodb";

/**
 * Zod schemas for MongoDB document validation
 * These schemas can be used for runtime validation of API inputs and database operations
 */

// ObjectId validator
export const objectIdSchema = z.custom<ObjectId>(
  (value) => ObjectId.isValid(value),
  { message: "Invalid ObjectId" }
);

// User schemas
export const userInsertSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  role: z.enum(["user", "mentor", "admin"]).default("user"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const userUpdateSchema = userInsertSchema.partial().omit({ password: true });

// Therapist schemas
export const therapistInsertSchema = z.object({
  userId: objectIdSchema,
  supervisorId: objectIdSchema.optional(),
  specialization: z.string().min(1).max(100),
  licenseNumber: z.string().max(100).optional(),
  experienceYears: z.number().int().min(0).max(60),
  consultationFee: z.number().min(0),
  availabilityStatus: z.enum(["available", "busy", "offline"]).default("available"),
  bio: z.string().max(1000).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const therapistUpdateSchema = therapistInsertSchema.partial();

// Supervisor schemas
export const supervisorInsertSchema = z.object({
  userId: objectIdSchema,
  name: z.string().min(1).max(120),
  contact: z.string().min(5).max(120),
  department: z.string().max(100).optional(),
  qualification: z.string().max(200).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const supervisorUpdateSchema = supervisorInsertSchema.partial();

// Appointment schemas
export const appointmentInsertSchema = z.object({
  userId: objectIdSchema,
  therapistId: objectIdSchema,
  schedule: z.date(),
  scheduledAt: z.date(),
  durationMinutes: z.number().int().min(15).max(240).default(60),
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).default("scheduled"),
  notes: z.string().max(2000).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const appointmentUpdateSchema = appointmentInsertSchema.partial();

// Payment gateway schemas
export const paymentGatewayInsertSchema = z.object({
  name: z.string().min(1).max(100),
  providerCode: z.string().min(1).max(100),
  transactionFee: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const paymentGatewayUpdateSchema = paymentGatewayInsertSchema.partial();

// Payment schemas
export const paymentInsertSchema = z.object({
  appointmentId: objectIdSchema,
  paymentGatewayId: objectIdSchema,
  amount: z.number().positive(),
  date: z.date().default(() => new Date()),
  method: z.enum(["card", "upi", "net_banking", "wallet", "cash"]),
  currency: z.string().length(3).default("INR"),
  status: z.enum(["pending", "paid", "failed", "refunded"]).default("pending"),
  transactionReference: z.string().max(200).optional(),
  paidAt: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const paymentUpdateSchema = paymentInsertSchema.partial();

// Mood Entry schemas
export const moodEntryInsertSchema = z.object({
  userId: objectIdSchema,
  moodId: z.number().int().min(1).max(10),
  moodValue: z.number().int().min(1).max(5),
  date: z.date().default(() => new Date()),
  notes: z.string().max(1000).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const moodEntryUpdateSchema = moodEntryInsertSchema.partial();

// Journal Entry schemas
export const journalEntryInsertSchema = z.object({
  userId: objectIdSchema,
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(10000),
  moodTag: z.string().max(50).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const journalEntryUpdateSchema = journalEntryInsertSchema.partial();

// Goal schemas
export const goalInsertSchema = z.object({
  userId: objectIdSchema,
  title: z.string().min(1).max(200),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  description: z.string().max(1000).optional(),
  category: z.enum(["wellness", "academic", "personal", "career"]),
  progress: z.number().int().min(0).max(100).default(0),
  isCompleted: z.boolean().default(false),
  targetDate: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const goalUpdateSchema = goalInsertSchema.partial();

// Emergency Contact schemas
export const emergencyContactInsertSchema = z.object({
  userId: objectIdSchema,
  name: z.string().min(1).max(120),
  relationship: z.string().min(1).max(60),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional(),
  isPrimary: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const emergencyContactUpdateSchema = emergencyContactInsertSchema.partial();

// Assessment schemas
export const assessmentInsertSchema = z.object({
  name: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.string().min(1).max(80),
  createdByTherapistId: objectIdSchema.optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const assessmentUpdateSchema = assessmentInsertSchema.partial();

// Assessment Question schemas
export const assessmentQuestionInsertSchema = z.object({
  assessmentId: objectIdSchema,
  supervisorId: objectIdSchema.optional(),
  questionText: z.string().min(1).max(2000),
  questionType: z.enum(["single_choice", "multi_choice", "scale", "text"]),
  options: z.array(z.string()).max(20).optional(),
  order: z.number().int().min(1),
  weight: z.number().min(0).max(10).default(1),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const assessmentQuestionUpdateSchema = assessmentQuestionInsertSchema.partial();

// User Assessment schemas
export const userAssessmentResponseSchema = z.object({
  questionId: objectIdSchema,
  answer: z.union([z.string(), z.array(z.string()), z.number()]),
  score: z.number().optional(),
});

export const userAssessmentInsertSchema = z.object({
  userId: objectIdSchema,
  assessmentId: objectIdSchema,
  responses: z.array(userAssessmentResponseSchema).default([]),
  totalScore: z.number().default(0),
  submittedAt: z.date().default(() => new Date()),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const userAssessmentUpdateSchema = userAssessmentInsertSchema.partial();

// Diagnosis schemas
export const diagnosisInsertSchema = z.object({
  code: z.string().min(1).max(50),
  icdCode: z.string().min(1).max(50),
  name: z.string().min(1).max(150),
  severity: z.enum(["mild", "moderate", "severe"]),
  description: z.string().max(2000).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const diagnosisUpdateSchema = diagnosisInsertSchema.partial();

// User Diagnosis schemas
export const userDiagnosisInsertSchema = z.object({
  userId: objectIdSchema,
  diagnosisId: objectIdSchema,
  diagnosedByTherapistId: objectIdSchema.optional(),
  sourceUserAssessmentId: objectIdSchema.optional(),
  diagnosedAt: z.date().default(() => new Date()),
  notes: z.string().max(2000).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const userDiagnosisUpdateSchema = userDiagnosisInsertSchema.partial();

// Therapist Resource schemas
export const therapistResourceInsertSchema = z.object({
  therapistId: objectIdSchema,
  resourceId: objectIdSchema,
  recommendedAt: z.date().default(() => new Date()),
  note: z.string().max(500).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const therapistResourceUpdateSchema = therapistResourceInsertSchema.partial();

// Mentor schemas
export const mentorInsertSchema = z.object({
  userId: objectIdSchema,
  name: z.string().min(1).max(100),
  year: z.number().int().min(2).max(4),
  region: z.string().min(1).max(50),
  domains: z.array(z.string()).min(1).max(5),
  bio: z.string().max(500).optional(),
  maxMentees: z.number().int().min(1).default(3),
  currentMentees: z.number().int().default(0),
  isActive: z.boolean().default(true),
  rating: z.number().min(0).max(5).optional(),
  totalMatches: z.number().int().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const mentorUpdateSchema = mentorInsertSchema.partial();

// Mentee schemas
export const menteeInsertSchema = z.object({
  userId: objectIdSchema,
  name: z.string().min(1).max(100),
  year: z.number().int().min(1).max(4),
  region: z.string().min(1).max(50),
  interests: z.array(z.string()).min(1),
  goals: z.string().max(500).optional(),
  hasActiveMentor: z.boolean().default(false),
  mentorId: objectIdSchema.optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const menteeUpdateSchema = menteeInsertSchema.partial();

// Mentorship schemas
export const mentorshipInsertSchema = z.object({
  mentorId: objectIdSchema,
  menteeId: objectIdSchema,
  status: z.enum(["pending", "active", "completed", "cancelled"]).default("pending"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  matchScore: z.number().min(0).max(100).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const mentorshipUpdateSchema = mentorshipInsertSchema.partial();

// Mentor Task schemas
export const mentorTaskInsertSchema = z.object({
  mentorshipId: objectIdSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.date().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  feedback: z.string().max(2000).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const mentorTaskUpdateSchema = mentorTaskInsertSchema.partial();

// Reaction schemas
export const reactionInsertSchema = z.object({
  userId: objectIdSchema,
  targetType: z.enum(["post", "comment", "journal", "resource", "task"]),
  targetId: objectIdSchema,
  type: z.enum(["like", "heart", "helpful", "support", "thumbsup"]),
  createdAt: z.date().default(() => new Date()),
});

// Reaction Streak schemas
export const reactionStreakInsertSchema = z.object({
  userId: objectIdSchema,
  currentStreak: z.number().int().default(0),
  longestStreak: z.number().int().default(0),
  lastReactionDate: z.date().optional(),
  totalReactions: z.number().int().default(0),
  reactionsByType: z.record(z.number()).default({}),
  weeklyReactions: z.number().int().default(0),
  monthlyReactions: z.number().int().default(0),
  streakResetDate: z.date().optional(),
  achievements: z.record(z.any()).default({}),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const reactionStreakUpdateSchema = reactionStreakInsertSchema.partial();

// Community Post schemas
export const communityPostInsertSchema = z.object({
  userId: objectIdSchema,
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  category: z.string().min(1).max(50),
  tags: z.array(z.string()).default([]),
  likes: z.number().int().default(0),
  comments: z.number().int().default(0),
  isDraft: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const communityPostUpdateSchema = communityPostInsertSchema.partial();

// Community Comment schemas
export const communityCommentInsertSchema = z.object({
  postId: objectIdSchema,
  userId: objectIdSchema,
  content: z.string().min(1).max(2000),
  likes: z.number().int().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const communityCommentUpdateSchema = communityCommentInsertSchema.partial();

// Resource schemas
export const resourceInsertSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(["article", "video", "audio", "worksheet", "helpline"]),
  url: z.string().url(),
  category: z.string().min(1).max(50),
  tags: z.array(z.string()).default([]),
  isOfficial: z.boolean().default(false),
  views: z.number().int().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const resourceUpdateSchema = resourceInsertSchema.partial();

// Crisis Support schemas
export const crisisSupportInsertSchema = z.object({
  userId: objectIdSchema,
  type: z.enum(["sos", "crisis_chat", "hotline_contact"]),
  severity: z.enum(["low", "medium", "high"]).default("high"),
  status: z.enum(["new", "acknowledged", "resolved"]).default("new"),
  message: z.string().max(2000).optional(),
  contactedAt: z.date().optional(),
  resolvedAt: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const crisisSupportUpdateSchema = crisisSupportInsertSchema.partial();

// User Settings schemas
export const userSettingsInsertSchema = z.object({
  userId: objectIdSchema,
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    inApp: z.boolean().default(true),
  }),
  accessibility: z.object({
    fontSize: z.number().int().min(12).max(24).default(16),
    highContrast: z.boolean().default(false),
    reduceMotion: z.boolean().default(false),
    screenReader: z.boolean().default(false),
  }),
  privacy: z.object({
    profileVisibility: z.enum(["public", "private", "friends"]).default("private"),
    showMoodHistory: z.boolean().default(false),
    allowMessaging: z.boolean().default(true),
  }),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const userSettingsUpdateSchema = userSettingsInsertSchema.partial();

// Type exports for TypeScript usage
export type User = z.infer<typeof userInsertSchema> & { _id?: ObjectId };
export type Therapist = z.infer<typeof therapistInsertSchema>;
export type Supervisor = z.infer<typeof supervisorInsertSchema>;
export type Appointment = z.infer<typeof appointmentInsertSchema>;
export type PaymentGateway = z.infer<typeof paymentGatewayInsertSchema>;
export type Payment = z.infer<typeof paymentInsertSchema>;
export type MoodEntry = z.infer<typeof moodEntryInsertSchema>;
export type JournalEntry = z.infer<typeof journalEntryInsertSchema>;
export type Goal = z.infer<typeof goalInsertSchema>;
export type EmergencyContact = z.infer<typeof emergencyContactInsertSchema>;
export type Assessment = z.infer<typeof assessmentInsertSchema>;
export type AssessmentQuestion = z.infer<typeof assessmentQuestionInsertSchema>;
export type UserAssessment = z.infer<typeof userAssessmentInsertSchema>;
export type Diagnosis = z.infer<typeof diagnosisInsertSchema>;
export type UserDiagnosis = z.infer<typeof userDiagnosisInsertSchema>;
export type TherapistResource = z.infer<typeof therapistResourceInsertSchema>;
export type Mentor = z.infer<typeof mentorInsertSchema>;
export type Mentee = z.infer<typeof menteeInsertSchema>;
export type Mentorship = z.infer<typeof mentorshipInsertSchema>;
export type MentorTask = z.infer<typeof mentorTaskInsertSchema>;
export type Reaction = z.infer<typeof reactionInsertSchema>;
export type ReactionStreak = z.infer<typeof reactionStreakInsertSchema>;
export type CommunityPost = z.infer<typeof communityPostInsertSchema>;
export type CommunityComment = z.infer<typeof communityCommentInsertSchema>;
export type Resource = z.infer<typeof resourceInsertSchema>;
export type CrisisSupport = z.infer<typeof crisisSupportInsertSchema>;
export type UserSettings = z.infer<typeof userSettingsInsertSchema>;
