import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "./schema";
import env from '@/env';
import 'dotenv/config';

const ssl =
  env.NODE_ENV === "production"
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false };

export const db = drizzle({
  connection: {
    connectionString: env.DATABASE_URL,
    ssl,
  },
  schema,
});

