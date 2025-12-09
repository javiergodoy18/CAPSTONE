-- Migration: Add custom pricing fields to deliveries table
-- Date: 2025-12-01
-- Description: Adds delivery-level custom pricing fields to support per-delivery pricing

-- Add the isCustomPricing column to the deliveries table
ALTER TABLE deliveries
ADD COLUMN IF NOT EXISTS "isCustomPricing" BOOLEAN NOT NULL DEFAULT false;

-- Add the customPriceConcept column to the deliveries table
ALTER TABLE deliveries
ADD COLUMN IF NOT EXISTS "customPriceConcept" TEXT;

-- Add the customPriceAmount column to the deliveries table
ALTER TABLE deliveries
ADD COLUMN IF NOT EXISTS "customPriceAmount" DOUBLE PRECISION;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN deliveries."isCustomPricing" IS 'Indica si esta entrega usa precio personalizado en lugar del valor de mercadería';
COMMENT ON COLUMN deliveries."customPriceConcept" IS 'Descripción o concepto del precio personalizado (ej: Servicio especial, Carga frágil)';
COMMENT ON COLUMN deliveries."customPriceAmount" IS 'Monto del precio personalizado (usado cuando isCustomPricing es true)';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'deliveries'
AND column_name IN ('isCustomPricing', 'customPriceConcept', 'customPriceAmount')
ORDER BY column_name;
