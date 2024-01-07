import { createInsertSchema } from 'drizzle-zod';

import { users } from '@/db/schema.js';

export const insertUserSchema = createInsertSchema(users);
