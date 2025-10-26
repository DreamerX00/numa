import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkPaymentSettings() {
  const settings = await prisma.systemSetting.findMany({
    where: { category: "payments" },
    select: { key: true, value: true },
  });

  console.log("\n🔍 Payment Settings:\n");
  settings.forEach((s) => {
    console.log(`${s.key}:`, s.value);
  });

  await prisma.$disconnect();
}

checkPaymentSettings();
