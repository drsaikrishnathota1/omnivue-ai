import { createApp } from './app';
import { serverConfig, validateServerConfig } from './env';

validateServerConfig();

const app = createApp();

app.listen(serverConfig.port, serverConfig.host, () => {
  const mode = serverConfig.isLive ? 'live' : 'demo';
  console.log(
    `[omnivue-api] Listening on http://${serverConfig.host}:${serverConfig.port} (${mode} mode, env=${serverConfig.nodeEnv})`,
  );
});
