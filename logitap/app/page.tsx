'use client';

import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [kpis, setKpis] = useState<any>(null);
  const [loadingKPIs, setLoadingKPIs] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) loadKPIs(selectedPeriod);
  }, [user, loading, router, selectedPeriod]);

  const loadKPIs = async (period: string) => {
    setLoadingKPIs(true);
    try {
      const res = await fetch(`/api/dashboard/kpis?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setKpis(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingKPIs(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#38bdf8',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'bounce 1s infinite' }}>📊</div>
          <div style={{ fontSize: '1.25rem' }}>Cargando Dashboard...</div>
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (loadingKPIs) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        paddingTop: '80px',
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>
          {/* Hero Skeleton */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              width: '400px',
              height: '48px',
              background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '8px',
              marginBottom: '0.5rem',
            }} />
            <div style={{
              width: '300px',
              height: '32px',
              background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              animationDelay: '0.1s',
              borderRadius: '8px',
            }} />
          </div>

          {/* Period Selector Skeleton */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            padding: '0.5rem',
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '12px',
            width: 'fit-content',
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                width: '140px',
                height: '38px',
                background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                animationDelay: `${i * 0.1}s`,
                borderRadius: '8px',
              }} />
            ))}
          </div>

          {/* KPI Cards Skeleton */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                }} />
                <div style={{
                  width: '120px',
                  height: '16px',
                  background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: '4px',
                  marginBottom: '0.75rem',
                }} />
                <div style={{
                  width: '80px',
                  height: '40px',
                  background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                }} />
                <div style={{
                  width: '100px',
                  height: '14px',
                  background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: '4px',
                }} />
              </div>
            ))}
          </div>

          <style>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.6; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!user || !kpis) return null;

  // Función para formatear valores monetarios de forma inteligente
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      paddingTop: '80px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem)' }}>
        {/* Hero */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: '700',
            color: '#f0f9ff',
            marginBottom: '0.5rem',
          }}>
            👋 Hola, {user.name.split(' ')[0]}
          </h1>
          <p style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)',
            color: '#94a3b8'
          }}>
            {new Date().toLocaleDateString('es-CL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Selector de Período */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '0.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          width: 'fit-content',
          maxWidth: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          boxShadow: loadingKPIs ? '0 0 20px rgba(56, 189, 248, 0.3)' : 'none',
          transition: 'box-shadow 0.3s ease',
        }}>
          {loadingKPIs && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '2px',
              width: '100%',
              background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
              backgroundSize: '50% 100%',
              animation: 'loading 1.5s ease-in-out infinite',
            }} />
          )}
          {[
            { value: '7d', label: '7 días' },
            { value: '30d', label: '30 días' },
            { value: '90d', label: '90 días' },
            { value: 'all', label: 'Todo' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value as any)}
              disabled={loadingKPIs}
              style={{
                padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1.5rem)',
                background: selectedPeriod === option.value
                  ? 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)'
                  : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: selectedPeriod === option.value ? 'white' : '#94a3b8',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontWeight: '600',
                cursor: loadingKPIs ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: selectedPeriod === option.value
                  ? '0 4px 12px rgba(56, 189, 248, 0.3)'
                  : 'none',
                opacity: loadingKPIs ? 0.5 : 1,
                position: 'relative',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                flex: '0 0 auto',
              }}
              onMouseEnter={(e) => {
                if (selectedPeriod !== option.value && !loadingKPIs) {
                  e.currentTarget.style.color = '#38bdf8';
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPeriod !== option.value) {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {selectedPeriod === option.value && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  animation: 'ripple 1s ease-out',
                }} />
              )}
              {option.label}
            </button>
          ))}
          <style>{`
            @keyframes loading {
              0% { background-position: -50% 0; }
              100% { background-position: 150% 0; }
            }
            @keyframes ripple {
              0% {
                transform: scale(0);
                opacity: 1;
              }
              100% {
                transform: scale(2);
                opacity: 0;
              }
            }
          `}</style>
        </div>

        {/* Botones */}
        <div style={{
          display: 'flex',
          gap: 'clamp(0.5rem, 2vw, 1rem)',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => router.push('/dispatches/new')}
            style={{
              padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
              background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(56, 189, 248, 0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            + Nuevo Viaje
          </button>
          <button
            onClick={() => router.push('/dispatches')}
            style={{
              padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
              background: 'transparent',
              border: '2px solid rgba(56, 189, 248, 0.5)',
              borderRadius: '12px',
              color: '#38bdf8',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Ver Viajes →
          </button>
        </div>

        {/* 5 KPIs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <KPICard
            icon="✓"
            title="TASA CUMPLIMIENTO"
            value={`${kpis.kpi1.completionRate}%`}
            subtitle={`${kpis.kpi1.completedDispatches}/${kpis.kpi1.totalDispatches} completados`}
            color="#22c55e"
            badge={kpis.kpi1.completionRate >= 95 ? "EXCELENTE" : "MEJORAR"}
            badgeColor={kpis.kpi1.completionRate >= 95 ? "#22c55e" : "#f59e0b"}
          />
          <KPICard
            icon="💰"
            title="INGRESOS TOTALES"
            value={formatCurrency(kpis.kpi2.totalRevenue)}
            subtitle={`Margen: ${kpis.kpi2.profitMargin}%`}
            color="#10b981"
            badge={kpis.kpi2.profitMargin >= 60 ? "SALUDABLE" : "BAJO"}
            badgeColor={kpis.kpi2.profitMargin >= 60 ? "#22c55e" : "#f59e0b"}
          />
          <KPICard
            icon="🚗"
            title="UTILIZACIÓN FLOTA"
            value={`${kpis.kpi3.vehicleUtilization}%`}
            subtitle={`${kpis.kpi3.inUseVehicles}/${kpis.kpi3.totalVehicles} en uso`}
            color="#06b6d4"
            badge="ACTIVO"
            badgeColor="#06b6d4"
          />
          <KPICard
            icon="📦"
            title="ENTREGAS POR VIAJE"
            value={kpis.kpi4.deliveriesPerDispatch}
            subtitle={`${kpis.kpi4.totalDeliveries} entregas`}
            color="#8b5cf6"
            badge={kpis.kpi4.deliveriesPerDispatch >= 3 ? "EFICIENTE" : "OPTIMIZAR"}
            badgeColor={kpis.kpi4.deliveriesPerDispatch >= 3 ? "#22c55e" : "#f59e0b"}
          />
          <KPICard
            icon="📈"
            title="CRECIMIENTO MENSUAL"
            value={`${kpis.kpi5.monthGrowth >= 0 ? '+' : ''}${kpis.kpi5.monthGrowth}%`}
            subtitle={`${kpis.kpi5.thisMonth} este mes`}
            color={kpis.kpi5.monthGrowth >= 0 ? "#22c55e" : "#ef4444"}
          />
        </div>

        {/* Rankings */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          <RankingCard title="🏆 Top 5 Laboratorios" items={kpis.topLaboratories} />
          <RankingCard title="🚀 Top 5 Conductores" items={kpis.topDriversByRevenue} />
        </div>

        {/* Tendencia */}
        <TrendChart data={kpis.trends.daily} />
      </div>
    </div>
  );
}

function KPICard({ icon, title, value, subtitle, color, badge, badgeColor }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `2px solid ${color}40`,
        borderRadius: '16px',
        padding: 'clamp(1rem, 3vw, 2rem)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s',
      }}
    >
      {badge && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          padding: '0.4rem 0.8rem',
          background: badgeColor,
          borderRadius: '20px',
          fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
          fontWeight: '800',
          color: 'white',
        }}>
          {badge}
        </div>
      )}

      <div style={{
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        marginBottom: '1rem',
      }}>
        {icon}
      </div>

      <div style={{
        fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
        color: '#64748b',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
      }}>
        {title}
      </div>

      <div style={{
        fontSize: 'clamp(1.5rem, 5vw, 3rem)',
        fontWeight: '800',
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem',
        lineHeight: 1,
        wordBreak: 'break-word',
      }}>
        {value}
      </div>

      <div style={{
        fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
        color: '#94a3b8',
        fontWeight: '500',
      }}>
        {subtitle}
      </div>
    </div>
  );
}

function RankingCard({ title, items }: any) {
  const colors = ['#fbbf24', '#94a3b8', '#cd7f32', '#38bdf8', '#8b5cf6'];
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(56, 189, 248, 0.2)',
      borderRadius: '24px',
      padding: 'clamp(1.5rem, 3vw, 2.5rem)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    }}>
      <h3 style={{
        fontSize: 'clamp(1rem, 3vw, 1.25rem)',
        fontWeight: '700',
        color: '#f0f9ff',
        marginBottom: '1.5rem',
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.75rem, 2vw, 1.25rem)' }}>
        {items.map((item: any, i: number) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(0.75rem, 2vw, 1.5rem)',
            padding: 'clamp(0.75rem, 2vw, 1.5rem)',
            background: `linear-gradient(135deg, ${colors[i]}15 0%, ${colors[i]}05 100%)`,
            border: `2px solid ${colors[i]}40`,
            borderRadius: '16px',
          }}>
            <div style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              minWidth: 'clamp(40px, 10vw, 60px)',
              textAlign: 'center',
            }}>
              {medals[i]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)',
                fontWeight: '700',
                color: '#f0f9ff',
                marginBottom: '0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.name}
              </div>
              <div style={{
                fontSize: 'clamp(0.7rem, 2vw, 0.875rem)',
                color: '#64748b',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <span>📦 {item.trips}</span>
                <span>💵 ${(item.avgPerTrip || 0).toLocaleString('es-CL')}</span>
              </div>
            </div>
            <div style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: '800',
              background: `linear-gradient(135deg, ${colors[i]} 0%, ${colors[i]}cc 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'right',
              minWidth: 'fit-content',
            }}>
              ${(item.revenue / 1000).toFixed(1)}K
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendChart({ data }: any) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const max = Math.max(...data.map((d: any) => d.count), 1);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(56, 189, 248, 0.2)',
      borderRadius: '24px',
      padding: 'clamp(1.5rem, 3vw, 2.5rem)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    }}>
      <h3 style={{
        fontSize: 'clamp(1rem, 3vw, 1.25rem)',
        fontWeight: '700',
        color: '#f0f9ff',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{
          display: 'inline-block',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          📈
        </span>
        Últimos 7 Días
      </h3>

      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'clamp(0.5rem, 2vw, 1.5rem)',
        height: 'clamp(200px, 40vw, 280px)',
        position: 'relative',
      }}>
        {data.map((day: any, i: number) => {
          const height = (day.count / max) * 100;
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              {/* Tooltip flotante */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-8px)',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.95) 0%, rgba(14, 165, 233, 0.95) 100%)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(56, 189, 248, 0.4)',
                  border: '1px solid rgba(56, 189, 248, 0.5)',
                  animation: 'fadeInUp 0.2s ease',
                  zIndex: 10,
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                    {day.count} viajes
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    {day.date}
                  </div>
                  {/* Flecha del tooltip */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid rgba(56, 189, 248, 0.95)',
                  }} />
                </div>
              )}

              {/* Valor sobre la barra */}
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: isHovered ? '#38bdf8' : '#64748b',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              }}>
                {day.count}
              </div>

              {/* Barra animada */}
              <div style={{
                width: '100%',
                height: `${height}%`,
                background: isHovered
                  ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%)',
                borderRadius: '8px 8px 0 0',
                minHeight: '20px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                transformOrigin: 'bottom',
                boxShadow: isHovered
                  ? '0 -4px 20px rgba(56, 189, 248, 0.6)'
                  : '0 -2px 8px rgba(56, 189, 248, 0.2)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Efecto de brillo en la barra */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: isHovered ? '100%' : '-50%',
                  width: '50%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  transition: 'left 0.6s ease',
                }} />
              </div>

              {/* Fecha */}
              <div style={{
                fontSize: '0.7rem',
                color: isHovered ? '#38bdf8' : '#64748b',
                fontWeight: isHovered ? '600' : '400',
                transition: 'all 0.3s ease',
              }}>
                {day.date}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(0);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
