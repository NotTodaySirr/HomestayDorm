import "dotenv/config";
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@homestaydorm.com' },
    update: {},
    create: {
      email: 'admin@homestaydorm.com',
      password: 'admin_password_unhashed', // In prod, use a hashing library
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  console.log({ admin });
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end(); // Important to close the pool as well
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
