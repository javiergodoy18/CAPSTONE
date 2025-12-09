'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import styles from './Dispatches.module.css';

interface Dispatch {
  id: string;
  dispatchNumber: string;
  status: string;
  scheduledStartDate: string;
  scheduledEndDate: string | null;
  totalMerchandiseValue: number;
  totalIncome: number;
  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
  } | null;
  driver: {
    id: string;
    name: string;
    phone: string;
  } | null;
  pickups: {
    id: string;
    laboratory: { name: string };
    deliveries: any[];
  }[];
}

export default function DispatchesPage() {
  const router = useRouter();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [filteredDispatches, setFilteredDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadDispatches();
  }, []);

  useEffect(() => {
    filterDispatches();
  }, [dispatches, searchQuery, statusFilter]);

  const loadDispatches = async () => {
    try {
      console.log('🔍 Fetching dispatches...');
      const response = await fetch('/api/dispatches');
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Data received:', data);
      console.log('📊 Is array?', Array.isArray(data));
      console.log('📈 Data length:', Array.isArray(data) ? data.length : 'not an array');
      setDispatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error loading dispatches:', error);
      setDispatches([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDispatches = () => {
    let filtered = Array.isArray(dispatches) ? [...dispatches] : [];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((dispatch) =>
        dispatch.dispatchNumber.toLowerCase().includes(query) ||
        dispatch.vehicle?.plate?.toLowerCase().includes(query) ||
        dispatch.driver?.name?.toLowerCase().includes(query) ||
        dispatch.pickups.some(p => p.laboratory.name.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((dispatch) => dispatch.status === statusFilter);
    }

    // Sort by date descending
    filtered.sort((a, b) =>
      new Date(b.scheduledStartDate).getTime() - new Date(a.scheduledStartDate).getTime()
    );

    setFilteredDispatches(filtered);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('¿Estás seguro de eliminar este viaje?')) {
      return;
    }

    try {
      const response = await fetch(`/api/dispatches/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar');
      }

      loadDispatches();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar el viaje');
    }
  };

  const statusLabels: Record<string, string> = {
    scheduled: 'Programado',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'purple'> = {
    scheduled: 'default',
    in_progress: 'purple',
    completed: 'success',
    cancelled: 'danger',
  };

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'scheduled', label: 'Programados' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completados' },
    { value: 'cancelled', label: 'Cancelados' },
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Cargando viajes...</p>
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
              <span className={styles.titleIcon}>🚛</span>
              Gestión de Viajes
            </h1>
            <p className={styles.subtitle}>
              {filteredDispatches.length} {filteredDispatches.length === 1 ? 'viaje' : 'viajes'}
              {statusFilter !== 'all' && ` - ${statusOptions.find(o => o.value === statusFilter)?.label}`}
            </p>
          </div>
          <Link href="/dispatches/new">
            <Button size="lg" glow icon={<span>+</span>}>
              Nuevo Viaje
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <SearchBar
            placeholder="Buscar por número, vehículo, conductor o laboratorio..."
            onSearch={setSearchQuery}
          />
          <FilterSelect
            label="Estado"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Dispatches Grid */}
      {filteredDispatches.length === 0 ? (
        <Card variant="glass" padding="lg">
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h3 className={styles.emptyTitle}>No hay viajes</h3>
            <p className={styles.emptyDescription}>
              {searchQuery || statusFilter !== 'all'
                ? 'No se encontraron viajes con los filtros aplicados'
                : 'Comienza creando tu primer viaje'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/dispatches/new">
                <Button icon={<span>+</span>}>Crear Primer Viaje</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {filteredDispatches.map((dispatch, index) => {
            const totalDeliveries = dispatch.pickups.reduce(
              (sum, p) => sum + p.deliveries.length, 0
            );

            return (
              <Card
                key={dispatch.id}
                hover
                padding="lg"
                className={styles.dispatchCard}
                onClick={() => router.push(`/dispatches/${dispatch.id}`)}
              >
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.dispatchNumber}>
                    <span className={styles.numberLabel}>#</span>
                    {dispatch.dispatchNumber}
                  </div>
                  <Badge
                    variant={statusVariants[dispatch.status]}
                    dot
                    pulse={dispatch.status === 'in_progress'}
                  >
                    {statusLabels[dispatch.status] || dispatch.status}
                  </Badge>
                </div>

                {/* Card Content */}
                <div className={styles.cardContent}>
                  {/* Vehicle Info */}
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}>🚗</span>
                    <div className={styles.infoText}>
                      <div className={styles.infoLabel}>Vehículo</div>
                      <div className={styles.infoValue}>
                        {dispatch.vehicle?.plate || 'Sin asignar'}
                        {dispatch.vehicle && (
                          <span className={styles.infoExtra}>
                            {dispatch.vehicle.brand} {dispatch.vehicle.model}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}>👤</span>
                    <div className={styles.infoText}>
                      <div className={styles.infoLabel}>Conductor</div>
                      <div className={styles.infoValue}>
                        {dispatch.driver?.name || 'Sin asignar'}
                        {dispatch.driver?.phone && (
                          <span className={styles.infoExtra}>{dispatch.driver.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}>📅</span>
                    <div className={styles.infoText}>
                      <div className={styles.infoLabel}>Fecha Programada</div>
                      <div className={styles.infoValue}>
                        {new Date(dispatch.scheduledStartDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Pickups & Deliveries */}
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}>📦</span>
                    <div className={styles.infoText}>
                      <div className={styles.infoLabel}>Ruta</div>
                      <div className={styles.infoValue}>
                        {dispatch.pickups.length} {dispatch.pickups.length === 1 ? 'pickup' : 'pickups'} · {totalDeliveries} {totalDeliveries === 1 ? 'entrega' : 'entregas'}
                      </div>
                    </div>
                  </div>

                  {/* Financial */}
                  {(dispatch.totalMerchandiseValue > 0 || dispatch.totalIncome > 0) && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoIcon}>💰</span>
                      <div className={styles.infoText}>
                        <div className={styles.infoLabel}>Ingreso</div>
                        <div className={styles.infoValueMoney}>
                          ${dispatch.totalIncome.toLocaleString('es-CL')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className={styles.cardActions}>
                  <Link href={`/dispatches/${dispatch.id}`} className={styles.actionLink} onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" icon={<span>👁️</span>} fullWidth>
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/dispatches/${dispatch.id}`} className={styles.actionLink} onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" icon={<span>✏️</span>} fullWidth>
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<span>🗑️</span>}
                    fullWidth
                    onClick={(e) => handleDelete(e, dispatch.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
