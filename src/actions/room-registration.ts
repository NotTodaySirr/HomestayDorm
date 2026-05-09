'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer'; // <-- Đã chuyển import lên trên cùng

// Mocked branch code for the demo
const CURRENT_BRANCH_CODE = 'CN1';

async function getBranch() {
  return prisma.branch.findUnique({
    where: { code: CURRENT_BRANCH_CODE }
  });
}

export async function getAvailableRooms() {
  const branch = await getBranch();
  if (!branch) return [];

  return prisma.room.findMany({
    where: { 
      branchId: branch.id,
    },
    include: {
      beds: {
        orderBy: { position: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export async function getRegistrationTickets() {
  const branch = await getBranch();
  if (!branch) return [];

  return prisma.registrationTicket.findMany({
    where: { 
      branchId: branch.id,
    },
    include: {
      consultingRooms: true 
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getViewingAppointments() {
  const branch = await getBranch();
  if (!branch) return [];

  return prisma.viewingAppointment.findMany({
    where: { 
      branchId: branch.id,
    },
    include: {
      room: true,
      assignee: true,
      registration: true,
    },
    orderBy: { datetime: 'asc' }
  });
}

export async function createRegistrationTicket(formData: FormData) {
  const branch = await getBranch();
  if (!branch) throw new Error('Branch not found');

  // Customer Info
  const cccd = formData.get('cccd') as string | null;
  const customerName = formData.get('customerName') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const email = formData.get('email') as string | null;
  const dateOfBirthStr = formData.get('dateOfBirth') as string | null;
  const gender = formData.get('gender') as string | null;
  const address = formData.get('address') as string | null;

  // Rental Requirements
  const rentalType = formData.get('rentalType') as string | null;
  const roomTypePreference = formData.get('roomTypePreference') as string | null;
  const headcount = formData.get('headcount') ? Number(formData.get('headcount')) : null;
  const preferredArea = formData.get('preferredArea') as string | null;
  const minPrice = formData.get('minPrice') ? Number(formData.get('minPrice')) : null;
  const maxPrice = formData.get('maxPrice') ? Number(formData.get('maxPrice')) : null;
  const rentalDuration = formData.get('rentalDuration') as string | null;
  const moveInDateStr = formData.get('moveInDate') as string | null;
  const contactChannel = formData.get('contactChannel') as string | null;
  const additionalPreferences = formData.get('additionalPreferences') as string | null;

  const roomIdsRaw = formData.get('roomIds') as string | null;
  const roomIds = roomIdsRaw ? roomIdsRaw.split(',').filter(Boolean) : [];

  await prisma.registrationTicket.create({
    data: {
      branchId: branch.id,
      cccd: cccd || undefined,
      customerName,
      phoneNumber,
      email: email || undefined,
      dateOfBirth: dateOfBirthStr ? new Date(dateOfBirthStr) : undefined,
      gender: gender || undefined,
      address: address || undefined,
      rentalType: rentalType || undefined,
      roomTypePreference: roomTypePreference || undefined,
      headcount,
      preferredArea: preferredArea || undefined,
      minPrice,
      maxPrice,
      rentalDuration: rentalDuration || undefined,
      moveInDate: moveInDateStr ? new Date(moveInDateStr) : undefined,
      contactChannel: contactChannel || undefined,
      additionalPreferences: additionalPreferences || undefined,
      status: 'DRAFT',
      
      consultingRooms: {
        connect: roomIds.map((id) => ({ id }))
      }
    }
  });

  revalidatePath('/dashboard/registrations');
}

export async function createViewingAppointment(registrationId: string, formData: FormData) {
  const branch = await getBranch();
  if (!branch) throw new Error('Branch not found');

  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const datetimeStr = `${date}T${time}`;
  const roomIds = formData.getAll('roomIds') as string[];
  const meetingLocation = formData.get('meetingLocation') as string | null;

  const defaultAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const assigneeId = defaultAdmin?.id || null;

  if (roomIds.length > 0) {
    await prisma.$transaction(
      roomIds.map(roomId => prisma.viewingAppointment.create({
        data: {
          registrationId,
          branchId: branch.id,
          roomId: roomId,
          assigneeId,
          meetingLocation: meetingLocation || undefined,
          datetime: new Date(datetimeStr),
          status: 'UPCOMING',
        }
      }))
    );
  } else {
    await prisma.viewingAppointment.create({
      data: {
        registrationId,
        branchId: branch.id,
        roomId: null,
        assigneeId,
        meetingLocation: meetingLocation || undefined,
        datetime: new Date(datetimeStr),
        status: 'UPCOMING',
      }
    });
  }

  // 👉 ĐÃ SỬA LỖI Ở ĐÂY: Thêm 'const updatedTicket =' để lấy dữ liệu gửi mail
  const updatedTicket = await prisma.registrationTicket.update({
    where: { id: registrationId },
    data: { status: 'WAITING_VIEW' }
  });

  const locationText = meetingLocation || 'Sảnh lễ tân chi nhánh';
  
  // Gọi hàm gửi mail
  await sendNotificationToCustomer(
    updatedTicket.customerName, 
    updatedTicket.email, 
    updatedTicket.phoneNumber, 
    datetimeStr, 
    locationText
  );

  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard/registrations');
}

export async function cancelViewingAppointment(appointmentId: string) {
  await prisma.viewingAppointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' }
  });
  revalidatePath('/dashboard/appointments');
}

export async function updateViewingResult(appointmentId: string, formData: FormData) {
  const resultNote = formData.get('viewingResult') as string;
  const decision = formData.get('decision') as string;

  let newStatus = 'VIEWED';
  if (decision === 'cancel') newStatus = 'CANCELLED';

  const decisionLabels: Record<string, string> = {
    accept: 'Đồng ý thuê',
    wait: 'Cần xem thêm',
    cancel: 'Không thuê',
  };

  const appointment = await prisma.viewingAppointment.update({
    where: { id: appointmentId },
    data: {
      status: newStatus,
      viewingResult: decisionLabels[decision] || decision,
      resultNote: resultNote || undefined,
    }
  });

  let ticketStatus: string | undefined = undefined;
  if (decision === 'accept') ticketStatus = 'COMPLETED'; 
  else if (decision === 'wait') ticketStatus = 'WAITLIST'; 
  
  if (ticketStatus) {
    await prisma.registrationTicket.update({
      where: { id: appointment.registrationId },
      data: { status: ticketStatus }
    });
  }

  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard/registrations');
}

export async function updateRegistrationStatus(registrationId: string, status: string, note?: string) {
  const dataToUpdate: any = { status };
  
  if (note) {
    const existing = await prisma.registrationTicket.findUnique({ where: { id: registrationId } });
    const currentPrefs = existing?.additionalPreferences ? existing.additionalPreferences + '\n' : '';
    dataToUpdate.additionalPreferences = `${currentPrefs}[${status} Note]: ${note}`;
  }

  await prisma.registrationTicket.update({
    where: { id: registrationId },
    data: dataToUpdate,
  });

  revalidatePath('/dashboard/registrations');
}

export async function getRegistrationById(id: string) {
  return prisma.registrationTicket.findUnique({
    where: { id },
    include: {
      consultingRooms: true,
    },
  });
}

export async function openSingleBed(bedId: string) {
  const bed = await prisma.bed.findUnique({ where: { id: bedId } });
  if (!bed) throw new Error('Không tìm thấy giường');

  await prisma.bed.update({
    where: { id: bedId },
    data: { status: 'OCCUPIED' }
  });

  revalidatePath('/dashboard/rooms');
  revalidatePath('/dashboard/registrations/new');
}


// ===== HÀM GỬI EMAIL =====
async function sendNotificationToCustomer(
  customerName: string, 
  email: string | null, 
  phone: string, 
  datetime: string, 
  location: string
) {
  if (!email) {
    console.log("Khách hàng không có email, bỏ qua gửi thông báo.");
    return;
  }

  // Cấu hình Transporter (Cổng gửi email)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const timeString = new Date(datetime).toLocaleString('vi-VN', { 
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
  });

  // Nội dung Email
  const mailOptions = {
    from: `"Hệ thống Quản lý Phòng trọ" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Xác nhận lịch hẹn xem phòng - ${customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #0284c7; text-align: center;">XÁC NHẬN LỊCH HẸN</h2>
        <p>Chào <strong>${customerName}</strong>,</p>
        <p>Chúng tôi đã tiếp nhận yêu cầu và xác nhận lịch hẹn xem phòng của bạn với chi tiết như sau:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Thời gian:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${timeString}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Địa điểm:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${location}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Số điện thoại khách:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">Vui lòng có mặt đúng giờ. Nếu có thay đổi, vui lòng liên hệ hotline để được hỗ trợ.</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #777; text-align: center;">Đây là email tự động, vui lòng không phản hồi email này.</p>
      </div>
    `,
  };

  // Thực thi gửi
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email thông báo đã được gửi đến: ${email}`);
  } catch (error) {
    console.error("❌ Lỗi khi gửi email:", error);
  }
}