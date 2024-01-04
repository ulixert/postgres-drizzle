import express, { Express } from 'express';

import { db } from '@/db/index.js';
import { user } from '@/db/schema.js';

export const app: Express = express();

app.get('/api/v1/users', async (_, res) => {
  const users = await db.select().from(user).execute();
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});
