
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Professor {
  id: string;
  name: string;
}

export interface Module {
  id: string;
  name: string;
  code: string;
}

export interface Submission {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  authorId: string;
  author: User;
  supervisorId: string;
  supervisor: Professor;
  moduleId: string;
  module: Module;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPRights {
  id: string;
  submissionId: string;
  userId: string;
  rightsType: string;
  registrationNumber?: string;
  filingDate?: Date;
  expirationDate?: Date;
  jurisdiction: string;
  description?: string;
  restrictions?: string;
  licensingTerms?: string;
}

export interface IPUsageLog {
  id: string;
  ipRightsId: string;
  submissionId: string;
  userId: string;
  user: User;
  accessType: 'download' | 'view';
  timestamp: Date;
  purpose?: string;
  approved: boolean;
  ipAddress: string;
  userAgent: string;
}

export interface FormData {
  title: string;
  description: string;
  moduleId: string;
  supervisorId: string;
  file: File | null;
}
