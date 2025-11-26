'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import SearchBar from '../components/SearchBar';
import styles from './Pharmacies.module.css';

interface Pharmacy {
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
    deliveries: number;
  };
}

export default function PharmaciesPage() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPharmacies();
  }, []);

  useEffect(() => {
    filterPharmacies();
  }, [pharmacies, searchQuery]);

  const loadPharmacies = async () => {
    try {
      const response = await fetch('/api/pharmacies');
      const data = await response.json();
      setPharmacies(data);
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPharmacies = () => {
    let filtered = [...pharmacies];

    if (searchQuery) {
      filtered = filtered.filter((pharmacy) =>
        pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharmacy.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharmacy.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pharmacy.contactPerson && pharmacy.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPharmacies(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta farmacia?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pharmacies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      loadPharmacies();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la farmacia');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Cargando farmacias...</p>
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
              <span className={styles.titleIcon}>💊</span>
              Gestión de Farmacias
            </h1>
            <p className={styles.subtitle}>
              {filteredPharmacies.length} {filteredPharmacies.length === 1 ? 'farmacia' : 'farmacias'} registradas
            </p>
          </div>
          <Link href="/pharmacies/new">
            <Button size="lg" glow icon={<span>+</span>}>
              Nueva Farmacia
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

      {/* Pharmacies Grid */}
      {filteredPharmacies.length === 0 ? (
        <Card variant="glass" padding="lg">
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💊</div>
            <h3 className={styles.emptyTitle}>No hay farmacias</h3>
            <p className={styles.emptyDescription}>
              {searchQuery
                ? 'No se encontraron farmacias con los filtros aplicados'
                : 'Comienza agregando tu primera farmacia'}
            </p>
            {!searchQuery && (
              <Link href="/pharmacies/new">
                <Button icon={<span>+</span>}>Agregar Primera Farmacia</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {filteredPharmacies.map((pharmacy) => (
            <Card
              key={pharmacy.id}
              hover
              padding="lg"
              className={styles.pharmacyCard}
            >
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.pharmacyIcon}>
                  <span className={styles.icon}>💊</span>
                </div>
                {(pharmacy.latitude && pharmacy.longitude) && (
                  <Badge variant="success" size="sm" dot>
                    Geolocalizado
                  </Badge>
                )}
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                <h3 className={styles.pharmacyName}>{pharmacy.name}</h3>

                <div className={styles.pharmacyInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📍</span>
                    <span className={styles.infoText}>
                      {pharmacy.address}, {pharmacy.city}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📧</span>
                    <span className={styles.infoText}>{pharmacy.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📱</span>
                    <span className={styles.infoText}>{pharmacy.phone}</span>
                  </div>
                  {pharmacy.contactPerson && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoIcon}>👤</span>
                      <span className={styles.infoText}>{pharmacy.contactPerson}</span>
                    </div>
                  )}
                </div>

                {pharmacy._count && (
                  <div className={styles.pharmacyStats}>
                    <div className={styles.statBadge}>
                      <span className={styles.statValue}>{pharmacy._count.deliveries}</span>
                      <span className={styles.statLabel}>deliveries</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className={styles.cardActions}>
                <Link href={`/pharmacies/${pharmacy.id}/edit`} className={styles.actionLink}>
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
                    handleDelete(pharmacy.id);
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
