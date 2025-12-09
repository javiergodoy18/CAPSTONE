'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Estados
  const [activeTab, setActiveTab] = useState<'info' | 'edit' | 'password' | 'email'>('info');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Estados para editar nombre
  const [nameForm, setNameForm] = useState({
    name: user?.name || '',
  });
  const [nameError, setNameError] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');

  // Estados para cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Estados para cambio de email
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    // Diagnóstico: ver estructura del user
    if (user) {
      console.log('👤 Usuario completo:', user);
      console.log('📋 Campos disponibles:', Object.keys(user));
      // Actualizar el formulario de nombre cuando el user se cargue
      setNameForm({ name: user.name || '' });
      // Cargar la imagen de perfil si existe
      setProfileImage((user as any).profileImage || null);
    }
  }, [user, loading, router]);

  // Manejar subida de imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      return;
    }

    setIsUploading(true);

    // Convertir a base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;

      try {
        // Guardar en la base de datos
        const response = await fetch('/api/auth/update-profile-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileImage: base64Image,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || 'Error al actualizar imagen');
          setIsUploading(false);
          return;
        }

        // Actualizar la imagen en el estado local
        setProfileImage(base64Image);

        // Recargar la página para actualizar el navbar
        window.location.reload();
      } catch (error) {
        console.error('Error al actualizar imagen:', error);
        alert('Error al actualizar la imagen de perfil');
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Cambiar contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validaciones
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cambiar contraseña');
      }

      setPasswordSuccess('Contraseña cambiada exitosamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordError(error.message);
    }
  };

  // Cambiar email
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      setEmailError('Email inválido');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          password: emailForm.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cambiar email');
      }

      setEmailSuccess('Email cambiado exitosamente. Por favor inicia sesión nuevamente.');
      setEmailForm({ newEmail: '', password: '' });

      // Logout después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      setEmailError(error.message);
    }
  };

  // Cambiar nombre
  const handleChangeName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setNameSuccess('');

    // Validaciones
    if (!nameForm.name.trim()) {
      setNameError('El nombre es requerido');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameForm.name.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar nombre');
      }

      setNameSuccess('Nombre actualizado exitosamente. Recarga la página para ver los cambios.');

      // Recargar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setNameError(error.message);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      }}>
        <div style={{ color: '#38bdf8', fontSize: '1.25rem' }}>Cargando...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      paddingTop: '80px', // Espacio para el navbar fijo
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1rem',
      }}>
        {/* Header con foto de perfil */}
        <div style={{
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          {/* Avatar con opción de cambiar */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: profileImage
                ? `url(${profileImage}) center/cover`
                : 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3.5rem',
              margin: '0 auto 1rem',
              boxShadow: '0 10px 30px rgba(56, 189, 248, 0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {!profileImage && '👤'}

              {/* Overlay para cambiar foto */}
              <label style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'white',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                {isUploading ? '⏳' : '📷 Cambiar'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#f0f9ff',
            marginBottom: '0.5rem',
          }}>
            {user.name || 'Usuario'}
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1rem',
          }}>
            {user.email}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid rgba(71, 85, 105, 0.3)',
        }}>
          {[
            { id: 'info', label: '📋 Información', icon: '📋' },
            { id: 'edit', label: '✏️ Editar Info', icon: '✏️' },
            { id: 'password', label: '🔒 Contraseña', icon: '🔒' },
            { id: 'email', label: '✉️ Cambiar Email', icon: '✉️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '1rem 1.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id
                  ? '3px solid #38bdf8'
                  : '3px solid transparent',
                color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido según tab activo */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '16px',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
        }}>
          {/* TAB: Información */}
          {activeTab === 'info' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <InfoField label="Nombre Completo" value={user.name || 'No especificado'} />
              <InfoField label="Correo Electrónico" value={user.email} />
              <InfoField label="Rol" value={user.role} badge />
            </div>
          )}

          {/* TAB: Editar Información */}
          {activeTab === 'edit' && (
            <form onSubmit={handleChangeName} style={{ display: 'grid', gap: '1.5rem' }}>
              <h3 style={{
                color: '#f0f9ff',
                fontSize: '1.25rem',
                marginBottom: '0.5rem'
              }}>
                Editar Información Personal
              </h3>

              {nameError && <ErrorMessage message={nameError} />}
              {nameSuccess && <SuccessMessage message={nameSuccess} />}

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                }}>
                  Nombre Completo <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={nameForm.name}
                  onChange={(e) => setNameForm({name: e.target.value})}
                  required
                  placeholder="Ej: Juan Pérez"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '8px',
                    color: '#f0f9ff',
                    fontSize: '1rem',
                  }}
                />
                <span style={{
                  display: 'block',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#64748b',
                }}>
                  Ingresa tu nombre completo
                </span>
              </div>

              {/* Botón guardar */}
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(56, 189, 248, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(56, 189, 248, 0.3)';
                }}
              >
                ✏️ Guardar Cambios
              </button>
            </form>
          )}

          {/* TAB: Cambiar Contraseña */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '1.5rem' }}>
              <h3 style={{ color: '#f0f9ff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Cambiar Contraseña
              </h3>

              {passwordError && <ErrorMessage message={passwordError} />}
              {passwordSuccess && <SuccessMessage message={passwordSuccess} />}

              <InputField
                label="Contraseña Actual"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
              />

              <InputField
                label="Nueva Contraseña"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
                hint="Mínimo 8 caracteres"
              />

              <InputField
                label="Confirmar Nueva Contraseña"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
              />

              <button type="submit" style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
              }}>
                🔒 Cambiar Contraseña
              </button>
            </form>
          )}

          {/* TAB: Cambiar Email */}
          {activeTab === 'email' && (
            <form onSubmit={handleChangeEmail} style={{ display: 'grid', gap: '1.5rem' }}>
              <h3 style={{ color: '#f0f9ff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Cambiar Correo Electrónico
              </h3>

              {emailError && <ErrorMessage message={emailError} />}
              {emailSuccess && <SuccessMessage message={emailSuccess} />}

              <InputField
                label="Nuevo Correo Electrónico"
                type="email"
                value={emailForm.newEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailForm({...emailForm, newEmail: e.target.value})}
                required
              />

              <InputField
                label="Confirma tu Contraseña"
                type="password"
                value={emailForm.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailForm({...emailForm, password: e.target.value})}
                required
                hint="Por seguridad, confirma tu contraseña actual"
              />

              <button type="submit" style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
              }}>
                ✉️ Cambiar Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares
function InfoField({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '0.875rem',
        color: '#94a3b8',
        marginBottom: '0.5rem',
        fontWeight: '500',
      }}>
        {label}
      </label>
      <div style={{
        padding: '0.75rem 1rem',
        background: badge ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.5)',
        border: badge ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(71, 85, 105, 0.3)',
        borderRadius: '8px',
        color: badge ? '#38bdf8' : '#f0f9ff',
        fontSize: '1rem',
        fontWeight: badge ? '600' : 'normal',
        textTransform: badge ? 'uppercase' : 'none',
      }}>
        {value}
      </div>
    </div>
  );
}

function InputField({ label, type, value, onChange, required, hint }: any) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '0.875rem',
        color: '#94a3b8',
        marginBottom: '0.5rem',
        fontWeight: '500',
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          borderRadius: '8px',
          color: '#f0f9ff',
          fontSize: '1rem',
        }}
      />
      {hint && (
        <span style={{
          display: 'block',
          marginTop: '0.25rem',
          fontSize: '0.75rem',
          color: '#64748b',
        }}>
          {hint}
        </span>
      )}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div style={{
      padding: '0.75rem 1rem',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '8px',
      color: '#ef4444',
      fontSize: '0.875rem',
    }}>
      ❌ {message}
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div style={{
      padding: '0.75rem 1rem',
      background: 'rgba(34, 197, 94, 0.1)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      borderRadius: '8px',
      color: '#22c55e',
      fontSize: '0.875rem',
    }}>
      ✅ {message}
    </div>
  );
}
