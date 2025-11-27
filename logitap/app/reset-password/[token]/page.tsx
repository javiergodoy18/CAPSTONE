'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import FormField from '../../components/FormField';
import { validatePasswordStrength, validatePasswordsMatch } from '@/lib/passwordValidation';
import styles from './ResetPassword.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Validar token al cargar
  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  // Validar fortaleza de contraseña en tiempo real
  useEffect(() => {
    if (newPassword) {
      const validation = validatePasswordStrength(newPassword);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  }, [newPassword]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/auth/validate-reset-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setError('El enlace de recuperación es inválido o ha expirado');
      }
    } catch (err) {
      setTokenValid(false);
      setError('Error al validar el enlace');
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (!validatePasswordsMatch(newPassword, confirmPassword)) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar fortaleza de contraseña
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al restablecer la contraseña');
      }

      setSuccess(true);

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className={styles.container}>
        <div className={styles.box}>
          <Card variant="glass" padding="lg">
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>Validando enlace...</p>
            </div>
          </Card>
        </div>

        <div className={styles.backgroundDecor}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.grid} />
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className={styles.container}>
        <div className={styles.box}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🚚</span>
              <h1 className={styles.logoText}>LOGITAP</h1>
            </div>
            <h2 className={styles.title}>Enlace Inválido</h2>
          </div>

          <Card variant="glass" padding="lg">
            <div className={styles.errorMessage}>
              <span className={styles.errorMessageIcon}>❌</span>
              <p className={styles.errorMessageText}>{error}</p>
              <p className={styles.errorMessageSubtext}>
                El enlace puede haber expirado o ya fue utilizado.
              </p>
            </div>

            <Button
              onClick={() => router.push('/forgot-password')}
              size="lg"
              fullWidth
              variant="secondary"
            >
              Solicitar Nuevo Enlace
            </Button>
          </Card>
        </div>

        <div className={styles.backgroundDecor}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.grid} />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.box}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🚚</span>
              <h1 className={styles.logoText}>LOGITAP</h1>
            </div>
            <h2 className={styles.title}>Contraseña Actualizada</h2>
          </div>

          <Card variant="glass" padding="lg">
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>✅</span>
              <p className={styles.successText}>
                Tu contraseña ha sido actualizada exitosamente.
              </p>
              <p className={styles.successSubtext}>
                Serás redirigido al login en unos segundos...
              </p>
            </div>

            <Button
              onClick={() => router.push('/login')}
              size="lg"
              fullWidth
            >
              Ir al Login
            </Button>
          </Card>
        </div>

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
          <h2 className={styles.title}>Nueva Contraseña</h2>
          <p className={styles.subtitle}>
            Ingresa tu nueva contraseña
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

            <FormField label="Nueva Contraseña" required>
              <Input
                type="password"
                icon="🔒"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {passwordErrors.length > 0 && (
                <div className={styles.passwordRequirements}>
                  <p className={styles.requirementsTitle}>Requisitos:</p>
                  <ul className={styles.requirementsList}>
                    <li className={newPassword.length >= 8 ? styles.valid : styles.invalid}>
                      Mínimo 8 caracteres
                    </li>
                    <li className={/[A-Z]/.test(newPassword) ? styles.valid : styles.invalid}>
                      Al menos 1 letra mayúscula
                    </li>
                    <li className={/[0-9]/.test(newPassword) ? styles.valid : styles.invalid}>
                      Al menos 1 número
                    </li>
                  </ul>
                </div>
              )}
            </FormField>

            <FormField label="Confirmar Contraseña" required>
              <Input
                type="password"
                icon="🔒"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              Restablecer Contraseña
            </Button>
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
