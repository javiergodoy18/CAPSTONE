'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin, isDriver } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // No mostrar navbar en login
  if (pathname === '/login') {
    return null;
  }

  // Items de navegación según el rol
  const navItems = isDriver ? [
    { href: '/driver/dashboard', label: 'Mi Dashboard', icon: '📊' },
    { href: '/driver/dispatches', label: 'Mis Viajes', icon: '🚛' },
  ] : [
    { href: '/dispatches', label: 'Viajes', icon: '🚛' },
    { href: '/vehicles', label: 'Vehículos', icon: '🚗' },
    { href: '/drivers', label: 'Conductores', icon: '👤' },
    { href: '/laboratories', label: 'Laboratorios', icon: '🏢' },
    { href: '/pharmacies', label: 'Farmacias', icon: '💊' },
  ];

  // Datos del usuario para mostrar
  const profileImage = (user as any)?.profileImage || null;
  const displayName = user?.name || 'Usuario';

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href={isDriver ? '/driver/dashboard' : '/'} className={styles.logo}>
          <div className={styles.logoIcon}>🚚</div>
          <span className={styles.logoText}>
            <span className={styles.logoMain}>LOGITAP</span>
            <span className={styles.logoSub}>Transport System</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.navItems}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                pathname.startsWith(item.href) ? styles.active : ''
              }`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {pathname.startsWith(item.href) && (
                <div className={styles.activeIndicator} />
              )}
            </Link>
          ))}
        </div>

        {/* User Menu with Dropdown */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                color: '#38bdf8',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
              }}
            >
              {/* Avatar del usuario con imagen real */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: profileImage
                  ? `url(${profileImage}) center/cover`
                  : 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
                border: '2px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 2px 8px rgba(56, 189, 248, 0.2)',
              }}>
                {!profileImage && '👤'}
              </div>

              {/* Info del usuario - MEJORADA */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                lineHeight: '1.3',
                flex: 1,
                minWidth: 0,
              }}>
                {/* Nombre del usuario */}
                <span style={{
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#f0f9ff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  letterSpacing: '0.01em',
                }}>
                  {displayName}
                </span>

                {/* Rol debajo del nombre */}
                <span style={{
                  fontSize: '0.6875rem',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: '500',
                  marginTop: '1px',
                }}>
                  {user.role || 'ADMIN'}
                </span>
              </div>

              {/* Ícono dropdown */}
              <div style={{
                fontSize: '0.75rem',
                color: '#64748b',
                transition: 'transform 0.2s',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>
                ▼
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Overlay para cerrar al hacer click afuera */}
                <div
                  onClick={() => setIsDropdownOpen(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 40,
                  }}
                />

                {/* Menu */}
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  minWidth: '220px',
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                  zIndex: 50,
                  overflow: 'hidden',
                  animation: 'slideDown 0.2s ease-out',
                }}>
                  {/* Header del dropdown */}
                  <div style={{
                    padding: '1.25rem',
                    borderBottom: '1px solid rgba(56, 189, 248, 0.1)',
                    background: 'rgba(56, 189, 248, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    {/* Avatar grande en el dropdown */}
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: profileImage
                        ? `url(${profileImage}) center/cover`
                        : 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      flexShrink: 0,
                      border: '2px solid rgba(56, 189, 248, 0.3)',
                    }}>
                      {!profileImage && '👤'}
                    </div>

                    {/* Info del usuario */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        marginBottom: '0.25rem',
                      }}>
                        Conectado como
                      </div>
                      <div style={{
                        fontSize: '1.0625rem',
                        fontWeight: '600',
                        color: '#f0f9ff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {displayName}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#38bdf8',
                        marginTop: '0.25rem',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        letterSpacing: '0.05em',
                      }}>
                        {user.role === 'ADMIN' ? 'ADMINISTRADOR' : 'CONDUCTOR'}
                      </div>
                      {user.email && (
                        <div style={{
                          fontSize: '0.6875rem',
                          color: '#64748b',
                          marginTop: '0.375rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Opciones del menú */}
                  <div style={{ padding: '0.5rem' }}>
                    {/* Ver Perfil */}
                    <button
                      onClick={() => {
                        router.push('/profile');
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.875rem',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
                        e.currentTarget.style.color = '#38bdf8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#cbd5e1';
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>👤</span>
                      <span>Ver Perfil</span>
                    </button>

                    {/* Salir */}
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.875rem',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#cbd5e1';
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>🚪</span>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`${styles.hamburger} ${mobileMenuOpen ? styles.open : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        {navItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.mobileNavItem} ${
              pathname.startsWith(item.href) ? styles.active : ''
            }`}
            onClick={() => setMobileMenuOpen(false)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}

        {user && (
          <div className={styles.mobileUserSection}>
            <div className={styles.mobileUserInfo}>
              <div className={styles.userAvatar}>
                {user.role === 'ADMIN' ? '👨‍💼' : '🚗'}
              </div>
              <div>
                <div className={styles.userName}>{user.name}</div>
                <div className={styles.userRole}>
                  {user.role === 'ADMIN' ? 'Administrador' : 'Conductor'}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<span>🚪</span>}
              onClick={logout}
              fullWidth
            >
              Cerrar Sesión
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* CSS para animación del dropdown */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
}
