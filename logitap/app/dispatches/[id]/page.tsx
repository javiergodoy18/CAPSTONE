import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Badge from '@/app/components/Badge';
import Tabs from '@/app/components/Tabs';
import MapView from '@/app/components/MapView';
import DateDisplay from '@/app/components/DateDisplay';
import styles from './DispatchDetail.module.css';

export default async function DispatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dispatch = await prisma.dispatch.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
      pickups: {
        include: {
          laboratory: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              latitude: true,
              longitude: true,
            },
          },
          deliveries: {
            include: {
              pharmacy: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!dispatch) {
    notFound();
  }

  const statusLabels: Record<string, string> = {
    scheduled: 'Programado',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    scheduled: 'default',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };

  // Preparar datos para MapView
  const mapPickups = dispatch.pickups.map(p => ({
    id: p.id,
    laboratory: p.laboratory ? {
      id: p.laboratory.id,
      name: p.laboratory.name,
      address: p.laboratory.address,
      latitude: p.laboratory.latitude ? Number(p.laboratory.latitude) : null,
      longitude: p.laboratory.longitude ? Number(p.laboratory.longitude) : null,
    } : null,
  }));

  const mapDeliveries = dispatch.pickups.flatMap(p =>
    p.deliveries.map(d => ({
      id: d.id,
      pharmacy: d.pharmacy ? {
        id: d.pharmacy.id,
        name: d.pharmacy.name,
        address: d.pharmacy.address,
        latitude: d.pharmacy.latitude ? Number(d.pharmacy.latitude) : null,
        longitude: d.pharmacy.longitude ? Number(d.pharmacy.longitude) : null,
      } : null,
    }))
  );

  const tabs = [
    {
      id: 'overview',
      label: 'Vista General',
      icon: '📊',
      content: (
        <div className={styles.overview}>
          {/* Status y Acciones */}
          <div className={styles.statusBar}>
            <Badge
              variant={statusVariants[dispatch.status]}
              size="lg"
              dot
              pulse={dispatch.status === 'in_progress'}
            >
              {statusLabels[dispatch.status]}
            </Badge>
            <div className={styles.statusActions}>
              <Link href={`/dispatches/${dispatch.id}/edit`}>
                <Button variant="ghost" icon={<span>✏️</span>}>
                  Editar
                </Button>
              </Link>
              <Button variant="primary" icon={<span>🚀</span>}>
                Iniciar Viaje
              </Button>
            </div>
          </div>

          {/* Grid de información */}
          <div className={styles.infoGrid}>
            {/* Vehículo */}
            <Card variant="glass" padding="lg" hover>
              <div className={styles.infoCard}>
                <div className={styles.infoHeader}>
                  <span className={styles.infoIcon}>🚗</span>
                  <h3 className={styles.infoTitle}>Vehículo</h3>
                </div>
                <div className={styles.infoContent}>
                  <div className={styles.infoMain}>{dispatch.vehicle?.plate || 'Sin vehículo'}</div>
                  <div className={styles.infoSecondary}>
                    {dispatch.vehicle?.brand} {dispatch.vehicle?.model}
                  </div>
                  <div className={styles.infoDetail}>
                    Año: {dispatch.vehicle?.year}
                  </div>
                </div>
              </div>
            </Card>

            {/* Conductor */}
            <Card variant="glass" padding="lg" hover>
              <div className={styles.infoCard}>
                <div className={styles.infoHeader}>
                  <span className={styles.infoIcon}>👤</span>
                  <h3 className={styles.infoTitle}>Conductor</h3>
                </div>
                <div className={styles.infoContent}>
                  <div className={styles.infoMain}>
                    {dispatch.driver?.name || 'Sin conductor'}
                  </div>
                  <div className={styles.infoSecondary}>
                    {dispatch.driver?.phone || 'Sin teléfono'}
                  </div>
                  <div className={styles.infoDetail}>
                    {dispatch.driver?.email || 'Sin email'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Fecha de Inicio */}
            <Card variant="glass" padding="lg" hover>
              <div className={styles.infoCard}>
                <div className={styles.infoHeader}>
                  <span className={styles.infoIcon}>📅</span>
                  <h3 className={styles.infoTitle}>Inicio Programado</h3>
                </div>
                <div className={styles.infoContent}>
                  <div className={styles.infoMain}>
                    <DateDisplay dateString={dispatch.scheduledStartDate.toISOString()} format="short" />
                  </div>
                  <div className={styles.infoSecondary}>
                    <DateDisplay dateString={dispatch.scheduledStartDate.toISOString()} format="time" />
                  </div>
                  {dispatch.actualStartDate && (
                    <div className={styles.infoDetail}>
                      Inicio real: <DateDisplay dateString={dispatch.actualStartDate.toISOString()} format="short" />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Fecha de Fin */}
            <Card variant="glass" padding="lg" hover>
              <div className={styles.infoCard}>
                <div className={styles.infoHeader}>
                  <span className={styles.infoIcon}>🏁</span>
                  <h3 className={styles.infoTitle}>Fin Programado</h3>
                </div>
                <div className={styles.infoContent}>
                  <div className={styles.infoMain}>
                    {dispatch.scheduledEndDate ? (
                      <DateDisplay dateString={dispatch.scheduledEndDate.toISOString()} format="short" />
                    ) : (
                      'Sin fecha'
                    )}
                  </div>
                  <div className={styles.infoSecondary}>
                    {dispatch.scheduledEndDate ? (
                      <DateDisplay dateString={dispatch.scheduledEndDate.toISOString()} format="time" />
                    ) : (
                      ''
                    )}
                  </div>
                  {dispatch.actualEndDate && (
                    <div className={styles.infoDetail}>
                      Fin real: <DateDisplay dateString={dispatch.actualEndDate.toISOString()} format="short" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Estadísticas */}
          <div className={styles.statsRow}>
            <Card variant="highlighted" padding="md">
              <div className={styles.statItem}>
                <div className={styles.statIcon}>📦</div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{dispatch.pickups.length}</div>
                  <div className={styles.statLabel}>Pickups</div>
                </div>
              </div>
            </Card>
            <Card variant="highlighted" padding="md">
              <div className={styles.statItem}>
                <div className={styles.statIcon}>🏢</div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>
                    {mapDeliveries.length}
                  </div>
                  <div className={styles.statLabel}>Deliveries</div>
                </div>
              </div>
            </Card>
            <Card variant="highlighted" padding="md">
              <div className={styles.statItem}>
                <div className={styles.statIcon}>📍</div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>
                    {dispatch.pickups.length + mapDeliveries.length}
                  </div>
                  <div className={styles.statLabel}>Puntos Totales</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'map',
      label: 'Mapa y Ruta',
      icon: '🗺️',
      content: (
        <div className={styles.mapSection}>
          <MapView pickups={mapPickups} deliveries={mapDeliveries} />
        </div>
      ),
    },
    {
      id: 'pickups',
      label: 'Pickups & Deliveries',
      icon: '📦',
      content: (
        <div className={styles.pickupsSection}>
          {dispatch.pickups.length === 0 ? (
            <Card variant="glass" padding="lg">
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📦</div>
                <h3 className={styles.emptyTitle}>No hay pickups configurados</h3>
                <p className={styles.emptyDescription}>
                  Agrega puntos de carga para comenzar a planificar la ruta
                </p>
                <Button icon={<span>+</span>}>Agregar Pickup</Button>
              </div>
            </Card>
          ) : (
            <div className={styles.pickupsList}>
              {dispatch.pickups.map((pickup, index) => (
                <Card key={pickup.id} variant="glass" padding="lg" hover>
                  <div className={styles.pickupCard}>
                    <div className={styles.pickupHeader}>
                      <div className={styles.pickupNumber}>
                        <span className={styles.pickupBadge}>{index + 1}</span>
                        <div>
                          <h3 className={styles.pickupTitle}>
                            {pickup.laboratory?.name || 'Laboratorio sin nombre'}
                          </h3>
                          <p className={styles.pickupAddress}>
                            {pickup.laboratory?.address}, {pickup.laboratory?.city}
                          </p>
                        </div>
                      </div>
                      <Badge variant="info" size="sm">
                        Pickup
                      </Badge>
                    </div>

                    {pickup.deliveries.length > 0 && (
                      <div className={styles.deliveriesSection}>
                        <h4 className={styles.deliveriesTitle}>
                          <span>🏢</span>
                          Entregas desde este pickup ({pickup.deliveries.length})
                        </h4>
                        <div className={styles.deliveriesList}>
                          {pickup.deliveries.map((delivery, dIndex) => (
                            <div key={delivery.id} className={styles.deliveryItem}>
                              <span className={styles.deliveryNumber}>{dIndex + 1}</span>
                              <div className={styles.deliveryInfo}>
                                <div className={styles.deliveryName}>
                                  {delivery.pharmacy?.name || 'Farmacia sin nombre'}
                                </div>
                                <div className={styles.deliveryAddress}>
                                  {delivery.pharmacy?.address}, {delivery.pharmacy?.city}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/dispatches" className={styles.backButton}>
          ← Volver a Viajes
        </Link>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>
              <span className={styles.titleIcon}>🚛</span>
              Viaje {dispatch.dispatchNumber}
            </h1>
            <p className={styles.subtitle}>
              Detalles completos y seguimiento del viaje
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card variant="glass" padding="lg">
        <Tabs tabs={tabs} defaultTab="overview" />
      </Card>
    </div>
  );
}
