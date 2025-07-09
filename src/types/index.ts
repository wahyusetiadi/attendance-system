
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
