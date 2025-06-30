'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/register', '/forgot-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check if already initialized
    if (isInitialized) return;

    const checkAuth = () => {
      try {
        // Check if we're on client side
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, [isInitialized]);

  // Separate effect for handling redirects
  useEffect(() => {
    if (isLoading || !isInitialized) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, pathname, router, isLoading, isInitialized]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
