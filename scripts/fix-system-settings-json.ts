/**
 * Script to fix invalid JSON values in SystemSetting table
 *
 * This script:
 * 1. Fetches all system settings from MongoDB
 * 2. Validates and fixes any invalid JSON values
 * 3. Ensures numeric values are stored as numbers, not strings
 * 4. Ensures boolean values are stored as booleans, not strings
 * 5. Updates the database with corrected values
 *
 * Run with: npx tsx scripts/fix-system-settings-json.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixSystemSettingsJson() {
  console.log("🔍 Checking SystemSetting records for invalid JSON values...\n");

  try {
    // Fetch all system settings
    const settings = await prisma.systemSetting.findMany();

    console.log(`Found ${settings.length} system settings to check.\n`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const setting of settings) {
      try {
        const currentValue = setting.value;
        let needsUpdate = false;
        let newValue: unknown = currentValue;

        // Check if value is a string when it should be a number or boolean
        if (typeof currentValue === "string") {
          // Try to parse as number
          const numValue = Number(currentValue);
          if (!isNaN(numValue) && currentValue.trim() !== "") {
            newValue = numValue;
            needsUpdate = true;
            console.log(
              `📝 ${setting.key}: Converting string "${currentValue}" to number ${numValue}`
            );
          }
          // Try to parse as boolean
          else if (
            currentValue.toLowerCase() === "true" ||
            currentValue.toLowerCase() === "false"
          ) {
            newValue = currentValue.toLowerCase() === "true";
            needsUpdate = true;
            console.log(
              `📝 ${setting.key}: Converting string "${currentValue}" to boolean ${newValue}`
            );
          }
          // Check if it's a JSON string that needs parsing
          else if (
            currentValue.startsWith("{") ||
            currentValue.startsWith("[")
          ) {
            try {
              newValue = JSON.parse(currentValue);
              needsUpdate = true;
              console.log(`📝 ${setting.key}: Parsing JSON string to object`);
            } catch {
              // Not valid JSON, keep as string
            }
          }
        }

        // Update if needed
        if (needsUpdate) {
          await prisma.systemSetting.update({
            where: { id: setting.id },
            data: {
              value: newValue as import("@prisma/client").Prisma.InputJsonValue,
            },
          });
          fixedCount++;
          console.log(`✅ Updated ${setting.key}\n`);
        } else {
          console.log(
            `✓ ${setting.key}: Already valid JSON (${typeof currentValue})`
          );
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing ${setting.key}:`, error);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`\n✅ Fixed ${fixedCount} records`);
    console.log(
      `✓ Verified ${settings.length - fixedCount - errorCount} records as valid`
    );
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount}`);
    }
    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 Database cleanup complete!");
    console.log("\nNext steps:");
    console.log("1. Check Prisma Studio to verify the values look correct");
    console.log("2. Try saving settings from the admin panel again");
    console.log("3. The red warning should be gone!\n");
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixSystemSettingsJson().catch(console.error);
