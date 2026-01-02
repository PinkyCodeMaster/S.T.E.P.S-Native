import { Hono } from "hono";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  hoursPeriodEnum,
  income,
  incomeFrequencyEnum,
  incomeSourceEnum,
} from "@/db/schema/income";
import { and, eq } from "drizzle-orm";

const incomeInputSchema = z.object({
  sourceType: z.enum(incomeSourceEnum.enumValues),
  label: z.string().min(1),
  amount: z.number().positive(),
  amountType: z.enum(["gross", "net"]).default("net"),
  frequency: z.enum(incomeFrequencyEnum.enumValues),
  hoursPerPeriod: z.number().int().positive().optional(),
  hoursPeriod: z.enum(hoursPeriodEnum.enumValues).optional(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
});

const getSession = async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

  // Better Auth expects headers; sessionToken is optional
  const result = await auth.api.getSession({
    headers: req.headers,
    ...(bearer ? { sessionToken: bearer } : {}),
  } as any);

  return result?.data ?? null;
};

const toMinorUnits = (amount: number) =>
  Math.round(amount * 100);

const normalizeHourly = (
  amountCents: number,
  hoursPerPeriod?: number | null,
  hoursPeriod?: (typeof hoursPeriodEnum.enumValues)[number] | null,
) => {
  if (!hoursPerPeriod || !hoursPeriod) return amountCents;
  const perPeriod = amountCents * hoursPerPeriod;
  switch (hoursPeriod) {
    case "weekly":
      return Math.round((perPeriod * 52) / 12);
    case "fortnightly":
      return Math.round((perPeriod * 26) / 12);
    case "monthly":
    default:
      return perPeriod;
  }
};

const normalizeMonthly = (row: typeof income.$inferSelect) => {
  if (row.frequency === "hourly") {
    return normalizeHourly(
      row.amountCents,
      row.hoursPerPeriod,
      row.hoursPeriod,
    );
  }
  switch (row.frequency) {
    case "weekly":
      return Math.round((row.amountCents * 52) / 12);
    case "fortnightly":
      return Math.round((row.amountCents * 26) / 12);
    case "fourWeekly":
      return Math.round((row.amountCents * 13) / 12);
    case "annual":
      return Math.round(row.amountCents / 12);
    case "monthly":
    default:
      return row.amountCents;
  }
};

const ucReduction = (monthlyTakeHomeCents: number) => {
  const disregard = 41100; // £411 in cents/pence
  const taperRate = 0.55;
  const excess = Math.max(0, monthlyTakeHomeCents - disregard);
  return Math.round(excess * taperRate);
};

export const incomeRoutes = new Hono()
  .post("/incomes", async (c) => {
    const session = await getSession(c.req.raw);
    if (!session?.user) return c.json({ ok: false, message: "Unauthorized" }, 401);

    const body = await c.req.json();
    const parsed = incomeInputSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ ok: false, message: "Invalid payload", issues: parsed.error.format() }, 400);
    }

    const id = crypto.randomUUID();
    const payload = parsed.data;

    await db.insert(income).values({
      id,
      userId: session.user.id,
      sourceType: payload.sourceType,
      label: payload.label,
      amountCents: toMinorUnits(payload.amount),
      amountType: payload.amountType,
      frequency: payload.frequency,
      hoursPerPeriod: payload.hoursPerPeriod ?? null,
      hoursPeriod: payload.hoursPeriod ?? null,
      periodStart: payload.periodStart ? new Date(payload.periodStart) : null,
      periodEnd: payload.periodEnd ? new Date(payload.periodEnd) : null,
    });

    return c.json({ ok: true, id });
  })
  .get("/incomes", async (c) => {
    const session = await getSession(c.req.raw);
    if (!session?.user) return c.json({ ok: false, message: "Unauthorized" }, 401);

    const rows = await db.query.income.findMany({
      where: eq(income.userId, session.user.id),
    });

    return c.json({ ok: true, data: rows });
  })
  .patch("/incomes/:id", async (c) => {
    const session = await getSession(c.req.raw);
    if (!session?.user) return c.json({ ok: false, message: "Unauthorized" }, 401);
    const id = c.req.param("id");

    const body = await c.req.json();
    const parsed = incomeInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return c.json({ ok: false, message: "Invalid payload", issues: parsed.error.format() }, 400);
    }

    const values: Partial<typeof income.$inferInsert> = {};
    if (parsed.data.sourceType) values.sourceType = parsed.data.sourceType;
    if (parsed.data.label) values.label = parsed.data.label;
    if (parsed.data.amount !== undefined) values.amountCents = toMinorUnits(parsed.data.amount);
    if (parsed.data.amountType) values.amountType = parsed.data.amountType;
    if (parsed.data.frequency) values.frequency = parsed.data.frequency;
    if (parsed.data.hoursPerPeriod !== undefined) values.hoursPerPeriod = parsed.data.hoursPerPeriod;
    if (parsed.data.hoursPeriod !== undefined) values.hoursPeriod = parsed.data.hoursPeriod;
    if (parsed.data.periodStart !== undefined) values.periodStart = parsed.data.periodStart ? new Date(parsed.data.periodStart) : null;
    if (parsed.data.periodEnd !== undefined) values.periodEnd = parsed.data.periodEnd ? new Date(parsed.data.periodEnd) : null;

    await db
      .update(income)
      .set(values)
      .where(and(eq(income.id, id), eq(income.userId, session.user.id)));

    return c.json({ ok: true });
  })
  .delete("/incomes/:id", async (c) => {
    const session = await getSession(c.req.raw);
    if (!session?.user) return c.json({ ok: false, message: "Unauthorized" }, 401);
    const id = c.req.param("id");

    await db
      .delete(income)
      .where(and(eq(income.id, id), eq(income.userId, session.user.id)));

    return c.json({ ok: true });
  })
  .get("/incomes/summary", async (c) => {
    const session = await getSession(c.req.raw);
    if (!session?.user) return c.json({ ok: false, message: "Unauthorized" }, 401);

    const rows = await db.query.income.findMany({
      where: eq(income.userId, session.user.id),
    });

    const items = rows.map((row) => ({
      id: row.id,
      label: row.label,
      sourceType: row.sourceType,
      monthlyAmountCents: normalizeMonthly(row),
    }));

    const monthlyIncome = items.reduce((sum, i) => sum + i.monthlyAmountCents, 0);
    const monthlyWages = items
      .filter((i) => i.sourceType === "wage")
      .reduce((sum, i) => sum + i.monthlyAmountCents, 0);
    const monthlyBenefits = items
      .filter((i) => i.sourceType === "benefit")
      .reduce((sum, i) => sum + i.monthlyAmountCents, 0);
    const monthlyOther = items
      .filter((i) => i.sourceType === "other")
      .reduce((sum, i) => sum + i.monthlyAmountCents, 0);
    const monthlyUc = items
      .filter((i) => i.sourceType === "universalCredit")
      .reduce((sum, i) => sum + i.monthlyAmountCents, 0);

    const reduction = monthlyUc > 0 ? ucReduction(monthlyWages) : 0;
    const ucAfterTaper = Math.max(0, monthlyUc - reduction);
    const netAfterUc = monthlyWages + monthlyBenefits + monthlyOther + ucAfterTaper;

    return c.json({
      ok: true,
      items,
      totals: {
        monthlyIncome,
        monthlyWages,
        monthlyBenefits,
        monthlyOther,
        monthlyUc,
        ucReduction: reduction,
        ucAfterTaper,
        netAfterUc,
      },
      ucRules: {
        disregardCents: 41100,
        taper: 0.55,
      },
    });
  });
