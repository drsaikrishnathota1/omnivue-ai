import { createApp } from './app';

const port = Number(process.env.PORT ?? 8787);

createApp().listen(port, () => {
  console.log(`OmniVue API listening on http://localhost:${port}`);
});
