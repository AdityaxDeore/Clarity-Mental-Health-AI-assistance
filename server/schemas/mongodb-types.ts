import { ObjectId } from "mongodb";

// User Document
export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "user" | "mentor" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// Therapist Document (specialized user)
export interface Therapist {
  _id?: ObjectId;
  userId: ObjectId;
  supervisorId?: ObjectId;
  specialization: string;
  licenseNumber?: string;
  experienceYears: number;
  consultationFee: number;
  availabilityStatus: "available" | "busy" | "offline";
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supervisor Document
export interface Supervisor {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  contact: string;
  department?: string;
  qualification?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment Document
export interface Appointment {
  _id?: ObjectId;
  userId: ObjectId;
  therapistId: ObjectId;
  schedule: Date;
  scheduledAt: Date;
  durationMinutes: number;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Gateway Document
export interface PaymentGateway {
  _id?: ObjectId;
  name: string;
  providerCode: string;
  transactionFee: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Document
export interface Payment {
  _id?: ObjectId;
  appointmentId: ObjectId;
  paymentGatewayId: ObjectId;
  amount: number;
  date: Date;
  method: "card" | "upi" | "net_banking" | "wallet" | "cash";
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  transactionReference?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mood Entry Document
export interface MoodEntry {
  _id?: ObjectId;
  userId: ObjectId;
  moodId: number;
  moodValue: number; // 1-5 scale
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Journal Entry Document
export interface JournalEntry {
  _id?: ObjectId;
  userId: ObjectId;
  title?: string;
  content: string;
  moodTag?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Goal Document
export interface Goal {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  status: "pending" | "in_progress" | "completed";
  description?: string;
  category: "wellness" | "academic" | "personal" | "career";
  progress: number; // 0-100
  isCompleted: boolean;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Emergency Contact Document
export interface EmergencyContact {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Assessment Document
export interface Assessment {
  _id?: ObjectId;
  name: string;
  title: string;
  description?: string;
  category: string;
  createdByTherapistId?: ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Assessment Question Document (weak entity of Assessment)
export interface AssessmentQuestion {
  _id?: ObjectId;
  assessmentId: ObjectId;
  supervisorId?: ObjectId;
  questionText: string;
  questionType: "single_choice" | "multi_choice" | "scale" | "text";
  options?: string[];
  order: number;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

// User Assessment Document (weak/associative entity of User + Assessment)
export interface UserAssessment {
  _id?: ObjectId;
  userId: ObjectId;
  assessmentId: ObjectId;
  responses: Array<{
    questionId: ObjectId;
    answer: string | string[] | number;
    score?: number;
  }>;
  totalScore: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Diagnosis Document
export interface Diagnosis {
  _id?: ObjectId;
  code: string;
  icdCode: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Diagnosis Document (associative entity of User + Diagnosis)
export interface UserDiagnosis {
  _id?: ObjectId;
  userId: ObjectId;
  diagnosisId: ObjectId;
  diagnosedByTherapistId?: ObjectId;
  sourceUserAssessmentId?: ObjectId;
  diagnosedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Therapist Resource Document (associative entity for therapist <-> resource)
export interface TherapistResource {
  _id?: ObjectId;
  therapistId: ObjectId;
  resourceId: ObjectId;
  recommendedAt: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mentor Document
export interface Mentor {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  year: number; // 2, 3, 4
  region: string;
  domains: string[]; // expertise areas
  bio?: string;
  maxMentees: number;
  currentMentees: number;
  isActive: boolean;
  rating?: number;
  totalMatches?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mentee Document
export interface Mentee {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  year: number; // 1, 2, 3, 4
  region: string;
  interests: string[];
  goals?: string;
  hasActiveMentor: boolean;
  mentorId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Mentorship Document
export interface Mentorship {
  _id?: ObjectId;
  mentorId: ObjectId;
  menteeId: ObjectId;
  status: "pending" | "active" | "completed" | "cancelled";
  startDate?: Date;
  endDate?: Date;
  matchScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mentor Task Document
export interface MentorTask {
  _id?: ObjectId;
  mentorshipId: ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Reaction Document
export interface Reaction {
  _id?: ObjectId;
  userId: ObjectId;
  targetType: "post" | "comment" | "journal" | "resource" | "task";
  targetId: ObjectId;
  type: "like" | "heart" | "helpful" | "support" | "thumbsup";
  createdAt: Date;
}

// Reaction Streak Document
export interface ReactionStreak {
  _id?: ObjectId;
  userId: ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastReactionDate?: Date;
  totalReactions: number;
  reactionsByType: Record<string, number>;
  weeklyReactions: number;
  monthlyReactions: number;
  streakResetDate?: Date;
  achievements: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Anonymous Chat Message Document
export interface AnonymousChatMessage {
  _id?: ObjectId;
  chatId: string;
  userId?: ObjectId;
  senderName: string;
  message: string;
  messageType: "text" | "system" | "emoji";
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Community Post Document
export interface CommunityPost {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Community Comment Document
export interface CommunityComment {
  _id?: ObjectId;
  postId: ObjectId;
  userId: ObjectId;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

// Resource Document
export interface Resource {
  _id?: ObjectId;
  title: string;
  description?: string;
  type: "article" | "video" | "audio" | "worksheet" | "helpline";
  url: string;
  category: string;
  tags: string[];
  isOfficial: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// Crisis Support Document
export interface CrisisSupport {
  _id?: ObjectId;
  userId: ObjectId;
  type: "sos" | "crisis_chat" | "hotline_contact";
  severity: "low" | "medium" | "high";
  status: "new" | "acknowledged" | "resolved";
  message?: string;
  contactedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Log Document
export interface AdminLog {
  _id?: ObjectId;
  adminId: ObjectId;
  action: string;
  targetType?: string;
  targetId?: ObjectId;
  changes?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

// Theme/Settings Document
export interface UserSettings {
  _id?: ObjectId;
  userId: ObjectId;
  theme: "light" | "dark" | "auto";
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  accessibility: {
    fontSize: number;
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "friends";
    showMoodHistory: boolean;
    allowMessaging: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
