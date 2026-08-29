import dotenv from 'dotenv';
import path from 'path';

// Resolve project directories
const dbDir = __dirname;
const backendRoot = path.resolve(dbDir, '../..');
const workspaceRoot = path.resolve(backendRoot, '..');

dotenv.config({ path: path.join(workspaceRoot, '.env') });
dotenv.config({ path: path.join(backendRoot, '.env') });

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Computes database connection URL dynamically supporting:
 * 1. Cloud PostgreSQL (Neon / Supabase / Render) in production via DATABASE_URL
 * 2. Local SQLite in offline development (always resolved to absolute workspace path)
 */
function resolveDatabaseUrl(): string {
  const rawUrl = process.env.DATABASE_URL;

  // Cloud PostgreSQL connection (Production on Vercel / Neon)
  if (rawUrl && (rawUrl.startsWith('postgres://') || rawUrl.startsWith('postgresql://'))) {
    return rawUrl;
  }

  // Absolute local SQLite path to prisma/dev.db
  const absoluteDbPath = path.resolve(workspaceRoot, 'prisma', 'dev.db');
  return `file:${absoluteDbPath}`;
}

const connectionUrl = resolveDatabaseUrl();

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

// Maintain singleton instance across serverless lambda cold starts & local hot reloads
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
