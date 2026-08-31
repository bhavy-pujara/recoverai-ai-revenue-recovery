import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '../generated/prisma';

const dbDir = __dirname;
const backendRoot = path.resolve(dbDir, '../..');
const workspaceRoot = path.resolve(backendRoot, '..');

dotenv.config({ path: path.join(workspaceRoot, '.env') });
dotenv.config({ path: path.join(backendRoot, '.env') });

const connectionUrl = process.env.DATABASE_URL;

if (!connectionUrl) {
throw new Error('DATABASE_URL is not configured');
}

declare global {
// eslint-disable-next-line no-var
var prisma: PrismaClient | undefined;
}

export const prisma =
global.prisma ||
new PrismaClient({
datasources: {
db: {
url: connectionUrl,
},
},
log:
process.env.NODE_ENV === 'development'
? ['warn', 'error']
: ['error'],
});

if (process.env.NODE_ENV !== 'production') {
global.prisma = prisma;
}

export default prisma;
