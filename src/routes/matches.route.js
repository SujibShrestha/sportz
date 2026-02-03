import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";
export const matchRoutes = Router();

const MAX_LIMIT = 100;

matchRoutes.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query.",
      details: JSON.stringify(parsed.error),
    });
  }
  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to list matches" });
  }
});

matchRoutes.post("/", async (req, res) => {
  const parse = createMatchSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      error: "Invalid payload.",
      details: JSON.stringify(parse.error),
    });
  }

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parse.data,
        startTime: new Date(parse.data.startTime),
        endTime: new Date(parse.data.endTime),
        homeScore: parse.data.homeScore ?? 0,
        awayScore: parse.data.awayScore ?? 0,
        status: getMatchStatus(parse.data.startTime, parse.data.endTime),
      })
      .returning();

    res.status(201).json({ data: event });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create  match.",
      details: error.message || error,
    });
  }
});
