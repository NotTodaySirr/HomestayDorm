-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ACCOUNTANT';

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "amenities" TEXT,
ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'all',
ADD COLUMN     "roomType" TEXT NOT NULL DEFAULT 'ktx';
