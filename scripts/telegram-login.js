/**
 * Telegram MTProto Session Generator for DearDates (Idea 1)
 *
 * This script logs into your personal Telegram account once via MTProto
 * and generates a StringSession saved to your .env file.
 *
 * This allows DearDates to send surprise greeting messages directly to any
 * recipient's phone number or username without needing a bot or Chat ID!
 */

const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load existing env variables
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function main() {
  const rl = readline.createInterface({ input, output });

  console.log("\n========================================================");
  console.log("   DearDates — Telegram MTProto Session Setup (Idea 1)  ");
  console.log("========================================================\n");
  console.log("This will connect your Telegram account so DearDates can deliver");
  console.log("wishes directly to recipient phone numbers (e.g. +88017...).\n");

  let apiId = process.env.TELEGRAM_API_ID;
  let apiHash = process.env.TELEGRAM_API_HASH;

  if (!apiId || !apiHash) {
    console.log("ℹ️  You need your Telegram App api_id and api_hash.");
    console.log("   Get them in 1 minute from: https://my.telegram.org -> API development tools\n");
    
    if (!apiId) {
      apiId = await rl.question("Enter your Telegram API ID (numbers only): ");
      apiId = apiId.trim();
    }
    if (!apiHash) {
      apiHash = await rl.question("Enter your Telegram API Hash: ");
      apiHash = apiHash.trim();
    }
  } else {
    console.log(`✓ Using existing API ID: ${apiId}`);
    console.log(`✓ Using existing API Hash: ${apiHash.substring(0, 6)}...`);
  }

  const numericApiId = parseInt(apiId, 10);
  if (isNaN(numericApiId) || !numericApiId) {
    console.error("❌ Invalid API ID. Must be a valid integer.");
    rl.close();
    process.exit(1);
  }

  const { TelegramClient, sessions } = require("telegram");
  const { StringSession } = sessions;

  const stringSession = new StringSession("");
  const client = new TelegramClient(stringSession, numericApiId, apiHash, {
    connectionRetries: 5,
  });

  console.log("\nConnecting to Telegram MTProto Gateway...");
  await client.connect();

  console.log("✓ Connected!\n");

  try {
    await client.start({
      phoneNumber: async () => {
        const ph = await rl.question("Enter your Telegram phone number with country code (e.g. +8801711...): ");
        return ph.trim();
      },
      password: async () => {
        const pw = await rl.question("Enter your Telegram 2FA Password (if enabled, or press enter): ");
        return pw.trim();
      },
      phoneCode: async () => {
        const code = await rl.question("Enter the login code Telegram sent to your app: ");
        return code.trim();
      },
      onError: (err) => {
        console.error("Authentication error:", err.message || err);
      },
    });

    const me = await client.getMe();
    console.log(`\n🎉 Success! Logged in as: ${me.firstName} ${me.lastName || ""} (@${me.username || "no-username"})`);

    const sessionString = client.session.save();

    // Update .env file
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

    function setEnvVar(key, val) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}="${val}"`);
      } else {
        envContent += `\n${key}="${val}"`;
      }
    }

    setEnvVar("TELEGRAM_API_ID", numericApiId.toString());
    setEnvVar("TELEGRAM_API_HASH", apiHash);
    setEnvVar("TELEGRAM_SESSION_STRING", sessionString);

    fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");

    console.log("\n✓ TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_SESSION_STRING");
    console.log("  have been saved to your .env file!");
    console.log("\nDearDates is now ready to dispatch Telegram wishes directly to any phone number! 🚀\n");

    await client.disconnect();
  } catch (err) {
    console.error("\n❌ Failed to complete Telegram login:", err.message || err);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
