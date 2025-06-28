export interface Teacher {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  subject: string;
  grade: string;
  status: 'active' | 'inactive';
  joinDate: string;
  avatar?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher';
}

export interface DashboardStats {
  totalTeachers: number;
  activeTeachers: number;
  totalSubjects: number;
  totalGrades: number;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  subject: string;
  grade: string;
  status: 'active' | 'inactive';
  joinDate: string;
  avatar?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher';
}

export interface DashboardStats {
  totalTeachers: number;
  activeTeachers: number;
  totalSubjects: number;
  totalGrades: number;
}

// Export attendance types
export * from './attendance';

