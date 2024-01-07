import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  varchar,
} from 'drizzle-orm/pg-core';

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

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  postsToCategories: many(postsToCategories),
}));

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  postsToCategories: many(postsToCategories),
}));

export const postsToCategories = pgTable(
  'posts_to_categories',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id),
    categoriesId: integer('categories_id')
      .notNull()
      .references(() => categories.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.categoriesId] }),
  }),
);

export const postsToCategoriesRelations = relations(
  postsToCategories,
  ({ one }) => ({
    post: one(posts, {
      fields: [postsToCategories.postId],
      references: [posts.id],
    }),
    category: one(categories, {
      fields: [postsToCategories.categoriesId],
      references: [categories.id],
    }),
  }),
);

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
