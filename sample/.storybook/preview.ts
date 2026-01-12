import type { Preview } from "@storybook/vue3";
import { setup } from "@storybook/vue3";

// Vuetify のセットアップ
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "light",
  },
});

setup((app) => {
  app.use(vuetify);
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Vuetify 用の背景色設定
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "dark", value: "#121212" },
        { name: "grey", value: "#F5F5F5" },
      ],
    },
  },
  // デフォルトでVuetifyのv-appでラップ
  decorators: [
    (story) => ({
      components: { story },
      template:
        "<v-app><v-main><v-container><story /></v-container></v-main></v-app>",
    }),
  ],
};

export default preview;
