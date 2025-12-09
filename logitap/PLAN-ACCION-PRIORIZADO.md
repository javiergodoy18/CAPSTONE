# 🎯 PLAN DE ACCIÓN PRIORIZADO - LOGITAP

**Fecha:** 07/12/2025
**Objetivo:** Retomar desarrollo profesional del sistema
**Prioridad:** Funcionalidad core → Testing → Optimización

---

## 🚨 FASE 0: RECUPERACIÓN INMEDIATA (30-45 minutos)

### ✅ PASO 1: Configurar PostgreSQL Local
**Prioridad:** 🔴 CRÍTICA
**Tiempo estimado:** 20-30 minutos

```bash
# 1. Instalar PostgreSQL 17
# Seguir guía en SETUP-POSTGRESQL.md

# 2. Iniciar servicio PostgreSQL
# Windows: Servicios → PostgreSQL → Iniciar
# Mac/Linux: brew services start postgresql

# 3. Verificar conexión
psql -U logitap_user -d logitap
# Password: logitap123

# 4. Si no existe la BD, crearla:
psql -U postgres
CREATE DATABASE logitap;
CREATE USER logitap_user WITH PASSWORD 'logitap123';
GRANT ALL PRIVILEGES ON DATABASE logitap TO logitap_user;
\q
```

### ✅ PASO 2: Ejecutar Migraciones
**Prioridad:** 🔴 CRÍTICA
**Tiempo estimado:** 5 minutos

```bash
# 1. Generar Prisma Client
npm run generate

# 2. Ejecutar migraciones
npm run migrate

# 3. Verificar tablas creadas
npx prisma studio
# Debe abrir en http://localhost:5555
```

### ✅ PASO 3: Crear Usuario Admin y Datos de Prueba
**Prioridad:** 🔴 CRÍTICA
**Tiempo estimado:** 10 minutos

```bash
# 1. Crear usuario admin
npm run create:admin
# Email: admin@logitap.com
# Password: (ingresa una contraseña segura)

# 2. Crear usuarios de prueba (opcional)
npm run seed:users

# 3. Verificar creación
node scripts/list-users.ts
```

### ✅ PASO 4: Iniciar Servidor y Probar Login
**Prioridad:** 🔴 CRÍTICA
**Tiempo estimado:** 5 minutos

```bash
# 1. Iniciar servidor
npm run dev

# 2. Abrir navegador
http://localhost:3000/login

# 3. Login con admin@logitap.com
# 4. Verificar acceso al dashboard
```

---

## 📊 FASE 1: CARGA DE DATOS DE PRUEBA (1-2 horas)

### ✅ PASO 5: Crear Vehículos de Prueba
**Prioridad:** 🟡 ALTA
**Tiempo estimado:** 15 minutos

```
Navegar a: http://localhost:3000/vehicles/new

Crear 3 vehículos:
1. Placa: ABC-123, Marca: Toyota, Modelo: Hiace, Año: 2023, Capacidad: 1500kg
2. Placa: DEF-456, Marca: Nissan, Modelo: Urvan, Año: 2022, Capacidad: 1200kg
3. Placa: GHI-789, Marca: Mercedes, Modelo: Sprinter, Año: 2024, Capacidad: 2000kg
```

### ✅ PASO 6: Crear Conductores de Prueba
**Prioridad:** 🟡 ALTA
**Tiempo estimado:** 15 minutos

```
Navegar a: http://localhost:3000/drivers/new

Crear 3 conductores:
1. Nombre: Juan Pérez, Email: juan@logitap.com, Teléfono: +56912345678, Licencia: A123456
2. Nombre: María González, Email: maria@logitap.com, Teléfono: +56923456789, Licencia: B234567
3. Nombre: Carlos Díaz, Email: carlos@logitap.com, Teléfono: +56934567890, Licencia: C345678
```

### ✅ PASO 7: Crear Laboratorios
**Prioridad:** 🟡 ALTA
**Tiempo estimado:** 20 minutos

```
Navegar a: http://localhost:3000/laboratories/new

Crear 5 laboratorios:
1. Farmacéutica Chile S.A., Santiago, Av. Libertador 1000
2. Laboratorios Andinos, Valparaíso, Calle Victoria 500
3. Pharma Plus Ltda., Concepción, Av. O'Higgins 2000
4. BioLab Chile, La Serena, Av. del Mar 800
5. MediChem S.A., Temuco, Av. Alemania 1500
```

### ✅ PASO 8: Crear Farmacias
**Prioridad:** 🟡 ALTA
**Tiempo estimado:** 30 minutos

```
Navegar a: http://localhost:3000/pharmacies/new

Crear 10 farmacias distribuidas en Santiago:
1. Farmacia Cruz Verde - Las Condes, Av. Apoquindo 5000
2. Farmacia Salcobrand - Providencia, Av. Providencia 2000
3. Farmacia Ahumada - Centro, Paseo Ahumada 100
4. Farmacia Dr. Simi - Maipú, Av. Pajaritos 3000
5. Farmacia Popular - La Florida, Av. Vicuña Mackenna 8000
6. Farmacia Knop - Vitacura, Av. Vitacura 6000
7. Farmacia Result - Ñuñoa, Av. Irarrázaval 3000
8. Farmacia Bioxana - Quilicura, Av. Matta 1500
9. Farmacia EconoMedic - San Miguel, Gran Avenida 5000
10. Farmacia Express - Puente Alto, Av. Eyzaguirre 1000
```

