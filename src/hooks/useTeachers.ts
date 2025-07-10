'use client';

import { useState, useEffect } from 'react';
import { teachersAPI } from '@/api/api';
import { CreateTeacherRequest, Pagination, Teacher, UpdateTeacherRequest } from '@/types/teacher';

interface UseTeachersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

interface UseTeachersReturn {
  teachers: Teacher[];
  allTeachers: Teacher[]; // ✅ Tambahkan untuk semua data
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  fetchTeachers: (params?: UseTeachersParams) => Promise<void>;
  createTeacher: (data: CreateTeacherRequest) => Promise<Teacher | null>;
  updateTeacher: (id: number, data: UpdateTeacherRequest) => Promise<Teacher | null>;
  deleteTeacher: (id: number) => Promise<boolean>;
  toggleTeacherStatus: (id: number) => Promise<Teacher | null>;
  refresh: () => Promise<void>;
}

export const useTeachers = (initialParams?: UseTeachersParams): UseTeachersReturn => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]); // ✅ State untuk semua data
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentParams, setCurrentParams] = useState<UseTeachersParams>(initialParams || {});

  // ✅ Fetch semua guru untuk statistik
  const fetchAllTeachers = async () => {
    try {
      const response = await teachersAPI.getAll({ limit: 1000 }); // Atau tanpa limit
      if (response.success) {
        setAllTeachers(response.data);
        console.log(`✅ Loaded ${response.data.length} teachers for statistics`);
      }
    } catch (error) {
      console.error('Error fetching all teachers:', error);
    }
  };

  const fetchTeachers = async (params?: UseTeachersParams) => {
    setIsLoading(true);
    setError(null);

    const queryParams = params || currentParams;
    setCurrentParams(queryParams);

    try {
      const response = await teachersAPI.getAll(queryParams);

      if (response.success) {
        setTeachers(response.data);
        if (response.pagination) {
          const backendPagination = response.pagination as any;

          setPagination({
            page: backendPagination.page,
            limit: backendPagination.limit,
            total: backendPagination.total, // ✅ Backend menggunakan "total"
            totalPages: backendPagination.totalPages,
            hasNext: backendPagination.hasNext,
            hasPrev: backendPagination.hasPrev,
            nextPage: backendPagination.nextPage || null,
            prevPage: backendPagination.prevPage || null
          });
        }
      } else {
        setError(response.message || 'Failed to fetch teachers');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch teachers';
      setError(errorMessage);
      console.error('Error fetching teachers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTeacher = async (data: CreateTeacherRequest): Promise<Teacher | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teachersAPI.create(data);

      if (response.success) {
        // Refresh data after create
        await fetchTeachers(currentParams);
        await fetchAllTeachers(); // ✅ Refresh semua data juga
        return response.data;
      } else {
        setError(response.message || 'Failed to create teacher');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create teacher';
      setError(errorMessage);
      console.error('Error creating teacher:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTeacher = async (id: number, data: UpdateTeacherRequest): Promise<Teacher | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teachersAPI.update(id, data);

      if (response.success) {
        // Update teacher in local state
        setTeachers(prev => prev.map(teacher => 
          teacher.id === id ? response.data : teacher
        ));
        // ✅ Update juga di allTeachers
        setAllTeachers(prev => prev.map(teacher => 
          teacher.id === id ? response.data : teacher
        ));
        return response.data;
      } else {
        setError(response.message || 'Failed to update teacher');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update teacher';
      setError(errorMessage);
      console.error('Error updating teacher:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeacher = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teachersAPI.delete(id);

      if (response.success) {
        // Remove teacher from local state
        setTeachers(prev => prev.filter(teacher => teacher.id !== id));
        // ✅ Remove juga dari allTeachers
        setAllTeachers(prev => prev.filter(teacher => teacher.id !== id));
        return true;
      } else {
        setError(response.message || 'Failed to delete teacher');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete teacher';
      setError(errorMessage);
      console.error('Error deleting teacher:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTeacherStatus = async (id: number): Promise<Teacher | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teachersAPI.toggleStatus(id);

      if (response.success) {
        // Update teacher status in local state
        setTeachers(prev => prev.map(teacher => 
          teacher.id === id ? response.data : teacher
        ));
        // ✅ Update juga di allTeachers
        setAllTeachers(prev => prev.map(teacher => 
          teacher.id === id ? response.data : teacher
        ));
        return response.data;
      } else {
        setError(response.message || 'Failed to toggle teacher status');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to toggle teacher status';
      setError(errorMessage);
      console.error('Error toggling teacher status:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await Promise.all([
      fetchTeachers(currentParams),
      fetchAllTeachers() // ✅ Refresh semua data juga
    ]);
  };

  // ✅ Fetch teachers dan semua data saat mount
  useEffect(() => {
    fetchTeachers();
    fetchAllTeachers();
  }, []);

  return {
    teachers,
    allTeachers, // ✅ Return semua data
    isLoading,
    error,
    pagination,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    toggleTeacherStatus,
    refresh,
  };
};
