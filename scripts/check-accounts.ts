import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAccounts() {
  const email = 'akashsinghaa008@gmail.com';
  
  console.log('Checking user and accounts using raw MongoDB...\n');
  
  // Find user using raw MongoDB
  const userResult = await prisma.$runCommandRaw({
    find: 'users',
    filter: { email },
    limit: 1,
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = (userResult as any).cursor.firstBatch;
  
  if (!users || users.length === 0) {
    console.log('User not found');
    return;
  }
  
  const user = users[0];
  console.log('User found:');
  console.log('  ID:', user._id);
  console.log('  Email:', user.email);
  console.log('  Name:', user.name);
  console.log('  emailVerified:', user.emailVerified, `(type: ${typeof user.emailVerified})`);
  
  // Find accounts using raw MongoDB
  console.log('\nSearching for linked accounts...\n');
  
  const accountsResult = await prisma.$runCommandRaw({
    find: 'accounts',
    filter: { userId: user._id },
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accounts = (accountsResult as any).cursor.firstBatch;
  
  console.log(`Found ${accounts.length} account(s):`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts.forEach((account: any) => {
    console.log(`- Provider: ${account.provider}, ID: ${account.providerAccountId}`);
  });
  
  if (accounts.length === 0) {
    console.log('\n❌ No accounts linked!');
    console.log('Issue: User exists with email/password but no Google account linked.');
    console.log('Solution: Need to enable automatic account linking in NextAuth config.');
  }
}

checkAccounts()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('Error:', error);
    prisma.$disconnect();
  });
