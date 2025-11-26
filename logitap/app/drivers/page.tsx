'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import SearchBar from '../components/SearchBar';
import styles from './Drivers.module.css';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  status: string;
  _count?: {
    dispatches: number;
  };
}

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [drivers, searchQuery]);

  const loadDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    let filtered = [...drivers];

    if (searchQuery) {
      filtered = filtered.filter((driver) =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.license.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDrivers(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este conductor?')) {
      return;
    }

    try {
      const response = await fetch(`/api/drivers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      loadDrivers();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el conductor');
    }
  };

  const statusLabels: Record<string, string> = {
    available: 'Disponible',
    busy: 'Ocupado',
    inactive: 'Inactivo',
  };

  const statusVariants: Record<string, 'success' | 'danger' | 'warning'> = {
    available: 'success',
    busy: 'warning',
    inactive: 'danger',
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Cargando conductores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>
              <span className={styles.titleIcon}>👤</span>
              Gestión de Conductores
            </h1>
            <p className={styles.subtitle}>
              {filteredDrivers.length} {filteredDrivers.length === 1 ? 'conductor' : 'conductores'} en la plantilla
            </p>
          </div>
          <Link href="/drivers/new">
            <Button size="lg" glow icon={<span>+</span>}>
              Nuevo Conductor
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className={styles.filters}>
          <SearchBar
            placeholder="Buscar por nombre, email o licencia..."
            onSearch={setSearchQuery}
          />
        </div>
      </div>

      {/* Drivers Grid */}
      {filteredDrivers.length === 0 ? (
        <Card variant="glass" padding="lg">
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👤</div>
            <h3 className={styles.emptyTitle}>No hay conductores</h3>
            <p className={styles.emptyDescription}>
              {searchQuery
                ? 'No se encontraron conductores con los filtros aplicados'
                : 'Comienza agregando tu primer conductor'}
            </p>
            {!searchQuery && (
              <Link href="/drivers/new">
                <Button icon={<span>+</span>}>Agregar Primer Conductor</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {filteredDrivers.map((driver, index) => (
            <Card
              key={driver.id}
              hover
              padding="lg"
              className={styles.driverCard}
            >
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.driverAvatar}>
                  <span className={styles.avatarIcon}>👤</span>
                </div>
                <Badge variant={statusVariants[driver.status]} dot>
                  {statusLabels[driver.status]}
                </Badge>
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                <h3 className={styles.driverName}>{driver.name}</h3>

                <div className={styles.driverInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📧</span>
                    <span className={styles.infoText}>{driver.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📱</span>
                    <span className={styles.infoText}>{driver.phone}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>🪪</span>
                    <span className={styles.infoText}>{driver.license}</span>
                  </div>
                </div>

                {driver._count && (
                  <div className={styles.driverStats}>
                    <div className={styles.statBadge}>
                      <span className={styles.statValue}>{driver._count.dispatches}</span>
                      <span className={styles.statLabel}>viajes</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className={styles.cardActions}>
                <Link href={`/drivers/${driver.id}/edit`} className={styles.actionLink}>
                  <Button variant="ghost" size="sm" icon={<span>✏️</span>} fullWidth>
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<span>🗑️</span>}
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(driver.id);
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
