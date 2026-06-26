import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./database";
import * as schema from "./database/schema";
import { eq } from "drizzle-orm";

// Seed initial show data if empty
async function seedIfEmpty() {
  try {
    const existing = await db.select().from(schema.shows).limit(1);
    if (existing.length === 0) {
      await db.insert(schema.shows).values({
        date: "2026-06-28T20:00:00",
        venue: "бар-театр «Подвал»",
        city: "Москва",
        theme: "О детях, родителях и разрушении стереотипов",
        description:
          "Два человека, ноль заготовок и зал, который решает, что будет дальше. Мы превращаем случайные фразы из зала в сцены, от которых сводит щёки.",
        price: 900,
        totalSeats: 100,
        isActive: true,
      });
    }
  } catch (e) {
    console.error("Seed error:", e);
  }
}

seedIfEmpty();

const app = new Hono()
  .basePath("api")
  .use(cors({ origin: "*" }))
  .get("/health", (c) => c.json({ status: "ok" }, 200))

  // Get current active show
  .get("/shows/current", async (c) => {
    const show = await db
      .select()
      .from(schema.shows)
      .where(eq(schema.shows.isActive, true))
      .limit(1);
    if (!show.length) return c.json({ error: "No active show" }, 404);
    return c.json({ show: show[0] }, 200);
  })

  // Get all shows (admin)
  .get("/shows", async (c) => {
    const shows = await db.select().from(schema.shows);
    return c.json({ shows }, 200);
  })

  // Update show (admin)
  .patch("/shows/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const updated = await db
      .update(schema.shows)
      .set(body)
      .where(eq(schema.shows.id, id))
      .returning();
    return c.json({ show: updated[0] }, 200);
  })

  // Create order (initiate payment)
  .post("/orders", async (c) => {
    const body = await c.req.json<{
      showId: number;
      email: string;
      quantity: number;
    }>();

    const show = await db
      .select()
      .from(schema.shows)
      .where(eq(schema.shows.id, body.showId))
      .limit(1);

    if (!show.length) return c.json({ error: "Show not found" }, 404);

    const totalAmount = show[0].price * body.quantity;

    // Generate mock payment ID
    const paymentId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const [order] = await db
      .insert(schema.orders)
      .values({
        showId: body.showId,
        email: body.email,
        quantity: body.quantity,
        totalAmount,
        status: "pending",
        paymentId,
      })
      .returning();

    // In demo mode, return a mock QR/SBP payload
    return c.json(
      {
        order,
        payment: {
          id: paymentId,
          amount: totalAmount,
          currency: "RUB",
          sbpQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://yookassa.ru/demo/sbp/${paymentId}`,
          confirmationUrl: `https://yookassa.ru/demo/sbp/${paymentId}`,
          status: "pending",
        },
      },
      201
    );
  })

  // Check order status (mock polling)
  .get("/orders/:id/status", async (c) => {
    const id = parseInt(c.req.param("id"));
    const order = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, id))
      .limit(1);

    if (!order.length) return c.json({ error: "Order not found" }, 404);

    return c.json({ status: order[0].status, order: order[0] }, 200);
  })

  // Simulate payment success (demo only)
  .post("/orders/:id/confirm-demo", async (c) => {
    const id = parseInt(c.req.param("id"));
    const [updated] = await db
      .update(schema.orders)
      .set({ status: "paid" })
      .where(eq(schema.orders.id, id))
      .returning();

    if (!updated) return c.json({ error: "Order not found" }, 404);
    return c.json({ status: "paid", order: updated }, 200);
  });

export type AppType = typeof app;
export default app;
