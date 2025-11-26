'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import SearchBar from '../components/SearchBar';
import styles from './Laboratories.module.css';

interface Laboratory {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  contactPerson?: string;
  latitude?: number | null;
  longitude?: number | null;
  _count?: {
    pickups: number;
  };
}

export default function LaboratoriesPage() {
  const router = useRouter();
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [filteredLaboratories, setFilteredLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLaboratories();
  }, []);

  useEffect(() => {
    filterLaboratories();
  }, [laboratories, searchQuery]);

  const loadLaboratories = async () => {
    try {
      const response = await fetch('/api/laboratories');
      const data = await response.json();
      setLaboratories(data);
    } catch (error) {
      console.error('Error loading laboratories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLaboratories = () => {
    let filtered = [...laboratories];

    if (searchQuery) {
      filtered = filtered.filter((lab) =>
        lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lab.contactPerson && lab.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredLaboratories(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este laboratorio?')) {
      return;
    }

    try {
      const response = await fetch(`/api/laboratories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      loadLaboratories();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el laboratorio');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Cargando laboratorios...</p>
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
              <span className={styles.titleIcon}>🏥</span>
              Gestión de Laboratorios
            </h1>
            <p className={styles.subtitle}>
              {filteredLaboratories.length} {filteredLaboratories.length === 1 ? 'laboratorio' : 'laboratorios'} registrados
            </p>
          </div>
          <Link href="/laboratories/new">
            <Button size="lg" glow icon={<span>+</span>}>
              Nuevo Laboratorio
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className={styles.filters}>
          <SearchBar
            placeholder="Buscar por nombre, email, ciudad o contacto..."
            onSearch={setSearchQuery}
          />
        </div>
      </div>

      {/* Laboratories Grid */}
      {filteredLaboratories.length === 0 ? (
        <Card variant="glass" padding="lg">
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏥</div>
            <h3 className={styles.emptyTitle}>No hay laboratorios</h3>
            <p className={styles.emptyDescription}>
              {searchQuery
                ? 'No se encontraron laboratorios con los filtros aplicados'
                : 'Comienza agregando tu primer laboratorio'}
            </p>
            {!searchQuery && (
              <Link href="/laboratories/new">
                <Button icon={<span>+</span>}>Agregar Primer Laboratorio</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {filteredLaboratories.map((laboratory) => (
            <Card
              key={laboratory.id}
              hover
              padding="lg"
              className={styles.laboratoryCard}
            >
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.laboratoryIcon}>
                  <span className={styles.icon}>🏥</span>
                </div>
                {(laboratory.latitude && laboratory.longitude) && (
                  <Badge variant="success" size="sm" dot>
                    Geolocalizado
                  </Badge>
                )}
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                <h3 className={styles.laboratoryName}>{laboratory.name}</h3>

                <div className={styles.laboratoryInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📍</span>
                    <span className={styles.infoText}>
                      {laboratory.address}, {laboratory.city}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📧</span>
                    <span className={styles.infoText}>{laboratory.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📱</span>
                    <span className={styles.infoText}>{laboratory.phone}</span>
                  </div>
                  {laboratory.contactPerson && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoIcon}>👤</span>
                      <span className={styles.infoText}>{laboratory.contactPerson}</span>
                    </div>
                  )}
                </div>

                {laboratory._count && (
                  <div className={styles.laboratoryStats}>
                    <div className={styles.statBadge}>
                      <span className={styles.statValue}>{laboratory._count.pickups}</span>
                      <span className={styles.statLabel}>pickups</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className={styles.cardActions}>
                <Link href={`/laboratories/${laboratory.id}/edit`} className={styles.actionLink}>
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
                    handleDelete(laboratory.id);
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
