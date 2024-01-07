import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const migrationConnection = postgres(process.env.DATABASE_URL!, { max: 1 });

async function main() {
  try {
    await migrate(drizzle(migrationConnection), {
      migrationsFolder: 'drizzle',
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await migrationConnection.end();
  }
}

void main();
