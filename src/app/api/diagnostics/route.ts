import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { serverEnv } from "@/config/env";

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    databaseUrl: serverEnv.DATABASE_URL ? "[SET]" : "[NOT SET]",
    databaseUrlMasked: serverEnv.DATABASE_URL 
      ? `${serverEnv.DATABASE_URL.split("@")[0]?.replace(/:[^:@]+@/, ":***@")}@...` 
      : "[NOT SET]",
  };

  try {
    const sql = neon(serverEnv.DATABASE_URL);
    
    // Test connection
    const connectionTest = await sql`SELECT 1 as test`;
    results.connectionTest = { success: true, result: connectionTest };
  } catch (error: unknown) {
    const err = error as Error & { 
      code?: string; 
      detail?: string; 
      schema?: string; 
      table?: string;
      message?: string;
    };
    results.connectionTest = { 
      success: false, 
      error: {
        message: err.message,
        code: err.code,
        detail: err.detail,
        schema: err.schema,
        table: err.table,
      }
    };
    return NextResponse.json(results, { status: 500 });
  }

  try {
    const sql = neon(serverEnv.DATABASE_URL);
    
    // Check if site_config table exists and has data
    const siteConfigCheck = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'site_config'
      ORDER BY ordinal_position
    `;
    results.siteConfigColumns = siteConfigCheck;
    
    // Check if site_config has any rows
    const siteConfigRows = await sql`SELECT COUNT(*) as count FROM site_config`;
    results.siteConfigRowCount = siteConfigRows;
  } catch (error: unknown) {
    const err = error as Error & { 
      code?: string; 
      detail?: string; 
      message?: string;
    };
    results.siteConfigCheck = { 
      success: false, 
      error: {
        message: err.message,
        code: err.code,
        detail: err.detail,
      }
    };
  }

  try {
    const sql = neon(serverEnv.DATABASE_URL);
    
    // Check if activity_logs table exists
    const activityLogsCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'activity_logs'
      ) as exists
    `;
    results.activityLogsExists = activityLogsCheck[0]?.exists;
    
    if (activityLogsCheck[0]?.exists) {
      const activityLogsColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'activity_logs'
        ORDER BY ordinal_position
      `;
      results.activityLogsColumns = activityLogsColumns;
    }
  } catch (error: unknown) {
    const err = error as Error & { 
      code?: string; 
      detail?: string; 
      message?: string;
    };
    results.activityLogsCheck = { 
      success: false, 
      error: {
        message: err.message,
        code: err.code,
        detail: err.detail,
      }
    };
  }

  try {
    const sql = neon(serverEnv.DATABASE_URL);
    
    // List all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    results.allTables = tables.map((t: Record<string, unknown>) => t.table_name);
  } catch (error: unknown) {
    const err = error as Error & { 
      code?: string; 
      detail?: string; 
      message?: string;
    };
    results.tablesCheck = { 
      success: false, 
      error: {
        message: err.message,
        code: err.code,
        detail: err.detail,
      }
    };
  }

  return NextResponse.json(results);
}
