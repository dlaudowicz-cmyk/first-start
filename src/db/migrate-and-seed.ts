import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index";
import { projects, programs } from "./schema";
import { seed } from "./seed";
import { academySeed } from "./academy-seed";

async function main() {
  migrate(db, { migrationsFolder: "./drizzle" });

  const existing = await db.select().from(projects).limit(1);
  if (existing.length === 0) {
    await seed();
    console.log("Seeded database with AI Creator Curriculum starter data.");
  }

  const existingProgram = await db.select().from(programs).limit(1);
  if (existingProgram.length === 0) {
    await academySeed();
    console.log("Seeded database with Academy demo data.");
  }
}

main();
