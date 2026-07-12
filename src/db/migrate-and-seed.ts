import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index";
import { projects } from "./schema";
import { seed } from "./seed";

async function main() {
  migrate(db, { migrationsFolder: "./drizzle" });

  const existing = await db.select().from(projects).limit(1);
  if (existing.length === 0) {
    await seed();
    console.log("Seeded database with AI Creator Curriculum starter data.");
  }
}

main();
