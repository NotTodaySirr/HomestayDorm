-- CreateEnum
CREATE TYPE "ReturnRoomTicketStatus" AS ENUM ('PENDING_MANAGER_REVIEW', 'RECONCILING', 'WAITING_ACCOUNTING', 'ACCOUNTING_RESULT_READY', 'WAITING_CUSTOMER_CONFIRMATION', 'CUSTOMER_CONFIRMED', 'NEEDS_RECHECK', 'WAITING_DEPOSIT_REFUND', 'WAITING_EXTRA_PAYMENT', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReturnTicketPriority" AS ENUM ('NORMAL', 'URGENT', 'OVERDUE');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "contractId" TEXT,
ADD COLUMN     "direction" TEXT,
ADD COLUMN     "reconciliationTicketId" TEXT;

-- CreateTable
CREATE TABLE "ReturnRoomTicket" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "status" "ReturnRoomTicketStatus" NOT NULL DEFAULT 'PENDING_MANAGER_REVIEW',
    "priority" "ReturnTicketPriority" NOT NULL DEFAULT 'NORMAL',
    "expectedReturnDate" TIMESTAMP(3) NOT NULL,
    "actualReturnDate" TIMESTAMP(3),
    "saleNote" TEXT,
    "handoverSnapshot" JSONB,
    "customerConfirmationStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "customerConfirmedAt" TIMESTAMP(3),
    "customerDisagreementReason" TEXT,
    "roomFinalizationStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "roomFinalizationNote" TEXT,
    "roomFinalizedAt" TIMESTAMP(3),
    "roomStatusAfterCheckout" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRoomTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationTicket" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "returnRoomTicketId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "hygieneStatus" TEXT,
    "keycardStatus" TEXT,
    "hasDamageOrLoss" BOOLEAN NOT NULL DEFAULT false,
    "managerNotes" TEXT,
    "depositAmount" DOUBLE PRECISION,
    "refundRate" DOUBLE PRECISION,
    "baseRefund" DOUBLE PRECISION,
    "totalDeductions" DOUBLE PRECISION,
    "finalAmount" DOUBLE PRECISION,
    "resultDirection" TEXT,
    "conclusion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReconciliationTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationDetail" (
    "id" TEXT NOT NULL,
    "reconciliationTicketId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReconciliationDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnRoomTicketBedUpdate" (
    "id" TEXT NOT NULL,
    "returnRoomTicketId" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "statusBefore" TEXT NOT NULL,
    "statusAfter" TEXT NOT NULL,
    "inspectionResult" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnRoomTicketBedUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRoomTicket_code_key" ON "ReturnRoomTicket"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ReconciliationTicket_code_key" ON "ReconciliationTicket"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ReconciliationTicket_returnRoomTicketId_key" ON "ReconciliationTicket"("returnRoomTicketId");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRoomTicketBedUpdate_returnRoomTicketId_bedId_key" ON "ReturnRoomTicketBedUpdate"("returnRoomTicketId", "bedId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reconciliationTicketId_fkey" FOREIGN KEY ("reconciliationTicketId") REFERENCES "ReconciliationTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRoomTicket" ADD CONSTRAINT "ReturnRoomTicket_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRoomTicket" ADD CONSTRAINT "ReturnRoomTicket_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationTicket" ADD CONSTRAINT "ReconciliationTicket_returnRoomTicketId_fkey" FOREIGN KEY ("returnRoomTicketId") REFERENCES "ReturnRoomTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationDetail" ADD CONSTRAINT "ReconciliationDetail_reconciliationTicketId_fkey" FOREIGN KEY ("reconciliationTicketId") REFERENCES "ReconciliationTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRoomTicketBedUpdate" ADD CONSTRAINT "ReturnRoomTicketBedUpdate_returnRoomTicketId_fkey" FOREIGN KEY ("returnRoomTicketId") REFERENCES "ReturnRoomTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRoomTicketBedUpdate" ADD CONSTRAINT "ReturnRoomTicketBedUpdate_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
