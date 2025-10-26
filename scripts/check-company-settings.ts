import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkCompanySettings() {
  const settings = await prisma.companySettings.findFirst();

  console.log("\n🏢 Company Settings:\n");
  console.log("GST Rate:", settings?.gstRate);
  console.log(
    "GST Rate (as %):",
    settings?.gstRate ? settings.gstRate * 100 + "%" : "N/A"
  );
  console.log("\nFull Company Settings:", settings);

  await prisma.$disconnect();
}

checkCompanySettings();
