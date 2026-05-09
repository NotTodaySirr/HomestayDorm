import "dotenv/config";
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Đang dọn dẹp dữ liệu cũ (Xóa rác)...');

  // Xóa theo thứ tự từ bảng con đến bảng cha để tránh lỗi khóa ngoại
  await prisma.payment.deleteMany();
  await prisma.depositDetail.deleteMany();
  await prisma.depositTicket.deleteMany();
  await prisma.viewingAppointment.deleteMany();
  
  // Xóa bảng trung gian implicit m-n (nếu có, Prisma thường tự xử lý khi xóa cha)
  await prisma.registrationTicket.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  console.log('Đang tạo dữ liệu mẫu mới...');

  // ===== Branches =====
  const branch1 = await prisma.branch.create({
    data: { code: 'CN1', name: 'CN1 - Q.Bình Thạnh' },
  });

  const branch2 = await prisma.branch.create({
    data: { code: 'CN2', name: 'CN2 - Q.10' },
  });

  // ===== Users =====
  const admin = await prisma.user.create({
    data: {
      email: 'admin@homestaydorm.com',
      password: 'admin_password_unhashed',
      name: 'Quản Lý Tâm',
      role: 'ADMIN',
      branchId: branch1.id,
    },
  });

  const sale1 = await prisma.user.create({
    data: {
      email: 'sale1@homestaydorm.com',
      password: 'sale_password_unhashed',
      name: 'NV Sale - Hương',
      role: 'USER',
      branchId: branch1.id,
    },
  });

  // ===== Rooms + Beds =====
  async function createBedsForRoom(roomId: string, capacity: number, pricePerBed: number) {
    const positions = ['Trên-1', 'Dưới-1', 'Trên-2', 'Dưới-2', 'Trên-3', 'Dưới-3'];
    for (let i = 0; i < capacity; i++) {
      await prisma.bed.create({
        data: {
          roomId,
          position: positions[i] || `Vị trí ${i + 1}`,
          price: pricePerBed,
          status: 'AVAILABLE',
        },
      });
    }
  }

  // Tạo 6 phòng cho CN1
  const roomsDataCN1 = [
    { name: '101', capacity: 6, price: 1500000 },
    { name: '102', capacity: 4, price: 1800000 },
    { name: '103', capacity: 2, price: 2500000 },
    { name: '201', capacity: 6, price: 1600000 },
    { name: '202', capacity: 4, price: 2000000 },
    { name: '203', capacity: 2, price: 2800000 },
  ];

  for (const r of roomsDataCN1) {
    const room = await prisma.room.create({
      data: { branchId: branch1.id, name: r.name, capacity: r.capacity, occupancy: 0, price: r.price, status: 'AVAILABLE' }
    });
    await createBedsForRoom(room.id, r.capacity, r.price);
  }

  // Tạo 1 phòng cho CN2
  const r2_101 = await prisma.room.create({
    data: { branchId: branch2.id, name: '101', capacity: 4, occupancy: 0, price: 2000000, status: 'AVAILABLE' }
  });
  await createBedsForRoom(r2_101.id, 4, 2000000);

  // ===== Sample Registration =====
  await prisma.registrationTicket.create({
    data: {
      branchId: branch1.id,
      customerName: 'Khách Hàng Mẫu',
      phoneNumber: '0901234567',
      gender: 'm',
      preferredArea: 'binh_thanh',
      status: 'DRAFT',
    }
  });

  console.log('Tạo dữ liệu hoàn tất! Bạn có thể ra web để kiểm tra.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });