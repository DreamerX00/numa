/**
 * Script to fix emailVerified field type in existing users
 * Converts boolean true to Date, null/false stays as null
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEmailVerified() {
  console.log('🔍 Finding users with invalid emailVerified field...\n');

  // Get all users
  const users = await prisma.$runCommandRaw({
    find: 'users',
    filter: {},
  });

  console.log(`Found ${(users as any).cursor.firstBatch.length} total users\n`);

  let fixed = 0;
  let skipped = 0;

  // Check each user
  for (const user of (users as any).cursor.firstBatch) {
    const emailVerified = user.emailVerified;
    const isString = typeof emailVerified === 'string';
    const isBoolean = typeof emailVerified === 'boolean';
    const isDate = emailVerified instanceof Date || (emailVerified && emailVerified.$date);
    
    // If emailVerified is a string (ISO date string), convert to Date object
    if (isString) {
      console.log(`❌ User ${user.email} has emailVerified as string: ${emailVerified}`);
      
      // Convert ISO string to BSON Date using $toDate operator
      await prisma.$runCommandRaw({
        update: 'users',
        updates: [
          {
            q: { _id: user._id },
            u: [
              {
                $set: {
                  emailVerified: { $toDate: "$emailVerified" }
                }
              }
            ],
          },
        ],
      });
      
      console.log(`✅ Fixed user ${user.email} - converted string to Date object\n`);
      fixed++;
    }
    // If emailVerified is true (boolean), convert to Date
    else if (emailVerified === true) {
      console.log(`❌ User ${user.email} has emailVerified: true (boolean)`);
      
      await prisma.$runCommandRaw({
        update: 'users',
        updates: [
          {
            q: { _id: user._id },
            u: { $set: { emailVerified: new Date() } },
          },
        ],
      });
      
      console.log(`✅ Fixed user ${user.email} - set emailVerified to current date\n`);
      fixed++;
    } 
    // If emailVerified is false (boolean), convert to null
    else if (emailVerified === false) {
      console.log(`❌ User ${user.email} has emailVerified: false (boolean)`);
      
      await prisma.$runCommandRaw({
        update: 'users',
        updates: [
          {
            q: { _id: user._id },
            u: { $set: { emailVerified: null } },
          },
        ],
      });
      
      console.log(`✅ Fixed user ${user.email} - set emailVerified to null\n`);
      fixed++;
    }
    // If emailVerified is already null or proper Date object, skip
    else if (emailVerified === null || isDate) {
      skipped++;
    }
    // Unknown type
    else {
      console.log(`⚠️  User ${user.email} has unknown emailVerified type:`, typeof emailVerified, emailVerified);
      skipped++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Fixed: ${fixed} users`);
  console.log(`⏭️  Skipped: ${skipped} users (already correct)`);
  console.log(`📋 Total: ${(users as any).cursor.firstBatch.length} users`);
}

fixEmailVerified()
  .then(() => {
    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
