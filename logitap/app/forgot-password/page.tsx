'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import FormField from '../components/FormField';
import styles from './ForgotPassword.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el correo');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.box}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🚚</span>
              <h1 className={styles.logoText}>LOGITAP</h1>
            </div>
            <h2 className={styles.title}>Correo Enviado</h2>
          </div>

          <Card variant="glass" padding="lg">
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>✅</span>
              <p className={styles.successText}>
                Si el correo electrónico existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
              </p>
              <p className={styles.successSubtext}>
                Por favor, revisa tu bandeja de entrada y spam.
              </p>
            </div>

            <Button
              onClick={() => router.push('/login')}
              size="lg"
              fullWidth
              variant="secondary"
            >
              Volver al Login
            </Button>
          </Card>
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

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🚚</span>
            <h1 className={styles.logoText}>LOGITAP</h1>
          </div>
          <h2 className={styles.title}>Recuperar Contraseña</h2>
          <p className={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
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

            <FormField label="Correo Electrónico" required>
              <Input
                type="email"
                icon="📧"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              Enviar Enlace de Recuperación
            </Button>

            <div className={styles.backToLogin}>
              <a href="/login" className={styles.backToLoginLink}>
                ← Volver al Login
              </a>
            </div>
          </form>
        </Card>
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
