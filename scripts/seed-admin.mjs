/**
 * Seed Admin Script
 *
 * Creates the first admin account for Portfolio Builder.
 * Run this ONCE after first deployment.
 *
 * Usage:
 *   node scripts/seed-admin.mjs --url <site-url> --name <name> --email <email> --password <password>
 *
 * Example:
 *   node scripts/seed-admin.mjs \
 *     --url https://page-builder-1tl.pages.dev \
 *     --name "Admin" \
 *     --email "admin@example.com" \
 *     --password "your-secure-password"
 *
 * After running this script, use wrangler to set the role to admin:
 *   npx wrangler d1 execute portfolio-builder-db --remote \
 *     --command "UPDATE user SET role = 'admin' WHERE email = 'admin@example.com';"
 */

import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    url: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    password: { type: "string" },
  },
});

const { url, name, email, password } = values;

if (!url || !name || !email || !password) {
  console.error("❌ Missing required arguments.");
  console.error(
    "Usage: node scripts/seed-admin.mjs --url <url> --name <name> --email <email> --password <password>",
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("❌ Password must be at least 8 characters.");
  process.exit(1);
}

const baseUrl = url.replace(/\/$/, "");

console.log("\n🚀 Portfolio Builder — Admin Seed Script");
console.log("━".repeat(50));
console.log(`📡 Target: ${baseUrl}`);
console.log(`👤 Name:   ${name}`);
console.log(`📧 Email:  ${email}`);
console.log("━".repeat(50));

// Step 1: Create user via Better Auth sign-up endpoint
console.log("\n[1/2] Creating user account...");

let userId;
try {
  const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: baseUrl,
    },
    body: JSON.stringify({ name, email, password }),
  });

  const location = res.headers.get("location");
  const contentType = res.headers.get("content-type") || "";

  if (res.status >= 300 && res.status < 400) {
    console.error(
      `❌ Unexpected redirect from sign-up endpoint (HTTP ${res.status}).`,
    );
    console.error(`   Location: ${location ?? "(none)"}`);
    process.exit(1);
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    const text = await res.text().catch(() => "");
    console.error("❌ Expected JSON response from sign-up endpoint but got:");
    console.error(`   Content-Type: ${contentType || "(none)"}`);
    console.error(`   HTTP: ${res.status}`);
    console.error(`   Body (first 200 chars): ${text.slice(0, 200)}`);
    process.exit(1);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    if (
      msg.toLowerCase().includes("already") ||
      msg.toLowerCase().includes("exist")
    ) {
      console.warn(
        `⚠️  User already exists — skipping creation, will still update role.`,
      );
    } else {
      console.error(`❌ Failed to create user: ${msg}`);
      process.exit(1);
    }
  } else {
    userId = data?.user?.id;
    console.log(`✅ User created${userId ? ` (id: ${userId})` : ""}`);
  }
} catch (err) {
  console.error(`❌ Network error: ${err.message}`);
  process.exit(1);
}

// Step 2: Promote to admin via wrangler (print command for user to run)
console.log("\n[2/2] Promote to admin role...");
console.log("\n⚠️  Run the following command to set role = admin:\n");
console.log(`  npx wrangler d1 execute portfolio-builder-db --remote \\`);
console.log(
  `    --command "UPDATE user SET role = 'admin' WHERE email = '${email}';"`,
);
console.log("");
console.log("━".repeat(50));
console.log("✅ Done! After running the wrangler command, you can log in at:");
console.log(`   ${baseUrl}/admin/login`);
console.log("━".repeat(50));
console.log("");
