import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUserNames() {
  try {
    console.log('📋 Current user names in database:\n');
    
    const users = await prisma.user.findMany({
      select: { 
        email: true, 
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.table(users.map(u => ({
      Email: u.email,
      Name: u.name || '(null)',
      Role: u.role,
      'Joined': u.createdAt.toLocaleDateString('en-GB')
    })));
    
    console.log(`\n✅ Total users: ${users.length}`);
    console.log(`✅ Users with names: ${users.filter(u => u.name).length}`);
    console.log(`⚠️  Users without names: ${users.filter(u => !u.name).length}`);
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUserNames();
