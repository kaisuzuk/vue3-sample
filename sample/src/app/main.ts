import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import { vuetify } from "./plugins/vuetify";

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("@/mocks/browser");
    return worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

enableMocking().then(() => {
  const app = createApp(App);

  app.use(createPinia());
  app.use(router);
  app.use(vuetify);

  app.mount("#app");
});
