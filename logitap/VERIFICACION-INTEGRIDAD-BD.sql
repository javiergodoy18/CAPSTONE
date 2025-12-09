-- =====================================================
-- VERIFICACIÓN DE INTEGRIDAD DE DATOS - LOGITAP
-- =====================================================
-- Ejecutar estos comandos en psql o Prisma Studio

-- =====================================================
-- 1. CONTEO DE REGISTROS POR TABLA
-- =====================================================

SELECT 'Users' as tabla, COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'Drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'Vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'Laboratories', COUNT(*) FROM laboratories
UNION ALL
SELECT 'Pharmacies', COUNT(*) FROM pharmacies
UNION ALL
SELECT 'Dispatches', COUNT(*) FROM dispatches
UNION ALL
SELECT 'Pickups', COUNT(*) FROM pickups
UNION ALL
SELECT 'Deliveries', COUNT(*) FROM deliveries
UNION ALL
SELECT 'Sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'Password Reset Tokens', COUNT(*) FROM password_reset_tokens
ORDER BY cantidad DESC;

-- =====================================================
-- 2. VERIFICAR EXISTENCIA DE USUARIO ADMIN
-- =====================================================

SELECT
  id,
  email,
  name,
  role,
  created_at,
  CASE
    WHEN profile_image IS NULL THEN 'Sin imagen'
    ELSE 'Con imagen'
  END as imagen
FROM users
WHERE email = 'admin@logitap.com';

-- =====================================================
-- 3. VERIFICAR RELACIONES DE USUARIOS Y CONDUCTORES
-- =====================================================

SELECT
  u.email,
  u.name AS user_name,
  u.role,
  d.name AS driver_name,
  d.license,
  d.status AS driver_status
FROM users u
LEFT JOIN drivers d ON u.driver_id = d.id
ORDER BY u.role, u.email;

-- =====================================================
-- 4. VERIFICAR DESPACHOS CON SUS RELACIONES
-- =====================================================

SELECT
  d.dispatch_number,
  d.status,
  v.plate AS vehicle,
  dr.name AS driver,
  COUNT(DISTINCT p.id) AS total_pickups,
  COUNT(DISTINCT del.id) AS total_deliveries,
  d.total_merchandise_value,
  d.total_income
FROM dispatches d
LEFT JOIN vehicles v ON d.vehicle_id = v.id
LEFT JOIN drivers dr ON d.driver_id = dr.id
LEFT JOIN pickups p ON p.dispatch_id = d.id
LEFT JOIN deliveries del ON del.dispatch_id = d.id
GROUP BY d.id, v.plate, dr.name
ORDER BY d.created_at DESC;

-- =====================================================
-- 5. VERIFICAR PICKUPS CON DELIVERIES
-- =====================================================

SELECT
  p.id AS pickup_id,
  l.name AS laboratory,
  d.dispatch_number,
  p.merchandise_value,
  p.dispatch_cost,
  p.percentage_applied,
  COUNT(del.id) AS deliveries_count,
  SUM(del.merchandise_value) AS total_delivery_value
FROM pickups p
JOIN laboratories l ON p.laboratory_id = l.id
JOIN dispatches d ON p.dispatch_id = d.id
LEFT JOIN deliveries del ON del.pickup_id = p.id
GROUP BY p.id, l.name, d.dispatch_number, p.merchandise_value, p.dispatch_cost, p.percentage_applied
ORDER BY p.created_at DESC;

-- =====================================================
-- 6. VERIFICAR DELIVERIES CON CUSTOM PRICING
-- =====================================================

SELECT
  d.invoice_number,
  ph.name AS pharmacy,
  d.merchandise_value,
  d.is_custom_pricing,
  d.custom_price_concept,
  d.custom_price_amount,
  d.status
FROM deliveries d
JOIN pharmacies ph ON d.pharmacy_id = ph.id
WHERE d.is_custom_pricing = true
ORDER BY d.created_at DESC;

-- =====================================================
-- 7. VERIFICAR COORDENADAS GPS
-- =====================================================

-- Laboratorios sin coordenadas
SELECT
  'Laboratories' AS tipo,
  COUNT(*) AS sin_coordenadas
FROM laboratories
WHERE latitude IS NULL OR longitude IS NULL;

-- Farmacias sin coordenadas
SELECT
  'Pharmacies' AS tipo,
  COUNT(*) AS sin_coordenadas
FROM pharmacies
WHERE latitude IS NULL OR longitude IS NULL;

-- Detalle de laboratorios sin coordenadas
SELECT
  name,
  address,
  city
FROM laboratories
WHERE latitude IS NULL OR longitude IS NULL;

-- Detalle de farmacias sin coordenadas
SELECT
  name,
  address,
  city
FROM pharmacies
WHERE latitude IS NULL OR longitude IS NULL;

-- =====================================================
-- 8. VERIFICAR INTEGRIDAD REFERENCIAL
-- =====================================================

-- Despachos sin vehículo
SELECT COUNT(*) AS dispatches_sin_vehiculo
FROM dispatches
WHERE vehicle_id IS NULL;

