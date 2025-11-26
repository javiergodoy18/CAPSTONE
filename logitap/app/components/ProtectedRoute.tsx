'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireDriver?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireDriver = false
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (requireAdmin && user.role !== 'ADMIN') {
        router.push('/driver/dashboard');
        return;
      }

      if (requireDriver && user.role !== 'DRIVER') {
        router.push('/');
        return;
      }
    }
  }, [user, loading, requireAdmin, requireDriver, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Verificando acceso...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return null;
  }

  if (requireDriver && user.role !== 'DRIVER') {
    return null;
  }

  return <>{children}</>;
}
