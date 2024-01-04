import {
  bigint,
  bigserial,
  boolean,
  char,
  date,
  doublePrecision,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  varchar,
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  phone: varchar('phone', { length: 256 }),
  address: varchar('address', { length: 256 }),
});

export const moodEnum = pgEnum('mood', ['sad', 'happy', 'neutral']);

export const testTable = pgTable('test_table', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  qty: bigint('qty', { mode: 'bigint' }),
  price: numeric('price', { precision: 7, scale: 2 }), // 99999.99
  score: doublePrecision('score'),
  delivered: boolean('delivered').notNull().default(false),
  description: varchar('description', { length: 256 }),
  name: char('name', { length: 10 }), // "chair" => "chair     "
  data: jsonb('data').notNull(),
  startAt: time('start_at', { precision: 3, withTimezone: true }).defaultNow(),
  date: date('date').notNull().defaultNow(),
  mood: moodEnum('mood').default('happy'),
});
