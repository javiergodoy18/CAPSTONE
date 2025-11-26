import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Badge from '@/app/components/Badge';
import Link from 'next/link';
import DateDisplay from '@/app/components/DateDisplay';
import styles from './DriverDashboard.module.css';

export default async function DriverDashboardPage() {
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

  // Obtener viajes del conductor
  const [
    totalDispatches,
    inProgressDispatches,
    completedDispatches,
    upcomingDispatches,
  ] = await Promise.all([
    prisma.dispatch.count({
      where: { driverId: user.driver?.id },
    }),
    prisma.dispatch.count({
      where: {
        driverId: user.driver?.id,
        status: 'in_progress',
      },
    }),
    prisma.dispatch.count({
      where: {
        driverId: user.driver?.id,
        status: 'completed',
      },
    }),
    prisma.dispatch.findMany({
      where: {
        driverId: user.driver?.id,
        status: { in: ['scheduled', 'in_progress'] },
      },
      take: 5,
      orderBy: { scheduledStartDate: 'asc' },
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
    }),
  ]);

  const stats = [
    {
      label: 'Total Viajes',
      value: totalDispatches,
      icon: '🚛',
      color: 'cyan',
    },
    {
      label: 'En Progreso',
      value: inProgressDispatches,
      icon: '⚡',
      color: 'orange',
    },
    {
      label: 'Completados',
      value: completedDispatches,
      icon: '✓',
      color: 'green',
    },
  ];

  const statusLabels: Record<string, string> = {
    scheduled: 'Programado',
    in_progress: 'En Progreso',
    completed: 'Completado',
  };

  const statusVariants: Record<string, 'success' | 'warning' | 'default'> = {
    scheduled: 'default',
    in_progress: 'warning',
    completed: 'success',
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.greeting}>
            <h1 className={styles.title}>
              ¡Bienvenido, {user.name}! 👋
            </h1>
            <p className={styles.subtitle}>
              Aquí tienes un resumen de tus viajes y actividades
            </p>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.driverAvatar}>🚗</div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Card
            key={stat.label}
            variant="glass"
            hover
            className={styles.statCard}
          >
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </Card>
        ))}
      </section>

      {/* Upcoming Dispatches */}
      <section className={styles.dispatchesSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Próximos Viajes</h2>
            <p className={styles.sectionDescription}>
              Viajes programados y en progreso
            </p>
          </div>
          <Link href="/driver/dispatches">
            <Button variant="ghost" icon={<span>→</span>} iconPosition="right">
              Ver Todos
            </Button>
          </Link>
        </div>

        {upcomingDispatches.length === 0 ? (
          <Card variant="glass" padding="lg">
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <h3 className={styles.emptyTitle}>No hay viajes programados</h3>
              <p className={styles.emptyDescription}>
                No tienes viajes asignados en este momento
              </p>
            </div>
          </Card>
        ) : (
          <div className={styles.dispatchList}>
            {upcomingDispatches.map((dispatch) => (
              <Link
                key={dispatch.id}
                href={`/dispatches/${dispatch.id}`}
                className={styles.dispatchLink}
              >
                <Card hover padding="lg">
                  <div className={styles.dispatchHeader}>
                    <div className={styles.dispatchNumber}>
                      {dispatch.dispatchNumber}
                    </div>
                    <Badge
                      variant={statusVariants[dispatch.status]}
                      dot
                      pulse={dispatch.status === 'in_progress'}
                    >
                      {statusLabels[dispatch.status]}
                    </Badge>
                  </div>

                  <div className={styles.dispatchInfo}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoIcon}>🚗</span>
                      <span className={styles.infoText}>
                        {dispatch.vehicle?.plate} - {dispatch.vehicle?.brand} {dispatch.vehicle?.model}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoIcon}>📅</span>
                      <span className={styles.infoText}>
                        <DateDisplay dateString={dispatch.scheduledStartDate.toISOString()} format="long" />
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoIcon}>📦</span>
                      <span className={styles.infoText}>
                        {dispatch.pickups.length} pickups - {dispatch.pickups.reduce((acc, p) => acc + p.deliveries.length, 0)} entregas
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
