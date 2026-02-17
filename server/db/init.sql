-- Script de Inicialización de Base de Datos para Cootransures
-- Base de Datos Recomendada: PostgreSQL
-- Herramientas recomendadas: pgAdmin o DBeaver

-- 1. Crear la Base de Datos (Ejecutar esto por separado si es necesario)
-- CREATE DATABASE cootransures_db;

-- 2. Crear la Tabla de Reportes
CREATE TABLE IF NOT EXISTS public.reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,           -- Título del reporte
    filename VARCHAR(255) NOT NULL,        -- Nombre del archivo físico
    file_path TEXT NOT NULL,               -- Ruta relativa o URL de acceso
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    size_bytes BIGINT,                     -- Tamaño en bytes
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Fecha de subida
    is_active BOOLEAN DEFAULT TRUE         -- Para borrado lógico (opcional)
);

-- 3. Crear un Índice para búsquedas rápidas de reportes activos
CREATE INDEX IF NOT EXISTS idx_reports_active ON public.reports(is_active);

-- 4. Crear tabla de Usuarios Administradores (Opcional - mejor que 'hardcodear')
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Guardar hash BCrypt, ¡nunca texto plano!
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ejemplo de Inserción (NO USAR EN PRODUCCIÓN SIN CAMBIAR LA CONTRASEÑA)
-- 'admin123' hasheado con bcrypt cost 10:
-- INSERT INTO public.users (username, password_hash) VALUES ('admin', '$2b$10$YourHashedPasswordHere...');

COMMENT ON TABLE public.reports IS 'Almacena metadatos para los reportes PDF subidos';
