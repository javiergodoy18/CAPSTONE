/*
  Warnings:

  - You are about to drop the column `actualPickupDate` on the `dispatches` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `dispatches` table. All the data in the column will be lost.
  - You are about to drop the column `customPrice` on the `dispatches` table. All the data in the column will be lost.
  - You are about to drop the column `dispatchCost` on the `dispatches` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDeliveryDate` on the `dispatches` table. All the data in the column will be lost.
  - You are about to drop the column `laboratoryId` on the `dispatches` table. All the data in the column will be lost.
  - You are about to drop the column `merchandiseValue` on the `dispatches` table. All the data in the column will be lost.
  - You are about to drop the column `percentageApplied` on the `dispatches` table. All the data in the column will be lost.
  - You are about to drop the column `pickupNotes` on the `dispatches` table. All the data in the column will be lost.
  - You are about to drop the column `pricingType` on the `dispatches` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledPickupDate` on the `dispatches` table. All the data in the column will be lost.
  - Added the required column `pickupId` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledStartDate` to the `dispatches` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."dispatches" DROP CONSTRAINT "dispatches_laboratoryId_fkey";

-- AlterTable
ALTER TABLE "deliveries" ADD COLUMN     "pickupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "dispatches" DROP COLUMN "actualPickupDate",
DROP COLUMN "completedAt",
DROP COLUMN "customPrice",
DROP COLUMN "dispatchCost",
DROP COLUMN "estimatedDeliveryDate",
DROP COLUMN "laboratoryId",
DROP COLUMN "merchandiseValue",
DROP COLUMN "percentageApplied",
DROP COLUMN "pickupNotes",
DROP COLUMN "pricingType",
DROP COLUMN "scheduledPickupDate",
ADD COLUMN     "actualEndDate" TIMESTAMP(3),
ADD COLUMN     "actualStartDate" TIMESTAMP(3),
ADD COLUMN     "scheduledEndDate" TIMESTAMP(3),
ADD COLUMN     "scheduledStartDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalMerchandiseValue" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "pickups" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "actualPickupTime" TIMESTAMP(3),
    "merchandiseValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dispatchCost" DOUBLE PRECISION,
    "pricingType" TEXT NOT NULL DEFAULT 'percentage',
    "percentageApplied" DOUBLE PRECISION,
    "customPrice" DOUBLE PRECISION,
    "pickupNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "dispatches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "laboratories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "pickups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
