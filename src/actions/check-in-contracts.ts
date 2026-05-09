'use server';

import prisma from '@/lib/db';
import type { RoomBedUpdateSubmission } from '@/lib/return-room-tickets/types';
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
    id: string;
    code: string;
    startDate: string;
    endDate?: string;
    paymentCycle: PaymentCycle;
    rentalType: ContractRentalType;
    status: "active" | "cancelled" | "ended";
    returnTicket?: {
      id: string;
      code: string;
      status: string;
    };
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
      id: deposit.contract.id,
      code: deposit.contract.code,
      startDate: new Date(deposit.contract.startDate).toISOString(),
      endDate: deposit.contract.endDate
        ? new Date(deposit.contract.endDate).toISOString()
        : undefined,
      paymentCycle: deposit.contract.paymentCycle.toLowerCase() as PaymentCycle,
      rentalType: deposit.contract.rentalType === 'WHOLE_ROOM' ? 'wholeRoom' : 'beds',
      status: deposit.contract.status.toLowerCase() as "active" | "cancelled" | "ended",
      returnTicket: deposit.contract.returnRoomTickets?.[0]
        ? {
            id: deposit.contract.returnRoomTickets[0].id,
            code: deposit.contract.returnRoomTickets[0].code,
            status: deposit.contract.returnRoomTickets[0].status,
          }
        : undefined,
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
          returnRoomTickets: {
            where: {
              status: { not: 'COMPLETED' },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
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
          returnRoomTickets: {
            where: {
              status: { not: 'COMPLETED' },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
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

async function generateReturnRoomTicketCode(branchId: string): Promise<string> {
  const count = await prisma.returnRoomTicket.count({
    where: { branchId },
  });
  return `PTP${String(count + 1).padStart(3, '0')}`;
}

async function generateReconciliationTicketCode(branchId: string, returnTicketCode?: string): Promise<string> {
  const codeFromReturnTicket = returnTicketCode?.replace(/^PTP/, 'PDS');

  if (codeFromReturnTicket) {
    const existing = await prisma.reconciliationTicket.findUnique({
      where: { code: codeFromReturnTicket },
      select: { id: true },
    });

    if (!existing) {
      return codeFromReturnTicket;
    }
  }

  const count = await prisma.returnRoomTicket.count({
    where: {
      branchId,
      reconciliation: {
        isNot: null,
      },
    },
  });

  return `PDS${String(count + 1).padStart(3, '0')}`;
}

export type CreateReturnRoomTicketInput = {
  expectedReturnDate: Date;
  saleNote?: string;
};

export async function createReturnRoomTicketFromContract(
  contractId: string,
  input: CreateReturnRoomTicketInput,
): Promise<{ success: boolean; ticketId?: string; ticketCode?: string; error?: string }> {
  try {
    if (!input.expectedReturnDate || Number.isNaN(input.expectedReturnDate.getTime())) {
      return { success: false, error: 'Ngày dự kiến trả phòng là bắt buộc' };
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        returnRoomTickets: {
          where: { status: { not: 'COMPLETED' } },
          take: 1,
        },
      },
    });

    if (!contract) {
      return { success: false, error: 'Không tìm thấy hợp đồng' };
    }

    if (contract.status !== 'ACTIVE') {
      return { success: false, error: 'Chỉ hợp đồng đang hiệu lực mới tạo được phiếu trả phòng' };
    }

    if (contract.returnRoomTickets.length > 0) {
      return { success: false, error: 'Hợp đồng đã có phiếu trả phòng đang xử lý' };
    }

    const currentUserId = await getCurrentUserId();
    const code = await generateReturnRoomTicketCode(contract.branchId);

    const ticket = await prisma.returnRoomTicket.create({
      data: {
        code,
        contractId: contract.id,
        branchId: contract.branchId,
        expectedReturnDate: input.expectedReturnDate,
        saleNote: input.saleNote?.trim() || null,
        createdById: currentUserId,
      },
    });

    revalidatePath('/dashboard/check-in-contracts');
    revalidatePath('/dashboard/return-room-tickets');

    return { success: true, ticketId: ticket.id, ticketCode: ticket.code };
  } catch (error) {
    console.error('Error creating return-room ticket:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export type CreateReconciliationTicketInput = {
  hygieneStatus: 'passed' | 'failed';
  keycardStatus: 'complete' | 'missing';
  hasDamageOrLoss: boolean;
  damageDescription?: string;
  estimatedCost: number;
  managerNotes?: string;
};

export async function createReconciliationTicket(
  returnRoomTicketId: string,
  input: CreateReconciliationTicketInput,
): Promise<{
  success: boolean;
  ticket?: import('@/lib/return-room-tickets/types').ReturnRoomTicket;
  error?: string;
}> {
  try {
    const estimatedCost = Number(input.estimatedCost) || 0;

    if (estimatedCost < 0) {
      return { success: false, error: 'Estimated cost cannot be negative' };
    }

    const ticket = await prisma.returnRoomTicket.findUnique({
      where: { id: returnRoomTicketId },
      include: {
        reconciliation: true,
      },
    });

    if (!ticket) {
      return { success: false, error: 'Return-room ticket not found' };
    }

    if (!['PENDING_MANAGER_REVIEW', 'NEEDS_RECHECK'].includes(ticket.status)) {
      return {
        success: false,
        error: 'This return-room ticket is not ready for reconciliation',
      };
    }

    const reconciliationCode =
      ticket.reconciliation?.code ??
      (await generateReconciliationTicketCode(ticket.branchId, ticket.code));
    const hasManagerDeduction =
      estimatedCost > 0 || Boolean(input.damageDescription?.trim());

    const updatedTicketId = await prisma.$transaction(async (tx) => {
      const reconciliation = await tx.reconciliationTicket.upsert({
        where: { returnRoomTicketId },
        create: {
          code: reconciliationCode,
          returnRoomTicketId,
          status: 'Chờ kế toán xử lý',
          hygieneStatus: input.hygieneStatus,
          keycardStatus: input.keycardStatus,
          hasDamageOrLoss: input.hasDamageOrLoss,
          managerNotes: input.managerNotes?.trim() || null,
          depositAmount: null,
          refundRate: null,
          baseRefund: null,
          totalDeductions: null,
          finalAmount: null,
          resultDirection: null,
          conclusion: null,
        },
        update: {
          status: 'Chờ kế toán xử lý',
          hygieneStatus: input.hygieneStatus,
          keycardStatus: input.keycardStatus,
          hasDamageOrLoss: input.hasDamageOrLoss,
          managerNotes: input.managerNotes?.trim() || null,
          depositAmount: null,
          refundRate: null,
          baseRefund: null,
          totalDeductions: null,
          finalAmount: null,
          resultDirection: null,
          conclusion: null,
        },
      });

      await tx.reconciliationDetail.deleteMany({
        where: { reconciliationTicketId: reconciliation.id },
      });

      if (hasManagerDeduction) {
        await tx.reconciliationDetail.create({
          data: {
            reconciliationTicketId: reconciliation.id,
            source: 'manager',
            description:
              input.damageDescription?.trim() || 'Khoản khấu trừ quản lý',
            quantity: 1,
            unitPrice: estimatedCost,
            amount: estimatedCost,
            status: 'estimated',
          },
        });
      }

      const updatedTicket = await tx.returnRoomTicket.update({
        where: { id: returnRoomTicketId },
        data: {
          status: 'WAITING_ACCOUNTING',
          customerConfirmationStatus: 'NOT_STARTED',
          customerConfirmedAt: null,
          customerDisagreementReason: null,
        },
        select: { id: true },
      });

      return updatedTicket.id;
    });

    const updatedTicket = await prisma.returnRoomTicket.findUnique({
      where: { id: updatedTicketId },
      include: returnRoomTicketInclude,
    });

    if (!updatedTicket) {
      return { success: false, error: 'Unable to reload updated ticket' };
    }

    revalidatePath('/dashboard/return-room-tickets');
    revalidatePath('/dashboard/payment-slips');

    return { success: true, ticket: mapReturnRoomTicket(updatedTicket) };
  } catch (error) {
    console.error('Error creating reconciliation ticket:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function confirmReturnRoomCustomerResponse(
  returnRoomTicketId: string,
  agreed: boolean,
  disagreementReason?: string
): Promise<{ success: boolean; ticket?: import('@/lib/return-room-tickets/types').ReturnRoomTicket; error?: string }> {
  try {
    const ticket = await prisma.returnRoomTicket.findUnique({
      where: { id: returnRoomTicketId },
    });

    if (!ticket) {
      return { success: false, error: 'Return-room ticket not found' };
    }

    if (ticket.status === 'COMPLETED') {
      return { success: false, error: 'Phiếu này đã hoàn tất xử lý.' };
    }

    if (
      ![
        'WAITING_CUSTOMER_CONFIRMATION',
        'ACCOUNTING_RESULT_READY',
        'CUSTOMER_CONFIRMED',
        'NEEDS_RECHECK',
      ].includes(ticket.status)
    ) {
      return { success: false, error: 'Phiếu này hiện không ở trạng thái chờ khách xác nhận.' };
    }

    const disagreementNote = disagreementReason?.trim() || 'Customer requested accounting to recheck the payment calculation.';

    const updated = await prisma.returnRoomTicket.update({
      where: { id: returnRoomTicketId },
      data: agreed
        ? {
            status: 'CUSTOMER_CONFIRMED',
            customerConfirmationStatus: 'AGREED',
            customerConfirmedAt: new Date(),
            customerDisagreementReason: null,
          }
        : {
            status: 'NEEDS_RECHECK',
            customerConfirmationStatus: 'DISAGREED',
            customerConfirmedAt: null,
            customerDisagreementReason: disagreementNote,
          },
      include: returnRoomTicketInclude,
    });

    revalidatePath('/dashboard/return-room-tickets');
    revalidatePath('/dashboard/payment-slips');

    return { success: true, ticket: mapReturnRoomTicket(updated) };
  } catch (error) {
    console.error('Error confirming return room customer response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function finalizeReturnRoomStatus(
  returnRoomTicketId: string,
  input: RoomBedUpdateSubmission,
): Promise<{ success: boolean; ticket?: import('@/lib/return-room-tickets/types').ReturnRoomTicket; error?: string }> {
  try {
    const branch = await getBranch();

    if (!branch) {
      return { success: false, error: 'Branch not found' };
    }

    const ticket = await prisma.returnRoomTicket.findUnique({
      where: { id: returnRoomTicketId },
      include: {
        contract: {
          include: {
            bedDetails: {
              include: {
                bed: {
                  include: {
                    room: true,
                  },
                },
              },
            },
          },
        },
        bedUpdates: true,
      },
    });

    if (!ticket || ticket.branchId !== branch.id) {
      return { success: false, error: 'Return-room ticket not found' };
    }

    if (
      ![
        'CUSTOMER_CONFIRMED',
        'WAITING_DEPOSIT_REFUND',
        'WAITING_EXTRA_PAYMENT',
      ].includes(ticket.status)
    ) {
      return {
        success: false,
        error: 'Phiếu trả phòng chưa sẵn sàng cập nhật trạng thái phòng.',
      };
    }

    if (ticket.roomFinalizationStatus !== 'NOT_STARTED') {
      return {
        success: false,
        error: 'Trạng thái phòng đã được cập nhật trước đó.',
      };
    }

    if (input.updates.length === 0) {
      return {
        success: false,
        error: 'Vui lòng chọn ít nhất một giường cần cập nhật.',
      };
    }

    const updateByBedCode = new Map(
      input.updates.map((update) => [update.bedCode, update]),
    );
    const contractedBeds = ticket.contract.bedDetails.map((detail) => detail.bed);
    const unknownBedCodes = input.updates
      .map((update) => update.bedCode)
      .filter(
        (bedCode) => !contractedBeds.some((bed) => bed.position === bedCode),
      );

    if (unknownBedCodes.length > 0) {
      return {
        success: false,
        error: `Không tìm thấy giường trong hợp đồng: ${unknownBedCodes.join(', ')}`,
      };
    }

    const updatedTicketId = await prisma.$transaction(async (tx) => {
      const finalizedAt = new Date();
      const affectedRoomIds = new Set<string>();

      for (const bed of contractedBeds) {
        const update = updateByBedCode.get(bed.position);

        if (!update) {
          continue;
        }

        const statusAfter = mapCheckoutBedStatusToDb(update.statusAfterCheckout);
        affectedRoomIds.add(bed.roomId);

        await tx.bed.update({
          where: { id: bed.id },
          data: { status: statusAfter },
        });

        await tx.returnRoomTicketBedUpdate.upsert({
          where: {
            returnRoomTicketId_bedId: {
              returnRoomTicketId,
              bedId: bed.id,
            },
          },
          create: {
            returnRoomTicketId,
            bedId: bed.id,
            statusBefore: bed.status,
            statusAfter,
            note: update.note?.trim() || null,
          },
          update: {
            statusBefore: bed.status,
            statusAfter,
            note: update.note?.trim() || null,
          },
        });
      }

      for (const roomId of affectedRoomIds) {
        const roomBeds = await tx.bed.findMany({
          where: { roomId },
          select: { status: true },
        });
        const occupancy = roomBeds.filter((bed) =>
          ['OCCUPIED', 'DEPOSITED'].includes(bed.status),
        ).length;
        const room = await tx.room.findUnique({
          where: { id: roomId },
          select: { capacity: true },
        });
        const roomStatus = deriveRoomDbStatus(occupancy, room?.capacity ?? 0, roomBeds);

        await tx.room.update({
          where: { id: roomId },
          data: {
            occupancy,
            status: roomStatus,
          },
        });
      }

      await tx.contract.update({
        where: { id: ticket.contractId },
        data: {
          status: 'ENDED',
          endDate: ticket.contract.endDate ?? finalizedAt,
        },
      });

      await tx.contractBedDetail.updateMany({
        where: {
          contractId: ticket.contractId,
          bedId: {
            in: input.updates
              .map((update) => contractedBeds.find((bed) => bed.position === update.bedCode)?.id)
              .filter((bedId): bedId is string => Boolean(bedId)),
          },
          endDate: null,
        },
        data: {
          endDate: finalizedAt,
        },
      });

      const updatedTicket = await tx.returnRoomTicket.update({
        where: { id: returnRoomTicketId },
        data: {
          status: 'COMPLETED',
          actualReturnDate: finalizedAt,
          roomFinalizationStatus:
            input.roomStatusAfterCheckout === 'CAN_BAO_TRI'
              ? 'MAINTENANCE'
              : 'AVAILABLE',
          roomFinalizationNote: input.generalNote.trim() || null,
          roomFinalizedAt: finalizedAt,
          roomStatusAfterCheckout: input.roomStatusAfterCheckout,
        },
        select: { id: true },
      });

      return updatedTicket.id;
    });

    const updatedTicket = await prisma.returnRoomTicket.findUnique({
      where: { id: updatedTicketId },
      include: returnRoomTicketInclude,
    });

    if (!updatedTicket) {
      return { success: false, error: 'Unable to reload updated ticket' };
    }

    revalidatePath('/dashboard/return-room-tickets');
    revalidatePath('/dashboard/check-in-contracts');
    revalidatePath('/dashboard/rooms');
    revalidatePath('/dashboard/payment-slips');

    return { success: true, ticket: mapReturnRoomTicket(updatedTicket) };
  } catch (error) {
    console.error('Error finalizing return room status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

function mapReturnTicketStatus(status: string): import('@/lib/return-room-tickets/types').ReturnTicketStatus {
  const statusMap: Record<string, import('@/lib/return-room-tickets/types').ReturnTicketStatus> = {
    PENDING_MANAGER_REVIEW: 'pendingManagerReview',
    RECONCILING: 'reconciling',
    WAITING_ACCOUNTING: 'waitingAccounting',
    ACCOUNTING_RESULT_READY: 'accountingResultReady',
    WAITING_CUSTOMER_CONFIRMATION: 'waitingCustomerConfirmation',
    CUSTOMER_CONFIRMED: 'customerConfirmed',
    NEEDS_RECHECK: 'needsRecheck',
    WAITING_DEPOSIT_REFUND: 'waitingDepositRefund',
    WAITING_EXTRA_PAYMENT: 'waitingExtraPayment',
    COMPLETED: 'completed',
  };

  return statusMap[status] ?? 'pendingManagerReview';
}

function mapCheckoutBedStatusToDb(
  status: 'TRONG' | 'CAN_BAO_TRI' | 'KHONG_KHA_DUNG',
) {
  if (status === 'TRONG') {
    return 'AVAILABLE';
  }

  return 'MAINTENANCE';
}

function deriveRoomDbStatus(
  occupancy: number,
  capacity: number,
  beds: Array<{ status: string }>,
) {
  if (beds.some((bed) => bed.status === 'MAINTENANCE')) {
    return 'MAINTENANCE';
  }

  if (capacity > 0 && occupancy >= capacity) {
    return 'FULL';
  }

  return 'AVAILABLE';
}

function mapCustomerConfirmationStatus(status: string) {
  if (status === 'AGREED') return 'agreed';
  if (status === 'DISAGREED') return 'disagreed';
  return 'notStarted';
}

function mapRoomFinalizationStatus(status: string) {
  if (status === 'AVAILABLE') return 'available';
  if (status === 'MAINTENANCE') return 'maintenance';
  return 'notStarted';
}

function mapReturnRoomTicket(ticket: any): import('@/lib/return-room-tickets/types').ReturnRoomTicket {
  const representative = ticket.contract.occupants?.find((occupant: any) => occupant.isRepresentative);
  const firstBedDetail = ticket.contract.bedDetails?.[0];
  const room = firstBedDetail?.bed?.room;
  const bedCode = ticket.contract.bedDetails
    ?.map((detail: any) => detail.bed.position)
    .join(', ') || 'N/A';
  const rentalType = ticket.contract.rentalType === 'WHOLE_ROOM' ? 'THUE_NGUYEN_PHONG' : 'THUE_GIUONG';
  const expectedReturnDate = new Date(ticket.expectedReturnDate).toISOString().slice(0, 10);

  return {
    id: ticket.id,
    code: ticket.code,
    createdAt: new Date(ticket.createdAt).toISOString(),
    status: mapReturnTicketStatus(ticket.status),
    saleNote: ticket.saleNote || '',
    tenant: {
      name: representative?.fullName || ticket.contract.registration.customerName,
      phone: ticket.contract.registration.phoneNumber,
      identityNumber: representative?.identityNumber || ticket.contract.registration.cccd || '',
      representative: representative?.fullName,
    },
    contract: {
      code: ticket.contract.code,
      startDate: new Date(ticket.contract.startDate).toISOString().slice(0, 10),
      endDate: ticket.contract.endDate
        ? new Date(ticket.contract.endDate).toISOString().slice(0, 10)
        : '',
      status: ticket.contract.status === 'ACTIVE' ? 'Đang hiệu lực' : ticket.contract.status,
      depositAmount: ticket.contract.depositAmount,
      stayStatus: ticket.contract.status === 'ENDED' ? 'Đã trả phòng' : 'Đang lưu trú',
    },
    room: {
      roomCode: room?.name || 'N/A',
      bedCode,
      currentStatus: room?.status || 'N/A',
      expectedReturnDate,
      actualReturnDate: ticket.actualReturnDate
        ? new Date(ticket.actualReturnDate).toISOString().slice(0, 10)
        : undefined,
      beds: ticket.contract.bedDetails?.map((detail: any) => ({
        bedCode: detail.bed.position,
        currentStatus:
          detail.bed.status === 'OCCUPIED'
            ? 'DANG_THUE'
            : detail.bed.status === 'MAINTENANCE'
              ? 'CAN_BAO_TRI'
              : 'TRONG',
      })),
    },
    handoverAssets: [],
    reconciliation: ticket.reconciliation
      ? {
          id: ticket.reconciliation.id,
          code: ticket.reconciliation.code,
          status: ticket.reconciliation.status,
          hygieneStatus: ticket.reconciliation.hygieneStatus === 'failed' ? 'failed' : 'passed',
          keycardStatus: ticket.reconciliation.keycardStatus === 'missing' ? 'missing' : 'complete',
          hasDamageOrLoss: ticket.reconciliation.hasDamageOrLoss,
          managerNotes: ticket.reconciliation.managerNotes || '',
          estimatedDeductions: ticket.reconciliation.details
            .filter((detail: any) => detail.source === 'manager')
            .map((detail: any) => ({
              id: detail.id,
              description: detail.description,
              amount: detail.amount,
              source: 'manager' as const,
            })),
        }
      : undefined,
    accountingResult: ticket.reconciliation?.finalAmount != null
      ? {
          depositAmount: ticket.reconciliation.depositAmount ?? ticket.contract.depositAmount,
          refundRate: ticket.reconciliation.refundRate ?? 0,
          baseRefund: ticket.reconciliation.baseRefund ?? 0,
          totalDeductions: ticket.reconciliation.totalDeductions ?? 0,
          finalAmount: ticket.reconciliation.finalAmount,
          conclusion: ticket.reconciliation.conclusion || '',
          deductions: ticket.reconciliation.details
            .filter((detail: any) => detail.source === 'accounting')
            .map((detail: any) => ({
              id: detail.id,
              description: detail.description,
              amount: detail.amount,
              source: 'accounting' as const,
            })),
        }
      : undefined,
    customerConfirmation: {
      status: mapCustomerConfirmationStatus(ticket.customerConfirmationStatus),
      confirmedAt: ticket.customerConfirmedAt
        ? new Date(ticket.customerConfirmedAt).toISOString().slice(0, 10)
        : undefined,
      disagreementReason: ticket.customerDisagreementReason || undefined,
    },
    roomFinalization: {
      status: mapRoomFinalizationStatus(ticket.roomFinalizationStatus),
      note: ticket.roomFinalizationNote || undefined,
      completedAt: ticket.roomFinalizedAt
        ? new Date(ticket.roomFinalizedAt).toISOString().slice(0, 10)
        : undefined,
      updatedBeds: ticket.bedUpdates?.map((update: any) => ({
        bedCode: update.bed.position,
        statusAfterCheckout:
          update.statusAfter === 'MAINTENANCE'
            ? 'CAN_BAO_TRI'
            : update.statusAfter === 'UNAVAILABLE'
              ? 'KHONG_KHA_DUNG'
              : 'TRONG',
        note: update.note || undefined,
      })),
      roomStatusAfterCheckout: ticket.roomStatusAfterCheckout || undefined,
    },
    rentalType,
    contractedBedCodes: ticket.contract.bedDetails?.map((detail: any) => detail.bed.position),
  };
}

export async function getReturnRoomTickets(): Promise<import('@/lib/return-room-tickets/types').ReturnRoomTicket[]> {
  const branch = await getBranch();

  if (!branch) return [];

  const tickets = await prisma.returnRoomTicket.findMany({
    where: { branchId: branch.id },
    include: returnRoomTicketInclude,
    orderBy: { createdAt: 'desc' },
  });

  return tickets.map(mapReturnRoomTicket);
}

const returnRoomTicketInclude = {
  contract: {
    include: {
      registration: true,
      occupants: true,
      bedDetails: {
        include: {
          bed: {
            include: {
              room: true,
            },
          },
        },
      },
    },
  },
  reconciliation: {
    include: {
      details: true,
    },
  },
  bedUpdates: {
    include: {
      bed: true,
    },
  },
} as const;
