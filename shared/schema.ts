import { pgTable, text, serial, integer, boolean, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  users: integer("users").notNull(),
  plan: text("plan").notNull(), // 'standard' | 'custom'
  implementation: text("implementation").notNull(), // 'none' | 'express' | 'starter' | 'basic' | 'standard' | 'custom'
  termDiscounts: jsonb("term_discounts").notNull(),
  selectedTerms: jsonb("selected_terms").notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true });

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
