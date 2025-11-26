'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import FormField from '../components/FormField';
import styles from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Si ya está autenticado, redirigir
      if (user.role === 'ADMIN') {
        router.push('/');
      } else {
        router.push('/driver/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🚚</span>
            <h1 className={styles.logoText}>LOGITAP</h1>
          </div>
          <h2 className={styles.title}>Iniciar Sesión</h2>
          <p className={styles.subtitle}>
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        <Card variant="glass" padding="lg">
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorAlert}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <FormField label="Email" required>
              <Input
                type="email"
                icon="📧"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Contraseña" required>
              <Input
                type="password"
                icon="🔒"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormField>

            <Button
              type="submit"
              size="lg"
              fullWidth
              glow
              loading={isLoading}
              icon={<span>→</span>}
              iconPosition="right"
            >
              Iniciar Sesión
            </Button>
          </form>
        </Card>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Sistema de Gestión Logística v1.0
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className={styles.backgroundDecor}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>
    </div>
  );
}
