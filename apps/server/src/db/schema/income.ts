import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

/**
 * Income records are stored in minor units (cents/pence) for precision.
 * Frequencies are normalized server-side to monthly when needed.
 */
export const incomeSourceEnum = pgEnum("income_source", [
  "wage",
  "universalCredit",
  "benefit",
  "other",
]);

export const incomeFrequencyEnum = pgEnum("income_frequency", [
  "monthly",
  "weekly",
  "fortnightly",
  "fourWeekly",
  "annual",
  "hourly",
]);

export const hoursPeriodEnum = pgEnum("hours_period", [
  "weekly",
  "fortnightly",
  "monthly",
]);

export const income = pgTable("income", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sourceType: incomeSourceEnum("source_type").notNull(),
  label: text("label").notNull(),
  amountCents: integer("amount_cents").notNull(), // stored in minor units
  amountType: text("amount_type").notNull(), // gross | net
  frequency: incomeFrequencyEnum("frequency").notNull(),
  hoursPerPeriod: integer("hours_per_period"),
  hoursPeriod: hoursPeriodEnum("hours_period"), // used when frequency = hourly
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const incomeRelations = relations(income, ({ one }) => ({
  user: one(user, {
    fields: [income.userId],
    references: [user.id],
  }),
}));
