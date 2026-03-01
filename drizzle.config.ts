import { defineConfig } from 'drizzle-kit';
import fs from 'fs';
import path from 'path';

// Find the local D1 database file created by Wrangler v3
function getLocalD1DB() {
  const d1Dir = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
  if (fs.existsSync(d1Dir)) {
    const files = fs.readdirSync(d1Dir);
    const sqliteFile = files.find((f) => f.endsWith('.sqlite'));
    if (sqliteFile) {
      return path.join(d1Dir, sqliteFile);
    }
  }
  return '';
}

const localDbPath = getLocalD1DB();

export default defineConfig({
  out: './drizzle/migrations',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  ...(localDbPath && {
    dbCredentials: {
      url: localDbPath,
    },
  }),
});
