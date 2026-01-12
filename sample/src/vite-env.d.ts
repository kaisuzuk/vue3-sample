/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "vuetify/styles" {
  const styles: string;
  export default styles;
}

declare module "@mdi/font/css/materialdesignicons.css" {
  const styles: string;
  export default styles;
}
