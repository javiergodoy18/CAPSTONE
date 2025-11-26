'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import SearchBar from '../components/SearchBar';
import styles from './Vehicles.module.css';

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  status: string;
  _count?: {
    dispatches: number;
  };
}

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchQuery]);

  const loadVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = [...vehicles];

    if (searchQuery) {
      filtered = filtered.filter((vehicle) =>
        vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVehicles(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este vehículo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      loadVehicles();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el vehículo');
    }
  };

  const statusLabels: Record<string, string> = {
    available: 'Disponible',
    in_use: 'En Uso',
    maintenance: 'Mantenimiento',
    inactive: 'Inactivo',
  };

  const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    available: 'success',
    in_use: 'default',
    maintenance: 'warning',
    inactive: 'danger',
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Cargando vehículos...</p>
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
              <span className={styles.titleIcon}>🚗</span>
              Gestión de Vehículos
            </h1>
            <p className={styles.subtitle}>
              {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehículo' : 'vehículos'} en la flota
            </p>
          </div>
          <Link href="/vehicles/new">
            <Button size="lg" glow icon={<span>+</span>}>
              Nuevo Vehículo
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className={styles.filters}>
          <SearchBar
            placeholder="Buscar por patente, marca o modelo..."
            onSearch={setSearchQuery}
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <Card variant="glass" padding="lg">
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚗</div>
            <h3 className={styles.emptyTitle}>No hay vehículos</h3>
            <p className={styles.emptyDescription}>
              {searchQuery
                ? 'No se encontraron vehículos con los filtros aplicados'
                : 'Comienza agregando tu primer vehículo a la flota'}
            </p>
            {!searchQuery && (
              <Link href="/vehicles/new">
                <Button icon={<span>+</span>}>Agregar Primer Vehículo</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {filteredVehicles.map((vehicle, index) => (
            <Card
              key={vehicle.id}
              hover
              padding="lg"
              className={styles.vehicleCard}
            >
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.vehiclePatent}>
                  <span className={styles.patentLabel}>🚗</span>
                  {vehicle.plate}
                </div>
                <Badge variant={statusVariants[vehicle.status]} dot>
                  {statusLabels[vehicle.status]}
                </Badge>
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                <div className={styles.vehicleInfo}>
                  <div className={styles.vehicleBrand}>
                    {vehicle.brand} {vehicle.model}
                  </div>
                  <div className={styles.vehicleDetails}>
                    <span className={styles.detail}>
                      <span className={styles.detailIcon}>📅</span>
                      Año {vehicle.year}
                    </span>
                    <span className={styles.detail}>
                      <span className={styles.detailIcon}>📦</span>
                      {vehicle.capacity} kg
                    </span>
                  </div>
                </div>

                {vehicle._count && (
                  <div className={styles.vehicleStats}>
                    <div className={styles.statBadge}>
                      <span className={styles.statValue}>{vehicle._count.dispatches}</span>
                      <span className={styles.statLabel}>viajes</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className={styles.cardActions}>
                <Link href={`/vehicles/${vehicle.id}/edit`} className={styles.actionLink}>
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
                    handleDelete(vehicle.id);
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
