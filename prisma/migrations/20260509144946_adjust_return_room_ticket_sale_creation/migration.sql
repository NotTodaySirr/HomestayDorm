/*
  Warnings:

  - You are about to drop the column `handoverSnapshot` on the `ReturnRoomTicket` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `ReturnRoomTicket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReturnRoomTicket" DROP COLUMN "handoverSnapshot",
DROP COLUMN "priority",
ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "ReturnRoomTicket" ADD CONSTRAINT "ReturnRoomTicket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
