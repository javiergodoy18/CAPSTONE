import Link from 'next/link';
import Card from './components/Card';
import Button from './components/Button';
import Badge from './components/Badge';
import { prisma } from '@/lib/prisma';
import styles from './Dashboard.module.css';

export default async function DashboardPage() {
  // Obtener estadísticas
  const [
    totalDispatches,
    inProgressDispatches,
    completedDispatches,
    totalVehicles,
    totalDrivers,
    recentDispatches,
  ] = await Promise.all([
    prisma.dispatch.count(),
    prisma.dispatch.count({ where: { status: 'in_progress' } }),
    prisma.dispatch.count({ where: { status: 'completed' } }),
    prisma.vehicle.count(),
    prisma.driver.count(),
    prisma.dispatch.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: true,
        driver: true,
      },
    }),
  ]);

  const stats = [
    {
      label: 'Total Viajes',
      value: totalDispatches,
      icon: '🚛',
      trend: '+12%',
      variant: 'info' as const,
    },
    {
      label: 'En Progreso',
      value: inProgressDispatches,
      icon: '⚡',
      trend: 'Activos',
      variant: 'warning' as const,
    },
    {
      label: 'Completados',
      value: completedDispatches,
      icon: '✓',
      trend: `${totalDispatches > 0 ? Math.round((completedDispatches / totalDispatches) * 100) : 0}%`,
      variant: 'success' as const,
    },
    {
      label: 'Vehículos',
      value: totalVehicles,
      icon: '🚗',
      trend: 'Activos',
      variant: 'purple' as const,
    },
  ];

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

  return (
    <div className={styles.dashboard}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleMain}>Sistema de Gestión</span>
              <span className={styles.heroTitleSub}>Logística en Tiempo Real</span>
            </h1>
            <p className={styles.heroDescription}>
              Monitorea, optimiza y gestiona tu flota de transporte desde un solo lugar
            </p>
            <div className={styles.heroActions}>
              <Link href="/dispatches/new">
                <Button size="lg" glow icon={<span>+</span>}>
                  Nuevo Viaje
                </Button>
              </Link>
              <Link href="/dispatches">
                <Button size="lg" variant="outline" icon={<span>→</span>} iconPosition="right">
                  Ver Todos los Viajes
                </Button>
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroOrb} />
            <div className={styles.heroGrid} />
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
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <Badge variant={stat.variant} size="sm">
                {stat.trend}
              </Badge>
            </div>
          </Card>
        ))}
      </section>

      {/* Recent Activity */}
      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Actividad Reciente</h2>
            <p className={styles.sectionDescription}>
              Últimos viajes registrados en el sistema
            </p>
          </div>
          <Link href="/dispatches">
            <Button variant="ghost" icon={<span>→</span>} iconPosition="right">
              Ver Todos
            </Button>
          </Link>
        </div>

        <div className={styles.dispatchList}>
          {recentDispatches.length === 0 ? (
            <Card padding="lg">
              <p className={styles.emptyState}>No hay viajes registrados aún</p>
            </Card>
          ) : (
            recentDispatches.map((dispatch) => (
              <Link
                key={dispatch.id}
                href={`/dispatches/${dispatch.id}`}
                className={styles.dispatchItem}
              >
                <Card hover padding="md">
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
                  <div className={styles.dispatchDetails}>
                    <div className={styles.dispatchDetail}>
                      <span className={styles.dispatchIcon}>🚗</span>
                      <span>{dispatch.vehicle?.plate || 'Sin vehículo'}</span>
                    </div>
                    <div className={styles.dispatchDetail}>
                      <span className={styles.dispatchIcon}>👤</span>
                      <span>{dispatch.driver?.name || 'Sin conductor'}</span>
                    </div>
                    <div className={styles.dispatchDetail}>
                      <span className={styles.dispatchIcon}>📅</span>
                      <span>
                        {new Date(dispatch.scheduledStartDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Accesos Rápidos</h2>
        <div className={styles.actionsGrid}>
          {[
            { href: '/vehicles', label: 'Gestionar Vehículos', icon: '🚗', color: 'cyan' },
            { href: '/drivers', label: 'Gestionar Conductores', icon: '👤', color: 'orange' },
            { href: '/laboratories', label: 'Laboratorios', icon: '🏢', color: 'purple' },
            { href: '/pharmacies', label: 'Farmacias', icon: '💊', color: 'green' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={styles.actionCard}
            >
              <Card hover padding="lg" variant="glass">
                <div className={`${styles.actionIcon} ${styles[action.color]}`}>
                  {action.icon}
                </div>
                <div className={styles.actionLabel}>{action.label}</div>
                <div className={styles.actionArrow}>→</div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
