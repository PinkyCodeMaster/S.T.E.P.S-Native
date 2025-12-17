import env from '@/env';
import 'dotenv/config';
import {drizzle} from 'drizzle-orm/node-postgres';

export const db = drizzle({
    connection:{
        connectionString: env.DATABASE_URL,
        ssl: true
    }
});

