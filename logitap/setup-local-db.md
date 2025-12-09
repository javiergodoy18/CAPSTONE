# Setup Base de Datos Local (Temporal)

## Opción A: PostgreSQL Local

1. **Instala PostgreSQL:**
   - Descarga: https://www.postgresql.org/download/windows/
   - O usa Chocolatey: `choco install postgresql`

2. **Crea la base de datos:**
   ```bash
   createdb logitap_dev
   ```

3. **Actualiza `.env`:**
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/logitap_dev"
   DIRECT_URL="postgresql://postgres:password@localhost:5432/logitap_dev"
   ```

4. **Ejecuta migraciones:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

## Opción B: SQLite (Más simple)

1. **Actualiza `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. **Ejecuta:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Reinicia el servidor**
