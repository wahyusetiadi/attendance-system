'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, LoginRequest } from '@/api/api';
import { LoginFormErrors } from '@/types/auth';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const router = useRouter();
  const { login: contextLogin } = useAuthContext();

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await authAPI.login(credentials);

      // Use context login method to set auth state
      contextLogin(response.token, response.user);

      // Redirect ke dashboard
      router.push('/dashboard');

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setErrors({ general: errorMessage });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    errors,
  };
};
