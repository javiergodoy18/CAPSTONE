-- Script de configuración automática de PostgreSQL para Logitap
-- Ejecutar con: psql -U postgres -f setup-postgres.sql

-- Crear base de datos
DROP DATABASE IF EXISTS logitap;
CREATE DATABASE logitap;

-- Crear usuario
DROP USER IF EXISTS logitap_user;
CREATE USER logitap_user WITH PASSWORD 'logitap123';

-- Dar permisos
ALTER DATABASE logitap OWNER TO logitap_user;
GRANT ALL PRIVILEGES ON DATABASE logitap TO logitap_user;

-- Conectar a la base de datos
\c logitap

-- Dar permisos en el schema public
GRANT ALL ON SCHEMA public TO logitap_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO logitap_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO logitap_user;

-- Mostrar confirmación
\echo '✅ Base de datos logitap creada'
\echo '✅ Usuario logitap_user creado con password: logitap123'
\echo '✅ Permisos configurados'
\echo ''
\echo 'Siguiente paso: Ejecuta npm run setup:db'