-- Despachos sin conductor
SELECT COUNT(*) AS dispatches_sin_conductor
FROM dispatches
WHERE driver_id IS NULL;

-- Pickups huérfanos (sin dispatch)
SELECT COUNT(*) AS pickups_huerfanos
FROM pickups p
LEFT JOIN dispatches d ON p.dispatch_id = d.id
WHERE d.id IS NULL;

-- Deliveries huérfanas (sin pickup o dispatch)
SELECT COUNT(*) AS deliveries_huerfanas
FROM deliveries del
LEFT JOIN pickups p ON del.pickup_id = p.id
LEFT JOIN dispatches d ON del.dispatch_id = d.id
WHERE p.id IS NULL OR d.id IS NULL;

-- =====================================================
-- 9. ESTADÍSTICAS DE ESTADOS
-- =====================================================

-- Estados de despachos
SELECT
  status,
  COUNT(*) AS cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS porcentaje
FROM dispatches
GROUP BY status
ORDER BY cantidad DESC;

-- Estados de vehículos
SELECT
  status,
  COUNT(*) AS cantidad
FROM vehicles
GROUP BY status
ORDER BY cantidad DESC;

-- Estados de conductores
SELECT
  status,
  COUNT(*) AS cantidad
FROM drivers
GROUP BY status
ORDER BY cantidad DESC;

-- Estados de deliveries
SELECT
  status,
  COUNT(*) AS cantidad
FROM deliveries
GROUP BY status
ORDER BY cantidad DESC;

-- =====================================================
-- 10. VALIDAR CÁLCULOS DE PRECIOS
-- =====================================================

SELECT
  p.id,
  l.name AS laboratory,
  p.merchandise_value,
  p.percentage_applied,
  p.dispatch_cost,
  -- Recalcular el costo esperado
  CASE
    WHEN p.merchandise_value <= 22000 THEN p.merchandise_value * 0.03
    WHEN p.merchandise_value <= 30000 THEN p.merchandise_value * 0.0275
    ELSE p.merchandise_value * 0.025
  END AS costo_esperado,
  -- Diferencia
  ABS(p.dispatch_cost -
    CASE
      WHEN p.merchandise_value <= 22000 THEN p.merchandise_value * 0.03
      WHEN p.merchandise_value <= 30000 THEN p.merchandise_value * 0.0275
      ELSE p.merchandise_value * 0.025
    END
  ) AS diferencia
FROM pickups p
JOIN laboratories l ON p.laboratory_id = l.id
WHERE p.percentage_applied IS NOT NULL
ORDER BY diferencia DESC;

-- =====================================================
-- 11. SESIONES ACTIVAS
-- =====================================================

SELECT
  s.id,
  u.email,
  u.name,
  u.role,
  s.created_at,
  s.expires_at,
  CASE
    WHEN s.expires_at > NOW() THEN 'Activa'
    ELSE 'Expirada'
  END AS estado
FROM sessions s
JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC;

-- =====================================================
-- 12. TOKENS DE RESET PENDIENTES
-- =====================================================

SELECT
  t.id,
  u.email,
  u.name,
  t.used,
  t.created_at,
  t.expires_at,
  CASE
    WHEN t.used THEN 'Usado'
    WHEN t.expires_at < NOW() THEN 'Expirado'
    ELSE 'Válido'
  END AS estado
FROM password_reset_tokens t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC;

-- =====================================================
-- 13. RESUMEN GENERAL DEL SISTEMA
-- =====================================================

SELECT
  'Total Usuarios' AS metrica,
  COUNT(*)::TEXT AS valor
FROM users
UNION ALL
SELECT 'Usuarios ADMIN', COUNT(*)::TEXT FROM users WHERE role = 'ADMIN'
UNION ALL
SELECT 'Usuarios DRIVER', COUNT(*)::TEXT FROM users WHERE role = 'DRIVER'
UNION ALL
SELECT 'Total Despachos', COUNT(*)::TEXT FROM dispatches
UNION ALL
SELECT 'Despachos Completados', COUNT(*)::TEXT FROM dispatches WHERE status = 'completed'
UNION ALL
SELECT 'Despachos Activos', COUNT(*)::TEXT FROM dispatches WHERE status = 'in_progress'
UNION ALL
SELECT 'Total Entregas', COUNT(*)::TEXT FROM deliveries
UNION ALL
SELECT 'Entregas Completadas', COUNT(*)::TEXT FROM deliveries WHERE status = 'delivered'
UNION ALL
SELECT 'Total Vehículos', COUNT(*)::TEXT FROM vehicles
UNION ALL
SELECT 'Vehículos Disponibles', COUNT(*)::TEXT FROM vehicles WHERE status = 'disponible'
UNION ALL
SELECT 'Total Laboratorios', COUNT(*)::TEXT FROM laboratories
UNION ALL
SELECT 'Total Farmacias', COUNT(*)::TEXT FROM pharmacies;

-- =====================================================
-- FIN DEL SCRIPT DE VERIFICACIÓN
-- =====================================================
