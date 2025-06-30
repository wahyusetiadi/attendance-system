export interface Teacher {
  id?: number;
  nip?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  subject?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeacherRequest {
  nip?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  subject?: string;
  isActive?: boolean;
}

export interface UpdateTeacherRequest {
  nip?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  subject?: string;
  isActive?: boolean;
}

export interface TeachersResponse {
  success: boolean;
  data: Teacher[];
  message?: string;
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface TeacherResponse {
  success: boolean;
  data: Teacher;
  message: string;
}
