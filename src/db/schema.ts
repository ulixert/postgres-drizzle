import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  phone: varchar('phone', { length: 256 }),
  address: varchar('address', { length: 256 }),
  score: integer('score'),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  posts: many(posts),
}));

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  bio: varchar('bio', { length: 256 }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  text: varchar('text', { length: 256 }).notNull(),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id),
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

// export const moodEnum = pgEnum('mood', ['sad', 'happy', 'neutral']);
//
// export const testTable = pgTable('test_table', {
//   id: bigserial('id', { mode: 'bigint' }).primaryKey(),
//   qty: bigint('qty', { mode: 'bigint' }),
//   price: numeric('price', { precision: 7, scale: 2 }), // 99999.99
//   score: doublePrecision('score'),
//   delivered: boolean('delivered').notNull().default(false),
//   description: varchar('description', { length: 256 }),
//   name: char('name', { length: 10 }), // "chair" => "chair     "
//   data: jsonb('data').notNull(),
//   startAt: time('start_at', { precision: 3 }).defaultNow(),
//   date: date('date').notNull().defaultNow(),
//   mood: moodEnum('mood').default('happy'),
// });
