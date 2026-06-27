import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import { serverEnv } from "@/config/env";
import * as schema from "./schema";

/**
 * Lazy-initialized database connection.
 * Uses a Proxy to defer connection creation until the first query,
 * preventing build-time errors when DATABASE_URL is not available.
 */
function createDb() {
  const sql = neon(serverEnv.DATABASE_URL);
  return drizzle(sql, { schema });
}

let _db: NeonHttpDatabase<typeof schema> | null = null;

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    if (!_db) {
      _db = createDb();
    }
    return Reflect.get(_db, prop);
  },
});

export type Database = NeonHttpDatabase<typeof schema>;
