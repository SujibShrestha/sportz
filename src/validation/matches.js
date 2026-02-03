import { z } from 'zod';

/**
 * Match Status Constants
 * Enum-like object for match status values
 */
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

/**
 * List Matches Query Schema
 * Validates query parameters for fetching matches with pagination
 */
export const listMatchesQuerySchema = z.object({
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: 'Limit must be a positive integer' })
    .refine((val) => val <= 100, { message: 'Limit cannot exceed 100' })
    .optional(),
});

/**
 * Match ID Param Schema
 * Validates route parameter for match ID
 */
export const matchIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: 'ID must be a positive integer' }),
});

/**
 * Create Match Schema
 * Validates data for creating a new match
 */
export const createMatchSchema = z
  .object({
    sport: z.string().trim().min(1, { message: 'Sport is required' }),
    homeTeam: z.string().trim().min(1, { message: 'Home team is required' }),
    awayTeam: z.string().trim().min(1, { message: 'Away team is required' }),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    homeScore: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 0, { message: 'Home score must be non-negative' })
      .optional(),
    awayScore: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 0, { message: 'Away score must be non-negative' })
      .optional(),
  })
  .refine(
    (data) => {
      try {
        new Date(data.startTime).toISOString();
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'Start time must be a valid ISO date string',
      path: ['startTime'],
    },
  )
  .refine(
    (data) => {
      try {
        new Date(data.endTime).toISOString();
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'End time must be a valid ISO date string',
      path: ['endTime'],
    },
  )
  .superRefine((data, ctx) => {
    const startTime = new Date(data.startTime).getTime();
    const endTime = new Date(data.endTime).getTime();

    if (endTime <= startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be chronologically after start time',
        path: ['endTime'],
      });
    }
  });

/**
 * Update Score Schema
 * Validates data for updating match scores
 */
export const updateScoreSchema = z.object({
  homeScore: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0, { message: 'Home score must be non-negative' }),
  awayScore: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0, { message: 'Away score must be non-negative' }),
});
