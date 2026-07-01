import { neon, type neonSql } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import { serverEnv } from "@/config/env";
import * as schema from "./schema";

/**
 * Logging wrapper for SQL queries to capture actual PostgreSQL errors
 */
function createLoggingSql() {
  const baseSql = neon(serverEnv.DATABASE_URL);
  
  return {
    ...baseSql,
    async query<T = Record<string, unknown>>(
      strings: TemplateStringsArray, 
      ...values: unknown[]
    ): Promise<T[]> {
      const queryStr = strings.join("?");
      console.log("[DB QUERY]", queryStr.substring(0, 200), values.slice(0, 3));
      try {
        const result = await baseSql.query(strings, ...values);
        return result as T[];
      } catch (error: unknown) {
        const err = error as Error & { code?: string; detail?: string; schema?: string; table?: string };
        console.error("[DB ERROR]", {
          message: err.message,
          code: err.code,
          detail: err.detail,
          schema: err.schema,
          table: err.table,
          hint: (err as Record<string, unknown>).hint,
        });
        throw error;
      }
    },
  } as neonSql;
}

/**
 * Lazy-initialized database connection.
 * Uses a Proxy to defer connection creation until the first query,
 * preventing build-time errors when DATABASE_URL is not available.
 */
function createDb() {
  const loggingSql = createLoggingSql();
  return drizzle(loggingSql, { schema });
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
