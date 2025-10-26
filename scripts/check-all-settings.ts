import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSettings() {
  console.log("\n🔍 Checking All Settings:\n");

  // Check payment settings
  const paymentSettings = await prisma.systemSetting.findMany({
    where: { category: "payments" },
    select: { key: true, value: true },
  });

  console.log("💳 Payment Settings:");
  paymentSettings.forEach((s) => {
    if (s.key.includes("Enabled")) {
      console.log(`  ${s.key}:`, s.value);
    }
  });

  // Check company GST
  const company = await prisma.companySettings.findFirst({
    select: { gstRate: true },
  });
  console.log("\n📊 Company Settings:");
  console.log(
    "  gstRate:",
    company?.gstRate,
    `(${(company?.gstRate || 0) * 100}%)`
  );

  await prisma.$disconnect();
}

checkSettings();
