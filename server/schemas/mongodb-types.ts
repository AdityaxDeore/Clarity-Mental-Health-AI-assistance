import { ObjectId } from "mongodb";

// USERS
export interface User {
  _id?: ObjectId;
  userId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// THERAPISTS
export interface Therapist {
  _id?: ObjectId;
  therapistId: string;
  userId: string;
  supervisorId?: string;
  licenseNo: string;
  specialization: string;
}

// APPOINTMENTS
export interface Appointment {
  _id?: ObjectId;
  apptId: string;
  userId: string;
  therapistId: string;
  schedule: Date;
}

// PAYMENT
export interface Payment {
  _id?: ObjectId;
  paymentId: string;
  apptId: string;
  therapistId: string;
  gatewayId: string;
  amount: number;
  date: Date;
  method: string;
}

// PAYMENT_GATEWAY
export interface PaymentGateway {
  _id?: ObjectId;
  gatewayId: string;
  name: string;
  transactionFee: number;
}

// RESOURCES
export interface Resource {
  _id?: ObjectId;
  resourceId: string;
  therapistId?: string;
  title: string;
  description?: string;
  type: string;
}

// MOOD_ENTRIES
export interface MoodEntry {
  _id?: ObjectId;
  entryId: string;
  userId: string;
  moodLv: number;
  notes?: string;
  date: Date;
}

// JOURNAL_ENTRIES
export interface JournalEntry {
  _id?: ObjectId;
  journalId: string;
  userId: string;
  title: string;
  content: string;
}

// GOALS
export interface Goal {
  _id?: ObjectId;
  goalId: string;
  userId: string;
  title: string;
  status: string;
}

// EMERGENCY_CONTACTS
export interface EmergencyContact {
  _id?: ObjectId;
  contactId: string;
  userId: string;
  name: string;
  phone: string;
}

// DIAGNOSIS
export interface Diagnosis {
  _id?: ObjectId;
  diagnosisId: string;
  name: string;
  icdCode: string;
}

// USER_DIAGNOSES
export interface UserDiagnosis {
  _id?: ObjectId;
  userDiagId: string;
  userId: string;
  diagnosisId: string;
  assessId?: string;
  severity: string;
}

// ASSESSMENTS
export interface Assessment {
  _id?: ObjectId;
  assessmentId: string;
  name: string;
  category: string;
}

// ASSESSMENT_QUESTIONS
export interface AssessmentQuestion {
  _id?: ObjectId;
  questionId: string;
  assessmentId: string;
  supervisorId?: string;
  questionText: string;
}

// USER_ASSESSMENTS
export interface UserAssessment {
  _id?: ObjectId;
  userAssessId: string;
  userId: string;
  assessId: string;
  assignedTherapistId?: string;
  assignedSupervisorId?: string;
  totalScore: number;
}

// SUPERVISOR
export interface Supervisor {
  _id?: ObjectId;
  supervisorId: string;
  name: string;
  contact: string;
}
