-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'ENDED');

-- CreateEnum
CREATE TYPE "ContractRentalType" AS ENUM ('WHOLE_ROOM', 'BEDS');

-- CreateEnum
CREATE TYPE "PaymentCycle" AS ENUM ('MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "OccupantGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "depositTicketId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "rentalType" "ContractRentalType" NOT NULL,
    "paymentCycle" "PaymentCycle" NOT NULL DEFAULT 'MONTHLY',
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "depositAmount" DOUBLE PRECISION NOT NULL,
    "monthlyRent" DOUBLE PRECISION NOT NULL,
    "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "note" TEXT,
    "checkInConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "roomConditionConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "documentConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractBedDetail" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "priceAtSigning" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractBedDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractOccupant" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "identityNumber" TEXT NOT NULL,
    "gender" "OccupantGender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Việt Nam',
    "isRepresentative" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractOccupant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_code_key" ON "Contract"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_depositTicketId_key" ON "Contract"("depositTicketId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractBedDetail_contractId_bedId_key" ON "ContractBedDetail"("contractId", "bedId");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "RegistrationTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_depositTicketId_fkey" FOREIGN KEY ("depositTicketId") REFERENCES "DepositTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractBedDetail" ADD CONSTRAINT "ContractBedDetail_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractBedDetail" ADD CONSTRAINT "ContractBedDetail_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractOccupant" ADD CONSTRAINT "ContractOccupant_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
