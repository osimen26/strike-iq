const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const result = await prisma.$queryRawUnsafe('SELECT count(*) FROM auth.sessions');
    console.log('Success! Prisma can access auth.sessions:', result);
  } catch (err) {
    console.error('Error accessing auth.sessions:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
