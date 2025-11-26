import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Card from '@/app/components/Card';
import Badge from '@/app/components/Badge';
import Link from 'next/link';
import styles from './DriverDispatches.module.css';

export default async function DriverDispatchesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const session = await validateSession(token);

  if (!session || session.user.role !== 'DRIVER') {
    redirect('/login');
  }

  const user = session.user;

  if (!user.driver) {
    return (
      <div className={styles.container}>
        <Card variant="glass" padding="lg">
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3 className={styles.errorTitle}>Error de Configuración</h3>
            <p className={styles.errorDescription}>
              No tienes un perfil de conductor asignado. Contacta al administrador.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Obtener todos los viajes del conductor
  const dispatches = await prisma.dispatch.findMany({
    where: {
      driverId: user.driver.id,
    },
    orderBy: {
      scheduledStartDate: 'desc',
    },
    include: {
      vehicle: true,
      pickups: {
        include: {
          laboratory: true,
          deliveries: {
            include: {
              pharmacy: true,
            },
          },
        },
      },
    },
  });

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

  // Agrupar por estado
  const scheduled = dispatches.filter(d => d.status === 'scheduled');
  const inProgress = dispatches.filter(d => d.status === 'in_progress');
  const completed = dispatches.filter(d => d.status === 'completed');

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🚛</span>
            Mis Viajes
          </h1>
          <p className={styles.subtitle}>
            Gestiona todos tus viajes asignados
          </p>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{scheduled.length}</div>
            <div className={styles.statLabel}>Programados</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{inProgress.length}</div>
            <div className={styles.statLabel}>En Progreso</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{completed.length}</div>
            <div className={styles.statLabel}>Completados</div>
          </div>
        </div>
      </div>

      {/* Tabs de estado */}
      <div className={styles.sections}>
        {/* En Progreso */}
        {inProgress.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⚡</span>
              En Progreso ({inProgress.length})
            </h2>
            <div className={styles.dispatchGrid}>
              {inProgress.map((dispatch) => (
                <Link
                  key={dispatch.id}
                  href={`/dispatches/${dispatch.id}`}
                  className={styles.dispatchLink}
                >
                  <Card hover padding="lg" variant="highlighted">
                    <div className={styles.dispatchCard}>
                      <div className={styles.cardHeader}>
                        <div className={styles.dispatchNumber}>
                          {dispatch.dispatchNumber}
                        </div>
                        <Badge variant="warning" dot pulse>
                          {statusLabels[dispatch.status]}
                        </Badge>
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.infoRow}>
                          <span className={styles.infoIcon}>🚗</span>
                          <span className={styles.infoText}>
                            {dispatch.vehicle?.plate} - {dispatch.vehicle?.brand}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoIcon}>📅</span>
                          <span className={styles.infoText}>
                            Inicio: {new Date(dispatch.scheduledStartDate).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoIcon}>📦</span>
                          <span className={styles.infoText}>
                            {dispatch.pickups.length} pickups - {dispatch.pickups.reduce((acc, p) => acc + p.deliveries.length, 0)} entregas
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Programados */}
        {scheduled.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📅</span>
              Programados ({scheduled.length})
            </h2>
            <div className={styles.dispatchGrid}>
              {scheduled.map((dispatch) => (
                <Link
                  key={dispatch.id}
                  href={`/dispatches/${dispatch.id}`}
                  className={styles.dispatchLink}
                >
                  <Card hover padding="lg">
                    <div className={styles.dispatchCard}>
                      <div className={styles.cardHeader}>
                        <div className={styles.dispatchNumber}>
                          {dispatch.dispatchNumber}
                        </div>
                        <Badge variant="default">
                          {statusLabels[dispatch.status]}
                        </Badge>
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.infoRow}>
                          <span className={styles.infoIcon}>🚗</span>
                          <span className={styles.infoText}>
                            {dispatch.vehicle?.plate} - {dispatch.vehicle?.brand}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoIcon}>📅</span>
                          <span className={styles.infoText}>
                            Inicio: {new Date(dispatch.scheduledStartDate).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoIcon}>📦</span>
                          <span className={styles.infoText}>
                            {dispatch.pickups.length} pickups - {dispatch.pickups.reduce((acc, p) => acc + p.deliveries.length, 0)} entregas
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Completados */}
        {completed.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>✓</span>
              Completados ({completed.length})
            </h2>
            <div className={styles.dispatchGrid}>
              {completed.map((dispatch) => (
                <Link
                  key={dispatch.id}
                  href={`/dispatches/${dispatch.id}`}
                  className={styles.dispatchLink}
                >
                  <Card hover padding="lg">
                    <div className={styles.dispatchCard}>
                      <div className={styles.cardHeader}>
                        <div className={styles.dispatchNumber}>
                          {dispatch.dispatchNumber}
                        </div>
                        <Badge variant="success">
                          {statusLabels[dispatch.status]}
                        </Badge>
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.infoRow}>
                          <span className={styles.infoIcon}>🚗</span>
                          <span className={styles.infoText}>
                            {dispatch.vehicle?.plate} - {dispatch.vehicle?.brand}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoIcon}>📅</span>
                          <span className={styles.infoText}>
                            Completado: {dispatch.actualEndDate ? new Date(dispatch.actualEndDate).toLocaleDateString('es-ES') : 'N/A'}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoIcon}>📦</span>
                          <span className={styles.infoText}>
                            {dispatch.pickups.length} pickups - {dispatch.pickups.reduce((acc, p) => acc + p.deliveries.length, 0)} entregas
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Estado vacío */}
        {dispatches.length === 0 && (
          <Card variant="glass" padding="lg">
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <h3 className={styles.emptyTitle}>No tienes viajes asignados</h3>
              <p className={styles.emptyDescription}>
                Cuando se te asignen viajes, aparecerán aquí
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
