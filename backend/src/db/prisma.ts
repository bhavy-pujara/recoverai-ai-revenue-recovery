import dotenv from 'dotenv';
import path from 'path';

// Resolve project directories
const dbDir = __dirname; // backend/src/db
const backendRoot = path.resolve(dbDir, '../..');
const workspaceRoot = path.resolve(backendRoot, '..');

dotenv.config({ path: path.join(workspaceRoot, '.env') });
dotenv.config({ path: path.join(backendRoot, '.env') });

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Ensure absolute database path
const targetDbPath = path.join(workspaceRoot, 'prisma', 'dev.db');

// If DATABASE_URL is set to a remote PostgreSQL URL, use it; otherwise use absolute SQLite path
const dbUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')
    ? process.env.DATABASE_URL
    : `file:${targetDbPath}`;

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
