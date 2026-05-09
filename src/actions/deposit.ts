'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

const CURRENT_BRANCH_CODE = 'CN1';

async function getBranch() {
  return prisma.branch.findUnique({
    where: { code: CURRENT_BRANCH_CODE }
  });
}

// ===== QUERIES =====

export async function getAvailableRoomsWithBeds() {
  const branch = await getBranch();
  if (!branch) return [];

  return prisma.room.findMany({
    where: {
      branchId: branch.id,
      status: { not: 'MAINTENANCE' },
    },
    include: {
      beds: {
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getRegistrationsForDeposit() {
  const branch = await getBranch();
  if (!branch) return [];

  return prisma.registrationTicket.findMany({
    where: {
      branchId: branch.id,
      status: { in: ['DRAFT', 'CONSULTING', 'WAITING_VIEW', 'WAITLIST', 'COMPLETED'] },
    },
    include: {
      consultingRooms: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDepositTickets() {
  const branch = await getBranch();
  if (!branch) return [];

  const overdueDeposits = await prisma.depositTicket.findMany({
    where: {
      branchId: branch.id,
      status: 'PENDING',
      paymentDeadline: { lt: new Date() },
    },
    include: { details: true },
  });

  for (const dep of overdueDeposits) {
    await prisma.$transaction(async (tx) => {
      await tx.depositTicket.update({
        where: { id: dep.id },
        data: { status: 'EXPIRED' },
      });
      const bedIds = dep.details.map(d => d.bedId);
      if (bedIds.length > 0) {
        await tx.bed.updateMany({
          where: { id: { in: bedIds }, status: 'DEPOSITED' },
          data: { status: 'AVAILABLE' },
        });
      }
    });
  }

  return prisma.depositTicket.findMany({
    where: { branchId: branch.id },
    include: {
      registration: true,
      details: {
        include: {
          bed: {
            include: { room: true },
          },
        },
      },
      createdBy: true,
      confirmedBy: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ===== MUTATIONS =====

export async function createDepositTicket(formData: FormData) {
  const branch = await getBranch();
  if (!branch) throw new Error('Không tìm thấy chi nhánh');

  const registrationId = formData.get('registrationId') as string;
  const bedIdsRaw = formData.get('bedIds') as string;
  const bedIds = bedIdsRaw.split(',').filter(Boolean);

  if (!registrationId) throw new Error('Chưa chọn phiếu đăng ký');
  if (bedIds.length === 0) throw new Error('Chưa chọn giường nào');

  const beds = await prisma.bed.findMany({
    where: { id: { in: bedIds }, status: 'AVAILABLE' },
  });

  if (beds.length !== bedIds.length) {
    throw new Error('Một hoặc nhiều giường đã không còn trống. Vui lòng chọn lại.');
  }

  const depositAmount = beds.reduce((sum, bed) => sum + bed.price * 2, 0);
  const paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.depositTicket.create({
      data: {
        registrationId,
        branchId: branch.id,
        depositAmount,
        paymentDeadline,
        status: 'PENDING',
        details: {
          create: bedIds.map((bedId) => ({ bedId })),
        },
      },
    });

    await tx.bed.updateMany({
      where: { id: { in: bedIds } },
      data: { status: 'DEPOSITED' },
    });

    await tx.registrationTicket.update({
      where: { id: registrationId },
      data: { status: 'COMPLETED' },
    });
  });

  revalidatePath('/dashboard/deposits');
  revalidatePath('/dashboard/registrations');
}

export async function markDepositPaid(depositId: string, formData: FormData) {
  const paymentMethod = formData.get('paymentMethod') as string;
  const transactionId = (formData.get('transactionId') as string) || null;
  const note = (formData.get('note') as string) || null;
  const proofUrl = (formData.get('proofUrl') as string) || null;

  const deposit = await prisma.depositTicket.findUnique({ where: { id: depositId } });
  if (!deposit) throw new Error('Phiếu cọc không tồn tại');
  if (deposit.status !== 'PENDING') throw new Error('Phiếu cọc không ở trạng thái chờ thanh toán');

  await prisma.$transaction(async (tx) => {
    await tx.depositTicket.update({
      where: { id: depositId },
      data: {
        status: 'PAID',
        depositedAt: new Date(),
      },
    });

    await tx.payment.create({
      data: {
        depositTicketId: depositId,
        paymentType: 'DEPOSIT',
        documentType: paymentMethod === 'TRANSFER' ? 'BANK_TRANSFER' : 'RECEIPT',
        amount: deposit.depositAmount,
        paymentMethod,
        paymentTime: new Date(),
        status: 'COMPLETED',
        transactionId: transactionId || undefined,
        content: `Thanh toán tiền cọc — Phiếu ${depositId.slice(0, 8).toUpperCase()}`,
        note: note || undefined,
        proofUrl: proofUrl || undefined, 
      },
    });
  });

  revalidatePath('/dashboard/deposits');
}

export async function confirmDeposit(depositId: string) {
  const deposit = await prisma.depositTicket.findUnique({
    where: { id: depositId },
    include: { details: { include: { bed: true } } },
  });

  if (!deposit) throw new Error('Phiếu cọc không tồn tại');
  if (deposit.status !== 'PAID') throw new Error('Phiếu cọc chưa được thanh toán');

  await prisma.$transaction(async (tx) => {
    await tx.depositTicket.update({
      where: { id: depositId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    const roomMap = new Map<string, number>();
    for (const detail of deposit.details) {
      const roomId = detail.bed.roomId;
      roomMap.set(roomId, (roomMap.get(roomId) || 0) + 1);
    }

    for (const [roomId, bedCount] of roomMap) {
      const room = await tx.room.findUnique({ where: { id: roomId } });
      if (room) {
        const newOccupancy = room.occupancy + bedCount;
        await tx.room.update({
          where: { id: roomId },
          data: {
            occupancy: newOccupancy,
            status: newOccupancy >= room.capacity ? 'FULL' : 'AVAILABLE',
          },
        });
      }
    }
  });

  revalidatePath('/dashboard/deposits');
  revalidatePath('/dashboard/rooms');
  revalidatePath('/dashboard/registrations'); 
  revalidatePath('/dashboard/registrations/new');
}

export async function cancelDeposit(depositId: string, formData: FormData) {
  const reason = formData.get('reason') as string;

  const deposit = await prisma.depositTicket.findUnique({
    where: { id: depositId },
    include: { details: { include: { bed: true } } },
  });

  if (!deposit) throw new Error('Phiếu cọc không tồn tại');
  if (deposit.status === 'CANCELLED' || deposit.status === 'EXPIRED') {
    throw new Error('Phiếu cọc đã bị hủy hoặc hết hạn');
  }

  const wasConfirmed = deposit.status === 'CONFIRMED';

  await prisma.$transaction(async (tx) => {
    await tx.depositTicket.update({
      where: { id: depositId },
      data: { status: 'CANCELLED', cancelReason: reason },
    });

    const bedIds = deposit.details.map(d => d.bedId);
    if (bedIds.length > 0) {
      await tx.bed.updateMany({
        where: { id: { in: bedIds } },
        data: { status: 'AVAILABLE' },
      });
    }

    if (wasConfirmed) {
      const roomMap = new Map<string, number>();
      for (const detail of deposit.details) {
        const roomId = detail.bed.roomId;
        roomMap.set(roomId, (roomMap.get(roomId) || 0) + 1);
      }

      for (const [roomId, bedCount] of roomMap) {
        const room = await tx.room.findUnique({ where: { id: roomId } });
        if (room) {
          const newOccupancy = Math.max(0, room.occupancy - bedCount);
          await tx.room.update({
            where: { id: roomId },
            data: {
              occupancy: newOccupancy,
              status: newOccupancy < room.capacity ? 'AVAILABLE' : 'FULL',
            },
          });
        }
      }
    }
  });

  revalidatePath('/dashboard/deposits');
  revalidatePath('/dashboard/rooms');
  revalidatePath('/dashboard/registrations'); 
  revalidatePath('/dashboard/registrations/new');
}

export async function openRoomForDeposit(depositId: string) {
  const deposit = await prisma.depositTicket.findUnique({
    where: { id: depositId },
    include: { details: true } 
  });

  if (!deposit) throw new Error('Không tìm thấy phiếu cọc');

  const bedIds = deposit.details.map(d => d.bedId);

  await prisma.$transaction(async (tx) => {
    await tx.bed.updateMany({
      where: { id: { in: bedIds } },
      data: { status: 'OCCUPIED' }
    });

    await tx.depositTicket.update({
      where: { id: depositId },
      data: { status: 'COMPLETED' }
    });
  });

  revalidatePath('/dashboard/deposits');
  revalidatePath('/dashboard/rooms');
}