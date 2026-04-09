import { z } from "zod";

// USERS
export const userInsertSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

// THERAPISTS
export const therapistInsertSchema = z.object({
  therapistId: z.string().min(1),
  userId: z.string().min(1),
  supervisorId: z.string().min(1).optional(),
  licenseNo: z.string().min(1),
  specialization: z.string().min(1),
});

// APPOINTMENTS
export const appointmentInsertSchema = z.object({
  apptId: z.string().min(1),
  userId: z.string().min(1),
  therapistId: z.string().min(1),
  schedule: z.date(),
});

// PAYMENT
export const paymentInsertSchema = z.object({
  paymentId: z.string().min(1),
  apptId: z.string().min(1),
  therapistId: z.string().min(1),
  gatewayId: z.string().min(1),
  amount: z.number(),
  date: z.date(),
  method: z.string().min(1),
});

// PAYMENT_GATEWAY
export const paymentGatewayInsertSchema = z.object({
  gatewayId: z.string().min(1),
  name: z.string().min(1),
  transactionFee: z.number(),
});

// RESOURCES
export const resourceInsertSchema = z.object({
  resourceId: z.string().min(1),
  therapistId: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
});

// MOOD_ENTRIES
export const moodEntryInsertSchema = z.object({
  entryId: z.string().min(1),
  userId: z.string().min(1),
  moodLv: z.number(),
  notes: z.string().optional(),
  date: z.date(),
});

// JOURNAL_ENTRIES
export const journalEntryInsertSchema = z.object({
  journalId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
});

// GOALS
export const goalInsertSchema = z.object({
  goalId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  status: z.string().min(1),
});

// EMERGENCY_CONTACTS
export const emergencyContactInsertSchema = z.object({
  contactId: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
});

// DIAGNOSIS
export const diagnosisInsertSchema = z.object({
  diagnosisId: z.string().min(1),
  name: z.string().min(1),
  icdCode: z.string().min(1),
});

// USER_DIAGNOSES
export const userDiagnosisInsertSchema = z.object({
  userDiagId: z.string().min(1),
  userId: z.string().min(1),
  diagnosisId: z.string().min(1),
  assessId: z.string().min(1).optional(),
  severity: z.string().min(1),
});

// ASSESSMENTS
export const assessmentInsertSchema = z.object({
  assessmentId: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
});

// ASSESSMENT_QUESTIONS
export const assessmentQuestionInsertSchema = z.object({
  questionId: z.string().min(1),
  assessmentId: z.string().min(1),
  supervisorId: z.string().min(1).optional(),
  questionText: z.string().min(1),
});

// USER_ASSESSMENTS
export const userAssessmentInsertSchema = z.object({
  userAssessId: z.string().min(1),
  userId: z.string().min(1),
  assessId: z.string().min(1),
  assignedTherapistId: z.string().min(1).optional(),
  assignedSupervisorId: z.string().min(1).optional(),
  totalScore: z.number(),
});

// SUPERVISOR
export const supervisorInsertSchema = z.object({
  supervisorId: z.string().min(1),
  name: z.string().min(1),
  contact: z.string().min(1),
});

// Update schemas
export const userUpdateSchema = userInsertSchema.partial();
export const therapistUpdateSchema = therapistInsertSchema.partial();
export const appointmentUpdateSchema = appointmentInsertSchema.partial();
export const paymentUpdateSchema = paymentInsertSchema.partial();
export const paymentGatewayUpdateSchema = paymentGatewayInsertSchema.partial();
export const resourceUpdateSchema = resourceInsertSchema.partial();
export const moodEntryUpdateSchema = moodEntryInsertSchema.partial();
export const journalEntryUpdateSchema = journalEntryInsertSchema.partial();
export const goalUpdateSchema = goalInsertSchema.partial();
export const emergencyContactUpdateSchema = emergencyContactInsertSchema.partial();
export const diagnosisUpdateSchema = diagnosisInsertSchema.partial();
export const userDiagnosisUpdateSchema = userDiagnosisInsertSchema.partial();
export const assessmentUpdateSchema = assessmentInsertSchema.partial();
export const assessmentQuestionUpdateSchema = assessmentQuestionInsertSchema.partial();
export const userAssessmentUpdateSchema = userAssessmentInsertSchema.partial();
export const supervisorUpdateSchema = supervisorInsertSchema.partial();

// Type exports
export type User = z.infer<typeof userInsertSchema>;
export type Therapist = z.infer<typeof therapistInsertSchema>;
export type Appointment = z.infer<typeof appointmentInsertSchema>;
export type Payment = z.infer<typeof paymentInsertSchema>;
export type PaymentGateway = z.infer<typeof paymentGatewayInsertSchema>;
export type Resource = z.infer<typeof resourceInsertSchema>;
export type MoodEntry = z.infer<typeof moodEntryInsertSchema>;
export type JournalEntry = z.infer<typeof journalEntryInsertSchema>;
export type Goal = z.infer<typeof goalInsertSchema>;
export type EmergencyContact = z.infer<typeof emergencyContactInsertSchema>;
export type Diagnosis = z.infer<typeof diagnosisInsertSchema>;
export type UserDiagnosis = z.infer<typeof userDiagnosisInsertSchema>;
export type Assessment = z.infer<typeof assessmentInsertSchema>;
export type AssessmentQuestion = z.infer<typeof assessmentQuestionInsertSchema>;
export type UserAssessment = z.infer<typeof userAssessmentInsertSchema>;
export type Supervisor = z.infer<typeof supervisorInsertSchema>;
