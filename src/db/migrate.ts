import 'dotenv/config.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
console.log(connectionString);
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log('migration started...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('migration finished');
  process.exit(0);
}

main().catch((err) => {
  console.error('💥', err);
  process.exit(1);
});
