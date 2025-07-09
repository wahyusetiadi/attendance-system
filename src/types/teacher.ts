// Teacher interface yang sesuai dengan Prisma model
export interface Teacher {
  id?: number;
  nip?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  subject?: string;
  rfidUid?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields untuk backward compatibility
  grade?: string;
  status?: 'active' | 'inactive';
  joinDate?: string;
  avatar?: string;
}

export interface CreateTeacherRequest {
  nip?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  subject?: string;
  rfidUid?: string;
  isActive?: boolean;
}

export interface UpdateTeacherRequest {
  nip?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  subject?: string;
  rfidUid?: string;
  isActive?: boolean;
}

// Standarisasi interface Pagination sesuai dengan response backend
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number | null;
  prevPage?: number | null;
}

export interface TeachersResponse {
  success: boolean;
  data: Teacher[];
  message?: string;
  pagination?: Pagination;
}

export interface TeacherResponse {
  success: boolean;
  data: Teacher;
  message: string;
}
