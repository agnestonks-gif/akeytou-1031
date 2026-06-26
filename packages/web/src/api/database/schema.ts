import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const shows = sqliteTable("shows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // ISO string "2026-06-28T20:00:00"
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  theme: text("theme").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  totalSeats: integer("total_seats").notNull().default(100),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  showId: integer("show_id").notNull(),
  email: text("email").notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status").notNull().default("pending"), // pending | paid | cancelled
  paymentId: text("payment_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
