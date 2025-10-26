/**
 * Test script to verify settings API returns correct values
 */

async function testSettingsAPI() {
  console.log("\n🔍 Testing Settings API Endpoint...\n");

  try {
    const response = await fetch("http://localhost:3000/api/settings/public");

    if (!response.ok) {
      console.error("❌ API Error:", response.status, response.statusText);
      return;
    }

    const data = await response.json();

    console.log("✅ API Response received\n");

    if (data.settings) {
      console.log("💳 Payment Settings from API:");
      console.log("  phonePeEnabled:", data.settings.payments?.phonePeEnabled);
      console.log(
        "  razorpayEnabled:",
        data.settings.payments?.razorpayEnabled
      );
      console.log("  codEnabled:", data.settings.payments?.codEnabled);

      console.log("\n📊 Company Settings from API:");
      console.log("  gstRate:", data.settings.company?.gstRate);
      console.log(
        "  gstRate (as %):",
        data.settings.company?.gstRate
          ? data.settings.company.gstRate * 100 + "%"
          : "N/A"
      );

      console.log("\n🚚 Shipping Settings from API:");
      console.log("  codEnabled:", data.settings.shipping?.codEnabled);
      console.log("  codCharges:", data.settings.shipping?.codCharges);
    } else {
      console.log("⚠️  No settings found in response");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    console.log(
      "\n💡 Make sure your development server is running: npm run dev"
    );
  }
}

testSettingsAPI();
