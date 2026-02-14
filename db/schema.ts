import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

// =============================
// Tables
// =============================

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),

  email: text('email'),
  name: text('name'),

  githubUsername: text('github_username').notNull(),
  githubId: integer('github_id').notNull(),
  githubNodeId: text('github_node_id').notNull(),
  githubAvatarUrl: text('github_avatar_url').notNull(),
  githubHtmlUrl: text('github_html_url').notNull(),

  githubNotificationEmail: text('github_notification_email'),
  githubBio: text('github_bio'),
  githubLocation: text('github_location'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

// =============================
// Types
// =============================

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

// =============================
// Relations
// =============================

// export const usersTableRelations = relations(
//   usersTable,
//   ({ many, one }) => ({
//     messages: many(messagesTable),
//     request: one(requestsTable),
//   })
// );
