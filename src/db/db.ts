import { PrismaClient } from '@prisma/client';
const dbUrl: string = process.env.DATABASE_URL || '';

if (!dbUrl) {
  console.log('Please create .env file, refer .env.sample');
  process.exit(0);
}

let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production' || false) {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}
export default prisma;
