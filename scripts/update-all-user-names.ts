import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAllUserNames() {
  try {
    console.log('🔍 Fetching all users...');
    
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        email: true, 
        name: true,
        role: true 
      }
    });
    
    console.log(`📝 Found ${users.length} users to process\n`);
    
    const updates = [
      {
        email: 'akashsinghaa0203@gmail.com',
        name: 'Akash Singh',
      },
      {
        email: 'tanishasahu813@gmail.com',
        name: 'Tanisha Sahu',
      },
      {
        email: 'tanishasahu138@gmail.com',
        name: 'Tanisha Sahu',
      },
      {
        email: 'akashsingh.mca24@bvicam.in',
        name: 'Akash Singh',
      },
      {
        email: 'tanishasahua1@gmail.com',
        name: 'Tanisha Sahu',
      },
      {
        email: 'akashsinghaa008@gmail.com',
        name: 'Dreamer X', // Already updated, but included for completeness
      },
    ];
    
    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;
    
    for (const update of updates) {
      const user = users.find(u => u.email === update.email);
      
      if (!user) {
        console.log(`⚠️  User not found: ${update.email}`);
        notFoundCount++;
        continue;
      }
      
      if (user.name === update.name) {
        console.log(`⏭️  Skipped (already set): ${update.email} - "${update.name}"`);
        skippedCount++;
        continue;
      }
      
      try {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { name: update.name },
        });
        
        console.log(`✅ Updated: ${update.email}`);
        console.log(`   Old name: ${user.name || 'null'}`);
        console.log(`   New name: ${updatedUser.name}`);
        console.log(`   Role: ${updatedUser.role}\n`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating ${update.email}:`, error);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ⚠️  Not found: ${notFoundCount}`);
    console.log(`   📝 Total processed: ${updates.length}`);
    
  } catch (error) {
    console.error('❌ Error updating user names:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllUserNames();
