import { and, eq, gt, gte, like, or } from 'drizzle-orm';
import express, { Express } from 'express';

import { db } from '@/db/index.js';
import {
  categories,
  posts,
  postsToCategories,
  profiles,
  users,
} from '@/db/schema.js';
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

app.get('/api/v1/users/:userId/posts/categories', async (_, res) => {
  try {
    // const id = Number(req.params.userId);
    // const result = await db.query.users.findFirst({
    //   where: eq(users.id, id),
    //   with: {
    //     posts: {
    //       with: {
    //         postToCategories: {
    //           with: {
    //             category: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    const result2 = await db.query.posts.findFirst({
      with: {
        author: true,
        postsToCategories: {
          columns: {
            categoriesId: false,
            postId: false,
          },
          with: {
            category: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        posts: result2,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }
});

// One to one
app.post('/api/v1/users/new/signup', async (_, res) => {
  const newUsers = await db
    .insert(users)
    .values({
      fullName: 'Usman',
      address: 'Lahore',
      phone: '03000000000',
      score: 100,
    })
    .returning({ userId: users.id });

  await db.insert(profiles).values({
    userId: newUsers[0].userId,
    bio: 'This is my bio',
  });

  const result = await db.query.users.findFirst({
    where: eq(users.id, newUsers[0].userId),
    with: {
      profile: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: result,
    },
  });
});

// One to many
app.post('/api/v1/users/new/post', async (_, res) => {
  try {
    ['post1', 'post2', 'post3'].forEach(async (post) => {
      await db.insert(posts).values({
        authorId: 1,
        text: post,
      });
    });

    const user = await db.query.users.findFirst({
      where: eq(users.id, 1),
      with: {
        posts: true,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Posts created',
      data: { user },
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({
        status: 'fail',
        message: err.message,
      });
    }
  }
});

// Many to many
app.post('/api/v1/users/new/post/categories', async (_, res) => {
  try {
    const newCategories = await db
      .insert(categories)
      .values([
        { name: 'category1' },
        { name: 'category2' },
        { name: 'category3' },
      ])
      .returning({ categoryId: categories.id });

    const newPosts = await db
      .insert(posts)
      .values([
        { authorId: 2, text: 'post1' },
        { authorId: 2, text: 'post2' },
        { authorId: 2, text: 'post3' },
      ])
      .returning({ postId: posts.id });

    await db.insert(postsToCategories).values([
      { postId: newPosts[0].postId, categoriesId: newCategories[0].categoryId },
      { postId: newPosts[1].postId, categoriesId: newCategories[1].categoryId },
      { postId: newPosts[2].postId, categoriesId: newCategories[2].categoryId },
    ]);

    const result = await db.query.users.findFirst({
      where: eq(users.id, 2),
      with: {
        posts: {
          with: {
            postsToCategories: {
              columns: {},
              with: {
                category: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Posts created',
      data: { result },
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({
        status: 'fail',
        message: err.message,
      });
    }
  }
});
