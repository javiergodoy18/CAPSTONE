-- Migration: Add custom pricing concept field to pickups table
-- Date: 2025-12-01
-- Description: Adds customPriceConcept field to support custom pricing descriptions

-- Add the customPriceConcept column to the pickups table
ALTER TABLE pickups
ADD COLUMN IF NOT EXISTS "customPriceConcept" TEXT;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN pickups."customPriceConcept" IS 'Descripción o concepto del precio personalizado (ej: Servicio especial, Carga frágil)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pickups' AND column_name = 'customPriceConcept';
