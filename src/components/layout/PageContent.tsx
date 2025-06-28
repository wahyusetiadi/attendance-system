// src/components/layout/PageContent.tsx
'use client';

import React, { ReactNode } from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { PageLoader } from '@/components/ui/LoadingSpinner';

interface PageContentProps {
  children: ReactNode;
}

export function PageContent({ children }: PageContentProps) {
  const { isLoading } = useLoading();

  if (isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
