/**
 * Mentora API — entry point.
 *
 * Imports the pre-configured Express app from ./app and starts the HTTP server.
 * The app itself is defined in ./app so that integration tests can import
 * `createApp()` (or the singleton `app`) without triggering a listen() call.
 */

import 'dotenv/config';
import { env } from './config/env';
import { app } from './app';

// ─── Start server ─────────────────────────────────────────────────────────────

const PORT = env.API_PORT;

app.listen(PORT, () => {
  console.log(`\n🎓 Mentora API running at http://localhost:${PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
