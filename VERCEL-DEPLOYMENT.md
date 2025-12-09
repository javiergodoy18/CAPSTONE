# 🚀 LOGITAP - Vercel Deployment Guide

## Proyecto Info
- **Nombre**: Logitap
- **Framework**: Next.js 15 + TypeScript
- **Database**: Supabase PostgreSQL
- **Root Directory**: logitap

---

## 📋 PASOS PARA DEPLOYMENT

### 1. Importar Proyecto en Vercel

1. Ve a: https://vercel.com/new
2. Click en "Import Git Repository"
3. Selecciona el repo: **CAPSTONE**
4. Click "Import"

### 2. Configuración del Proyecto

**Framework Preset**: Next.js ✅ (auto-detectado)

**Root Directory**: 
```
logitap
✅ Marca: "Include source files outside of Root Directory in the Build Step"
```

**Build Settings**:
```
Build Command: npm run build (auto)
Output Directory: .next (auto)
Install Command: npm install (auto)
Node.js Version: 18.x
```

### 3. Variables de Entorno

Agrega estas 7 variables (marca Production, Preview, Development en todas):

**DATABASE_URL**
```
postgresql://postgres.tyvzxtrctlujmifhukea:%40Javi06051803@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**DIRECT_URL**
```
postgresql://postgres.tyvzxtrctlujmifhukea:%40Javi06051803@db.tyvzxtrctlujmifhukea.supabase.co:5432/postgres
```

**JWT_SECRET**
```
production-jwt-logitap-2025-super-seguro-12345
```

**NEXTAUTH_SECRET**
```
production-nextauth-logitap-2025-67890
```

**NEXTAUTH_URL**
```
https://TU-PROYECTO.vercel.app
```
⚠️ Actualizar después del primer deploy con la URL real

**NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**
```
AIzaSyD1WV-HM7ffqEb4qiXEF_YmQ7BTBZeQriI
```

**NODE_ENV**
```
production
```
(Solo marcar Production)

### 4. Deploy

1. Click "Deploy"
2. Esperar 2-3 minutos
3. Copiar la URL de Vercel
4. Actualizar NEXTAUTH_URL con la URL real
5. Redeploy

---

## ✅ Post-Deployment Checklist

- [ ] Página principal carga
- [ ] Login admin funciona (admin@logitap.com / admin123)
- [ ] Dashboard muestra datos
- [ ] Mapa carga correctamente
- [ ] Crear viaje funciona
- [ ] Tracking GPS funciona
- [ ] Login conductor funciona

---

## 🔧 Troubleshooting

**Error: "Can't reach database server"**
→ Verifica que Supabase esté ACTIVE (no PAUSED)

**Error: "404 NOT_FOUND"**
→ Verifica Root Directory = "logitap"

**Error: "Prisma Client not generated"**
→ Ya está configurado en postinstall

**Error: "NEXTAUTH_URL undefined"**
→ Verifica que NEXTAUTH_URL tenga la URL correcta de Vercel

---

Desarrollado por: Javier Godoy
Proyecto: Logitap - Sistema de Gestión Logística Farmacéutica
