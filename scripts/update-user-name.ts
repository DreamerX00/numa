import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserName() {
  try {
    console.log('🔍 Finding user...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'akashsinghaa008@gmail.com' },
      select: { id: true, email: true, name: true }
    });
    
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('📝 Current user data:', user);
    
    // Update the name
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Dreamer X' }, // You can change this to your preferred display name
    });
    
    console.log('✅ User name updated successfully:', updatedUser);
    
  } catch (error) {
    console.error('❌ Error updating user name:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserName();
