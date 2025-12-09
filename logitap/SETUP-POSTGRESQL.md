# 🐘 Setup PostgreSQL Local - GUÍA RÁPIDA

## ✅ LO QUE YA ESTÁ LISTO:

- ✅ `.env` actualizado con conexión local
- ✅ Scripts automáticos creados
- ✅ Dependencias instaladas (tsx, bcryptjs)
- ✅ Todo preparado para ejecutarse

---

## 🔽 PASO 1: INSTALAR POSTGRESQL (5 minutos)

### Descarga PostgreSQL 16:

**Link directo de descarga:**
👉 https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

**O usa este link directo:**
👉 https://sbp.enterprisedb.com/getfile.jsp?fileid=1258893

### Durante la instalación:

1. **Components:** Deja todo marcado ✅
2. **Password:** Escribe: `logitap123` ⚠️ ¡MUY IMPORTANTE!
3. **Port:** Deja `5432`
4. **Locale:** Deja "Default locale"
5. Click "Next" hasta finalizar

### Agregar PostgreSQL al PATH:

1. Presiona `Windows + R`
2. Escribe: `sysdm.cpl` y Enter
3. Pestaña "Avanzado" → "Variables de entorno"
4. En "Variables del sistema", busca "Path" → "Editar"
5. Click "Nuevo" y agrega: `C:\Program Files\PostgreSQL\16\bin`
6. Click "OK" en todo

### Verificar instalación:

Abre una **NUEVA** PowerShell y ejecuta:
```powershell
psql --version
```

Deberías ver: `psql (PostgreSQL) 16.x`

---

## 🚀 PASO 2: EJECUTAR SETUP AUTOMÁTICO

Una vez instalado PostgreSQL, ejecuta en PowerShell:

```powershell
cd C:\Users\milit\Documents\logistics-transport-system\logitap

# Ejecutar setup completo (1 solo comando)
.\setup-complete.bat
```

Este script hará **AUTOMÁTICAMENTE**:
1. ✅ Crear base de datos `logitap`
2. ✅ Crear usuario `logitap_user`
3. ✅ Configurar permisos
4. ✅ Generar Prisma Client
5. ✅ Crear todas las tablas (11 tablas)
6. ✅ Crear usuario admin

**Cuando pida contraseña:** Escribe `logitap123`

---

## 📊 PASO 3: VERIFICAR TODO FUNCIONA

### Opción A: Prisma Studio (Visual)

```powershell
npx prisma studio
```

Abre: http://localhost:5555

Verás:
- ✅ Tabla "User" con el usuario admin
- ✅ Todas las demás tablas (Vehicle, Driver, Dispatch, etc.)

### Opción B: Script de testing

```powershell
node test-db-connection.js
```

Deberías ver:
```
✅ Conexión exitosa!
✅ Usuarios en BD: 1
✅ Usuarios encontrados:
   1. admin@logitap.com (ADMIN) - Administrador Sistema
```

---

## 🎯 PASO 4: INICIAR SERVIDOR Y LOGIN

```powershell
# Limpiar caché
Remove-Item -Recurse -Force .next

# Iniciar servidor
npm run dev
```

Abre el navegador en: **http://localhost:3002/login**

**Credenciales:**
- 📧 Email: `admin@logitap.com`
- 🔑 Password: `Admin123`

---

## ❓ TROUBLESHOOTING

### Error: "psql: command not found"
→ No agregaste PostgreSQL al PATH
→ **Solución:** Repite el paso de agregar al PATH y abre una NUEVA terminal

### Error: "password authentication failed"
→ La contraseña no es `logitap123`
→ **Solución:** Reinstala PostgreSQL con la contraseña correcta

### Error: "database logitap does not exist"
→ El script setup-complete.bat no se ejecutó correctamente
→ **Solución:** Ejecuta manualmente:
```powershell
psql -U postgres -f setup-postgres.sql
# Contraseña: logitap123
```

### Error: "connection refused"
→ PostgreSQL no está corriendo
→ **Solución en Windows:**
   1. Abre "Servicios" (Services)
   2. Busca "postgresql-x64-16"
   3. Click derecho → "Iniciar"

### Error en setup-complete.bat
→ Ejecuta los comandos manualmente uno por uno:
```powershell
# 1. Crear BD
psql -U postgres -f setup-postgres.sql

# 2. Generar Prisma
npx prisma generate

# 3. Crear tablas
npx prisma db push

# 4. Crear admin
npx tsx scripts/seed-admin.ts
```

---

## 📁 ARCHIVOS CREADOS

| Archivo | Descripción |
|---------|-------------|
| `setup-postgres.sql` | Script SQL para crear BD y usuario |
| `setup-complete.bat` | Setup automático completo |
| `scripts/seed-admin.ts` | Script para crear usuario admin |
| `SETUP-POSTGRESQL.md` | Esta guía |

---

## 🎉 RESULTADO ESPERADO

Al finalizar tendrás:

✅ PostgreSQL 16 instalado y corriendo
✅ Base de datos `logitap` creada
✅ Usuario `logitap_user` con permisos
✅ 11 tablas creadas (User, Driver, Vehicle, Dispatch, etc.)
✅ Usuario admin creado
✅ Login funcionando
✅ Dashboard mostrando KPIs

---

## 📞 SIGUIENTE PASO DESPUÉS DE INSTALAR POSTGRESQL

**EJECUTA:**
```powershell
.\setup-complete.bat
```

¡Y listo! Todo se configurará automáticamente.
