import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

// Bind 0.0.0.0 so a physical device over LAN / adb reverse can reach the API.
app.listen(env.PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`SamanRent API listening on http://0.0.0.0:${env.PORT} (${env.NODE_ENV})`);
});
