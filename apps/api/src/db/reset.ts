import { sql } from "drizzle-orm";
import { db } from ".";

const resetDatabase = async () => {
  console.log("Dropping the database!");

  try {
    await db.execute(sql`DROP SCHEMA public CASCADE;`);
    await db.execute(sql`CREATE SCHEMA public;`);
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);

    console.log("Dropping database success!");
  } catch (e) {
    console.error("Failed to resetting the database ", e);
  } finally {
    process.exit(0);
  }
};

resetDatabase();
