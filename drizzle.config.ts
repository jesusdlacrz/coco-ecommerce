import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'turso',
	dbCredentials: {
		url: process.env.TURSO_DATABASE_URL ?? 'file:./data/coco.db',
		authToken: process.env.TURSO_AUTH_TOKEN
	}
});