### ✅ PASO 9: Crear Despachos de Prueba
**Prioridad:** 🟡 ALTA
**Tiempo estimado:** 30 minutos

```
Navegar a: http://localhost:3000/dispatches/new

Crear 3 despachos variados:

DESPACHO 1: Simple (1 laboratorio, 2 farmacias)
- Vehículo: ABC-123
- Conductor: Juan Pérez
- Fecha: Hoy
- Pickup: Farmacéutica Chile S.A.
  - Delivery 1: Cruz Verde, Invoice: F-001, Valor: $15,000
  - Delivery 2: Salcobrand, Invoice: F-002, Valor: $25,000

DESPACHO 2: Mediano (2 laboratorios, 4 farmacias)
- Vehículo: DEF-456
- Conductor: María González
- Fecha: Mañana
- Pickup 1: Laboratorios Andinos
  - Delivery 1: Ahumada, Invoice: F-003, Valor: $50,000
  - Delivery 2: Dr. Simi, Invoice: F-004, Valor: $35,000
- Pickup 2: Pharma Plus Ltda.
  - Delivery 3: Popular, Invoice: F-005, Valor: $20,000
  - Delivery 4: Knop, Invoice: F-006, Valor: $40,000

DESPACHO 3: Complejo con Custom Pricing
- Vehículo: GHI-789
- Conductor: Carlos Díaz
- Fecha: Pasado mañana
- Pickup: BioLab Chile
  - Delivery 1: Result, Invoice: F-007, Valor: $100,000
  - Delivery 2: Bioxana, Invoice: F-008, Custom Price: $5,000 (Concepto: Transporte especial refrigerado)
  - Delivery 3: EconoMedic, Invoice: F-009, Valor: $30,000
```

---

## 🧪 FASE 2: TESTING FUNCIONAL (2-3 horas)

### ✅ PASO 10: Verificar CRUDs Básicos
**Prioridad:** 🟢 MEDIA
**Tiempo estimado:** 1 hora

**Checklist:**
- [ ] Crear vehículo → Editar → Eliminar
- [ ] Crear conductor → Editar → Eliminar
- [ ] Crear laboratorio → Editar → Verificar coordenadas GPS
- [ ] Crear farmacia → Editar → Verificar coordenadas GPS
- [ ] Búsqueda y filtros en listados
- [ ] Validaciones de formularios (campos requeridos)
- [ ] Mensajes de error apropiados

### ✅ PASO 11: Verificar Dashboard y KPIs
**Prioridad:** 🟢 MEDIA
**Tiempo estimado:** 30 minutos

**Checklist:**
- [ ] Dashboard carga sin errores
- [ ] KPI #1: Tasa de Cumplimiento muestra datos correctos
- [ ] KPI #2: Ingresos Totales calcula bien
- [ ] KPI #3: Utilización de Flota correcto
- [ ] KPI #4: Entregas por Viaje correcto
- [ ] KPI #5: Crecimiento Mensual (crear despachos de meses anteriores)
- [ ] Top 5 Laboratorios se actualiza
- [ ] Top 5 Conductores se actualiza
- [ ] Gráfico de últimos 7 días funciona

### ✅ PASO 12: Verificar Sistema de Precios
**Prioridad:** 🟢 MEDIA
**Tiempo estimado:** 30 minutos

**Checklist:**
- [ ] Delivery con valor ≤ $22,000 → 3%
- [ ] Delivery con valor $22,001-$30,000 → 2.75%
- [ ] Delivery con valor > $30,000 → 2.5%
- [ ] Custom Pricing se guarda correctamente
- [ ] Total Income del dispatch se calcula bien
- [ ] Prisma Studio muestra datos correctos en tabla pickups

**Script de verificación:**
```sql
-- Ejecutar en Prisma Studio o psql
SELECT
  p.id,
  p.merchandise_value,
  p.percentage_applied,
  p.dispatch_cost,
  CASE
    WHEN p.merchandise_value <= 22000 THEN p.merchandise_value * 0.03
    WHEN p.merchandise_value <= 30000 THEN p.merchandise_value * 0.0275
    ELSE p.merchandise_value * 0.025
  END AS expected_cost
FROM pickups p
ORDER BY p.created_at DESC;
```

### ✅ PASO 13: Verificar Autenticación y Roles
**Prioridad:** 🟢 MEDIA
**Tiempo estimado:** 30 minutos

**Checklist:**
- [ ] Login con admin@logitap.com → Dashboard admin
- [ ] Logout → Redirección a /login
- [ ] Crear usuario DRIVER
- [ ] Login con usuario DRIVER → Dashboard conductor
- [ ] Conductor NO puede ver /vehicles, /drivers, etc.
- [ ] Rate limiting: 5 intentos fallidos → Bloqueo 15min
- [ ] Recuperar contraseña: Envío de email (verificar en logs)
- [ ] Reset de contraseña con token

