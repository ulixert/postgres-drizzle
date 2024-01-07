import { and, eq, gt, gte, like, or } from 'drizzle-orm';
import express, { Express } from 'express';

import { db } from '@/db/index.js';
import { profiles, users } from '@/db/schema.js';
import { insertUserSchema } from '@/types/schemas.js';

export const app: Express = express();
app.use(express.json());

app.get('/api/v1/users', async (_, res) => {
  const allUsers = await db.select().from(users);
  res.status(200).json({
    status: 'success',
    data: {
      users: allUsers,
    },
  });
});

app.get('/api/v1/users/:name', async (_, res) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(
        and(
          gte(users.id, 2),
          or(gt(users.score, 30), like(users.fullName, '%e%')),
        ),
      );

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }
});

app.get('/api/v1/users/:id/profile', async (req, res) => {
  const id = Number(req.params.id);
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      profile: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

app.get('/api/v1/users/join/:id/profile', async (req, res) => {
  const profile = await db
    .select({
      profile_id: profiles.id,
      bio: profiles.bio,
      userId: profiles.userId,
      fullName: users.fullName,
    })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.id, Number(req.params.id)));

  res.status(200).json({
    status: 'success',
    data: {
      profile,
    },
  });
});

app.post('/api/v1/users', async (req, res) => {
  try {
    const newUser = insertUserSchema.parse(req.body);

    const insertedUser = await db
      .insert(users)
      .values(newUser)
      .returning({ insertedId: users.id });
    const userId = insertedUser[0].insertedId;
    await db.insert(profiles).values({
      bio: 'This is my bio',
      userId,
    });

    res.status(201).json({
      status: 'success',
      message: 'User created',
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({
        status: 'fail',
        message: err.message,
      });
      return;
    }
    res.status(400).json({
      status: 'fail',
      message: 'Invalid request body',
    });
  }
});

app.get('/api/v1/users/:id/posts', async (req, res) => {
  const id = Number(req.params.id);
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      posts: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      posts: result?.posts,
    },
  });
});
