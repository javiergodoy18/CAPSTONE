-- Migration: Add profileImage field to User table
-- Run this manually when database is available:
-- psql -U postgres -d your_database < migration-add-profile-image.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS "profileImage" TEXT;

COMMENT ON COLUMN users."profileImage" IS 'Base64 encoded profile image or URL';
