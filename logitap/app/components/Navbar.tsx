'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isDriver } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* User Menu */}
        {user && (
          <div className={styles.userMenu}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.role === 'ADMIN' ? '👨‍💼' : '🚗'}
              </div>
              <div className={styles.userDetails}>
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
            >
              Salir
            </Button>
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
    </nav>
  );
}
