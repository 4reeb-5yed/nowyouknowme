import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";

import { users } from "../src/server/db/schema/user";
import { siteConfig } from "../src/server/db/schema/site-config";
import { sections } from "../src/server/db/schema/section";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is required");
    process.exit(1);
  }

  console.log("🌱 Starting database seed...");

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  // --- Seed Owner account ---
  const email = process.env.OWNER_EMAIL || "admin@example.com";
  const password = process.env.OWNER_PASSWORD || "changeme123";

  console.log(`📧 Seeding owner account: ${email}`);
  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .insert(users)
    .values({
      email,
      passwordHash,
    })
    .onConflictDoNothing({ target: users.email });

  console.log("✅ Owner account seeded");

  // --- Seed site_config ---
  console.log("⚙️  Seeding site configuration...");

  await db
    .insert(siteConfig)
    .values({
      theme: "system",
      accentColor: "#2563eb",
      heroTagline: "Welcome to my portfolio",
      metaDescription: "A personal portfolio showcasing my projects and skills",
    })
    .onConflictDoNothing();

  console.log("✅ Site configuration seeded");

  // --- Seed sections ---
  console.log("📝 Seeding initial sections...");

  const sectionData = [
    {
      key: "about",
      content:
        "Hello! I am a passionate developer focused on building great software.",
    },
    {
      key: "skills",
      content:
        "TypeScript, React, Next.js, Node.js, PostgreSQL, Cloud Infrastructure",
    },
    {
      key: "contact",
      content:
        "Feel free to reach out via the contact form or connect with me on social media.",
    },
  ];

  for (const section of sectionData) {
    await db
      .insert(sections)
      .values(section)
      .onConflictDoNothing({ target: sections.key });
  }

  console.log("✅ Sections seeded");

  console.log("🎉 Database seed completed successfully!");
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
