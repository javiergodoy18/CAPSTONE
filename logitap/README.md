# 🚚 LOGITAP - Sistema de Gestión Logística

Sistema completo de gestión de transporte y logística para empresas de distribución.

## 📋 Características

- ✅ Gestión de Vehículos y Conductores
- ✅ Gestión de Laboratorios y Farmacias
- ✅ Creación de Viajes con múltiples pickups y deliveries
- ✅ Cálculo automático de costos por porcentaje
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Sistema de rutas optimizado

## 🛠️ Tecnologías

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Next.js API Routes
- **Base de Datos:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Estilos:** CSS Modules + Tailwind CSS

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/logitap.git
cd logitap
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
```

### 4. Ejecutar migraciones de base de datos
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. (Opcional) Cargar datos de prueba
```bash
npm run seed
```

### 6. Iniciar servidor de desarrollo
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🗂️ Estructura del Proyecto
```
logistics-transport-system/
├── app/                      # Páginas y rutas (Next.js App Router)
│   ├── api/                 # API Routes
│   │   ├── dispatches/     # CRUD de viajes
│   │   ├── pickups/        # CRUD de recogidas
│   │   ├── deliveries/     # CRUD de entregas
│   │   ├── vehicles/       # CRUD de vehículos
│   │   ├── drivers/        # CRUD de conductores
│   │   ├── laboratories/   # CRUD de laboratorios
│   │   └── pharmacies/     # CRUD de farmacias
│   ├── dispatches/         # Páginas de viajes
│   ├── vehicles/           # Páginas de vehículos
│   ├── drivers/            # Páginas de conductores
│   ├── laboratories/       # Páginas de laboratorios
│   ├── pharmacies/         # Páginas de farmacias
│   ├── components/         # Componentes React
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Dashboard principal
│   └── globals.css         # Estilos globales
├── prisma/
│   ├── schema.prisma       # Esquema de base de datos
│   └── migrations/         # Migraciones
├── lib/
│   ├── prisma.ts           # Cliente Prisma
│   └── pricing.ts          # Funciones de cálculo de precios
├── scripts/
│   └── seed.ts             # Script para datos de prueba
├── .env                     # Variables de entorno (NO SUBIR A GIT)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 💰 Lógica de Precios

El sistema calcula costos automáticamente basado en el valor de la mercancía:

- Hasta $22,000: **3%**
- $22,001 - $30,000: **2.75%**
- Más de $30,000: **2.5%**

## 🚀 Scripts Disponibles
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilar para producción
npm start            # Iniciar servidor de producción
npm run lint         # Ejecutar linter
npm run seed         # Cargar datos de prueba
```

## 📊 Modelo de Datos

### Entidades Principales:

- **Dispatch** (Viaje): Contiene información del viaje completo
- **Pickup**: Recogida en laboratorio (múltiples por viaje)
- **Delivery**: Entrega a farmacia (múltiples por pickup)
- **Vehicle**: Vehículos de la flota
- **Driver**: Conductores
- **Laboratory**: Laboratorios (origen)
- **Pharmacy**: Farmacias (destino)

## 🔐 Variables de Entorno Requeridas
```env
DATABASE_URL=            # URL de conexión a PostgreSQL
```

## 👨‍💻 Desarrollo

Este proyecto fue desarrollado como tesis para la carrera de Ingeniería en Computación en Duoc UC.

**Autor:** Javier Godoy
**Año:** 2024

## 📄 Licencia

Este proyecto es privado y de uso académico.