---

## 🔧 FASE 3: OPTIMIZACIÓN Y LIMPIEZA (1-2 horas)

### ✅ PASO 14: Limpiar Código de Debug
**Prioridad:** 🔵 BAJA
**Tiempo estimado:** 30 minutos

**Archivos a limpiar:**
```
app/api/dispatches/[id]/route.ts:52-73
app/components/MapView.tsx:57-156
app/dispatches/[id]/edit/page.tsx:234
app/dispatches/new/page.tsx:163
```

**Acción:**
```typescript
// Reemplazar console.log por:
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### ✅ PASO 15: Verificar Integridad de Datos
**Prioridad:** 🔵 BAJA
**Tiempo estimado:** 20 minutos

```bash
# Ejecutar script de verificación SQL
# Ver archivo: VERIFICACION-INTEGRIDAD-BD.sql

# Opción 1: Prisma Studio
npx prisma studio
# Ejecutar queries manualmente

# Opción 2: psql
psql -U logitap_user -d logitap -f VERIFICACION-INTEGRIDAD-BD.sql
```

### ✅ PASO 16: Actualizar Dependencias
**Prioridad:** 🔵 BAJA
**Tiempo estimado:** 10 minutos

```bash
# Actualizar baseline-browser-mapping
npm i baseline-browser-mapping@latest -D

# Verificar vulnerabilidades
npm audit

# Opcional: Actualizar todas las dependencias
npm update
```

### ✅ PASO 17: Configurar Linting y Formateo
**Prioridad:** 🔵 BAJA
**Tiempo estimado:** 30 minutos

```bash
# Opcional: Agregar Prettier
npm install --save-dev prettier

# Crear .prettierrc
echo '{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2
}' > .prettierrc

# Formatear código
npx prettier --write "app/**/*.{ts,tsx}"
```

---

## 🚀 FASE 4: FUNCIONALIDADES AVANZADAS (Opcional - 3-5 días)

### ⚠️ PASO 18: Implementar Exportación de PDFs
**Prioridad:** 🔵 BAJA
**Tiempo estimado:** 4-6 horas

```bash
# Instalar dependencias
npm install jspdf jspdf-autotable

# Crear componente de exportación
# app/api/dispatches/[id]/pdf/route.ts
```

### ⚠️ PASO 19: Implementar Exportación a Excel
**Prioridad:** 🔵 BAJA
**Tiempo estimado:** 2-3 horas

```bash
# Instalar dependencias
npm install xlsx

# Crear botón de exportación en listados
```

### ⚠️ PASO 20: Testing de Optimización de Rutas
**Prioridad:** 🔵 BAJA
**Tiempo estimado:** 3-4 horas

```bash
# Verificar algoritmo en lib/routeOptimization.ts
# Crear despachos con múltiples deliveries
# Probar optimización real con Google Maps API
```

---

## 📝 CHECKLIST DE VALIDACIÓN FINAL

Antes de considerar el proyecto "estable", verificar:

### Funcionalidades Core
- [ ] CRUD de Vehículos (100%)
- [ ] CRUD de Conductores (100%)
- [ ] CRUD de Laboratorios (100%)
- [ ] CRUD de Farmacias (100%)
- [ ] Creación de Despachos completos (100%)
- [ ] Edición de Despachos (100%)
- [ ] Dashboard con KPIs en tiempo real (100%)

### Autenticación y Seguridad
- [ ] Login/Logout funcional
- [ ] Roles ADMIN y DRIVER funcionan
- [ ] Rate limiting activo
- [ ] Cookies httpOnly configuradas
- [ ] Reset de contraseña funcional

### Sistema de Precios
- [ ] Cálculo automático por porcentaje (3%, 2.75%, 2.5%)
- [ ] Custom pricing funcional
- [ ] Total Income calculado correctamente

### Integridad de Datos
- [ ] No hay registros huérfanos
- [ ] Coordenadas GPS en laboratorios y farmacias
- [ ] Relaciones entre tablas correctas
- [ ] Cálculos de precios validados

### Performance
- [ ] Dashboard carga en < 2 segundos
- [ ] Listados responden rápido
- [ ] No hay queries N+1 evidentes

---

## 🎯 PRÓXIMOS HITOS

### Corto Plazo (1-2 semanas)
1. Completar FASE 0-3 de este plan
2. Testing manual exhaustivo
3. Documentación de APIs
4. Deploy en staging (Vercel)

### Mediano Plazo (1 mes)
1. Implementar exportación de reportes
2. Agregar tests unitarios
3. Optimización de performance
4. Deploy en producción

### Largo Plazo (2-3 meses)
1. App móvil para conductores (React Native)
2. Notificaciones en tiempo real (WebSockets)
3. Integración con ERP externo
4. Sistema de facturación automática

---

## 📞 CONTACTO Y SOPORTE

**Desarrollador:** [Tu nombre]
**Email:** [Tu email]
**Repositorio:** [URL del repo]
**Documentación:** Ver README.md

---

**Última actualización:** 07/12/2025
**Próxima revisión:** Después de completar FASE 0-1
