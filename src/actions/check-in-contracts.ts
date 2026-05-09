'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

const CURRENT_BRANCH_CODE = 'CN1';

async function getBranch() {
  return prisma.branch.findUnique({
    where: { code: CURRENT_BRANCH_CODE }
  });
}

// Helper function to get current user ID from session
// TODO: Replace with actual session logic
async function getCurrentUserId(): Promise<string | null> {
  // For now, return null. In production, get from session/auth
  return null;
}

// ===== TYPES =====

export type CheckInContractStatus =
  | "waitingCheckIn"
  | "contractCreated"
  | "cancelled";

export type PaymentCycle = "monthly" | "quarterly";
export type ContractRentalType = "wholeRoom" | "beds";

export type ContractedBed = {
  id: string;
  bedCode: string;
  monthlyRent: number;
};

export type ContractOccupant = {
  id: string;
  fullName: string;
  identityNumber: string;
  gender: "male" | "female" | "other" | "";
  dateOfBirth: string;
  nationality: string;
  isRepresentative: boolean;
};

export type CheckInContractRecord = {
  id: string;
  depositCode: string;
  registrationCode: string;
  paymentCode: string;
  customer: {
    name: string;
    phone: string;
    identityNumber?: string;
    email?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  room: {
    roomCode: string;
    roomCapacity: number;
    contractedBeds: ContractedBed[];
    roomStatus: "ready" | "cleaning" | "maintenance";
  };
  expectedOccupantCount: number;
  occupants: ContractOccupant[];
  depositAmount: number;
  monthlyRent: number;
  serviceFee: number;
  expectedMoveInDate: string;
  depositedAt: string;
  status: CheckInContractStatus;
  note: string;
  contract?: {
    code: string;
    startDate: string;
    paymentCycle: PaymentCycle;
    rentalType: ContractRentalType;
  };
};

export type ContractDraft = {
  startDate: Date;
  endDate?: Date;
  paymentCycle: 'MONTHLY' | 'QUARTERLY';
  depositAmount: number;
  monthlyRent: number;
  serviceFee: number;
  note?: string;
  checkInConfirmed: boolean;
  roomConditionConfirmed: boolean;
  documentConfirmed: boolean;
  occupants: Array<{
    fullName: string;
    identityNumber: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: Date;
    nationality: string;
    isRepresentative: boolean;
  }>;
};

// ===== HELPER FUNCTIONS =====

function shortenId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function transformToCheckInContractRecord(deposit: any): CheckInContractRecord {
  // Get the first room (for display purposes)
  const firstBed = deposit.details[0]?.bed;
  const room = firstBed?.room;

  // Calculate monthly rent (sum of all bed prices)
  const monthlyRent = deposit.details.reduce(
    (sum: number, detail: any) => sum + detail.bed.price,
    0
  );

  // Get latest DEPOSIT payment
  const latestPayment = deposit.payments
    ?.filter((p: any) => p.paymentType === 'DEPOSIT')
    ?.sort((a: any, b: any) => 
      new Date(b.paymentTime || b.createdAt).getTime() - 
      new Date(a.paymentTime || a.createdAt).getTime()
    )[0];

  // Map room status to UI format
  const mapRoomStatus = (status: string): "ready" | "cleaning" | "maintenance" => {
    if (status === 'MAINTENANCE') return 'maintenance';
    if (status === 'FULL') return 'ready';
    return 'ready';
  };

  // Transform contract occupants if exists
  const transformOccupants = (occupants: any[]): ContractOccupant[] => {
    return occupants.map((occ: any) => ({
      id: occ.id,
      fullName: occ.fullName,
      identityNumber: occ.identityNumber,
      gender: occ.gender.toLowerCase() as "male" | "female" | "other" | "",
      dateOfBirth: new Date(occ.dateOfBirth).toISOString(),
      nationality: occ.nationality,
      isRepresentative: occ.isRepresentative,
    }));
  };

  return {
    id: deposit.id,
    depositCode: shortenId(deposit.id),
    registrationCode: shortenId(deposit.registrationId),
    paymentCode: latestPayment ? shortenId(latestPayment.id) : '',
    customer: {
      name: deposit.registration.customerName,
      phone: deposit.registration.phoneNumber,
      identityNumber: deposit.registration.cccd || undefined,
      email: deposit.registration.email || undefined,
      dateOfBirth: deposit.registration.dateOfBirth 
        ? new Date(deposit.registration.dateOfBirth).toISOString()
        : undefined,
      gender: deposit.registration.gender || undefined,
    },
    room: {
      roomCode: room?.name || 'N/A',
      roomCapacity: room?.capacity || 0,
      contractedBeds: deposit.details.map((detail: any) => ({
        id: detail.bed.id,
        bedCode: detail.bed.position,
        monthlyRent: detail.bed.price,
      })),
      roomStatus: mapRoomStatus(room?.status || 'AVAILABLE'),
    },
    expectedOccupantCount: deposit.registration.headcount || 1,
    occupants: deposit.contract?.occupants 
      ? transformOccupants(deposit.contract.occupants)
      : [],
    depositAmount: deposit.depositAmount,
    monthlyRent,
    serviceFee: 0, // Default, can be edited in form
    expectedMoveInDate: deposit.registration.moveInDate 
      ? new Date(deposit.registration.moveInDate).toISOString()
      : new Date().toISOString(),
    depositedAt: deposit.depositedAt 
      ? new Date(deposit.depositedAt).toISOString()
      : new Date().toISOString(),
    status: deposit.contract ? 'contractCreated' : 'waitingCheckIn',
    note: deposit.registration.additionalPreferences || '',
    contract: deposit.contract ? {
      code: deposit.contract.code,
      startDate: new Date(deposit.contract.startDate).toISOString(),
      paymentCycle: deposit.contract.paymentCycle.toLowerCase() as PaymentCycle,
      rentalType: deposit.contract.rentalType === 'WHOLE_ROOM' ? 'wholeRoom' : 'beds',
    } : undefined,
  };
}

// ===== QUERIES =====

/**
 * Get all CONFIRMED deposit tickets ready for check-in
 * Used in: CheckInContractsWorkspace.tsx (left panel list)
 */
export async function getCheckInContractRecords(branchId?: string): Promise<CheckInContractRecord[]> {
  const branch = branchId 
    ? await prisma.branch.findUnique({ where: { id: branchId } })
    : await getBranch();
  
  if (!branch) return [];

  const deposits = await prisma.depositTicket.findMany({
    where: {
      branchId: branch.id,
      status: 'CONFIRMED',
    },
    include: {
      registration: true,
      branch: true,
      details: {
        include: {
          bed: {
            include: {
              room: true,
            },
          },
        },
      },
      payments: {
        where: { paymentType: 'DEPOSIT' },
        orderBy: { paymentTime: 'desc' },
      },
      contract: {
        include: {
          bedDetails: {
            include: {
              bed: true,
            },
          },
          occupants: true,
        },
      },
    },
    orderBy: {
      confirmedAt: 'desc',
    },
  });

  return deposits.map(transformToCheckInContractRecord);
}

/**
 * Get detailed information for a single deposit ticket
 * Used in: CheckInActionPanel.tsx (right panel detail view)
 */
export async function getDepositTicketDetail(depositTicketId: string): Promise<CheckInContractRecord | null> {
  const deposit = await prisma.depositTicket.findUnique({
    where: { id: depositTicketId },
    include: {
      registration: true,
      branch: true,
      details: {
        include: {
          bed: {
            include: {
              room: true,
            },
          },
        },
      },
      payments: true,
      contract: {
        include: {
          bedDetails: {
            include: {
              bed: true,
            },
          },
          occupants: true,
        },
      },
    },
  });

  if (!deposit) {
    return null;
  }

  return transformToCheckInContractRecord(deposit);
}

/**
 * Generate unique contract code for the branch
 * Format: HD001, HD002, HD003, etc.
 * Used internally by createContractFromDeposit
 */
async function generateContractCode(branchId: string): Promise<string> {
  const count = await prisma.contract.count({
    where: { branchId },
  });
  return `HD${String(count + 1).padStart(3, '0')}`;
}

// ===== MUTATIONS =====

/**
 * Create a contract from a confirmed deposit ticket
 * Used in: ContractFormPanel.tsx (form submit)
 */
export async function createContractFromDeposit(
  depositId: string,
  draft: ContractDraft
): Promise<{ success: boolean; contractId?: string; error?: string }> {
  try {
    // 1. Validate deposit ticket
    const depositTicket = await prisma.depositTicket.findUnique({
      where: { id: depositId },
      include: {
        registration: true,
        details: {
          include: {
            bed: {
              include: {
                room: true,
              },
            },
          },
        },
        contract: true,
      },
    });

    if (!depositTicket) {
      return { success: false, error: 'Deposit ticket not found' };
    }

    if (depositTicket.status !== 'CONFIRMED') {
      return { success: false, error: 'Deposit ticket must be CONFIRMED' };
    }

    if (depositTicket.contract) {
      return { success: false, error: 'Contract already exists for this deposit' };
    }

    if (depositTicket.details.length === 0) {
      return { success: false, error: 'Deposit ticket must have at least 1 bed' };
    }

    // 2. Validate confirmations
    if (!draft.checkInConfirmed || !draft.roomConditionConfirmed || !draft.documentConfirmed) {
      return { success: false, error: 'All confirmations are required' };
    }

    // 3. Validate occupants
    if (draft.occupants.length === 0) {
      return { success: false, error: 'At least 1 occupant is required' };
    }

    const hasRepresentative = draft.occupants.some(o => o.isRepresentative);
    if (!hasRepresentative) {
      return { success: false, error: 'At least 1 occupant must be representative' };
    }

    // 4. Determine rental type
    const rooms = new Set(depositTicket.details.map(d => d.bed.roomId));
    const singleRoom = rooms.size === 1;
    const firstRoom = depositTicket.details[0].bed.room;
    const isWholeRoom = singleRoom && depositTicket.details.length === firstRoom.capacity;
    const rentalType = isWholeRoom ? 'WHOLE_ROOM' : 'BEDS';

    // 5. Generate contract code
    const contractCode = await generateContractCode(depositTicket.branchId);

    // 6. Get current user ID
    const currentUserId = await getCurrentUserId();

    // 7. Create contract in transaction
    const contract = await prisma.$transaction(async (tx) => {
      // Create contract
      const newContract = await tx.contract.create({
        data: {
          code: contractCode,
          registrationId: depositTicket.registrationId,
          depositTicketId: depositTicket.id,
          branchId: depositTicket.branchId,
          rentalType,
          paymentCycle: draft.paymentCycle,
          status: 'ACTIVE',
          startDate: draft.startDate,
          endDate: draft.endDate,
          depositAmount: draft.depositAmount,
          monthlyRent: draft.monthlyRent,
          serviceFee: draft.serviceFee,
          note: draft.note,
          checkInConfirmed: draft.checkInConfirmed,
          roomConditionConfirmed: draft.roomConditionConfirmed,
          documentConfirmed: draft.documentConfirmed,
          createdById: currentUserId,
        },
      });

      // Create contract bed details
      await tx.contractBedDetail.createMany({
        data: depositTicket.details.map((detail) => ({
          contractId: newContract.id,
          bedId: detail.bedId,
          priceAtSigning: detail.bed.price,
          startDate: draft.startDate,
          endDate: draft.endDate,
        })),
      });

      // Create contract occupants
      await tx.contractOccupant.createMany({
        data: draft.occupants.map((occupant) => ({
          contractId: newContract.id,
          fullName: occupant.fullName,
          identityNumber: occupant.identityNumber,
          gender: occupant.gender,
          dateOfBirth: occupant.dateOfBirth,
          nationality: occupant.nationality,
          isRepresentative: occupant.isRepresentative,
        })),
      });

      // Update bed status: DEPOSITED → OCCUPIED
      await tx.bed.updateMany({
        where: {
          id: {
            in: depositTicket.details.map((d) => d.bedId),
          },
        },
        data: {
          status: 'OCCUPIED',
        },
      });

      // Update room occupancy (only if single room)
      if (singleRoom && firstRoom) {
        const newOccupancy = firstRoom.occupancy + depositTicket.details.length;
        await tx.room.update({
          where: { id: firstRoom.id },
          data: {
            occupancy: newOccupancy,
            status: newOccupancy >= firstRoom.capacity ? 'FULL' : firstRoom.status,
          },
        });
      }

      return newContract;
    });

    // Revalidate paths
    revalidatePath('/dashboard/check-in-contracts');
    revalidatePath('/dashboard/deposits');
    revalidatePath('/dashboard/rooms');

    return { success: true, contractId: contract.id };
  } catch (error) {
    console.error('Error creating contract:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
