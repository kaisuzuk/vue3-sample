import type { Meta, StoryObj } from "@storybook/vue3";
import AppHeader from "./AppHeader.vue";

/**
 * AppHeader - アプリケーションヘッダー
 *
 * ページタイトルと戻るボタン、アクションボタンを配置するヘッダーコンポーネント。
 * 全画面で共通して使用される。
 */
const meta: Meta<typeof AppHeader> = {
  title: "shared/ui/AppHeader",
  component: AppHeader,
  tags: ["autodocs"],
  argTypes: {
    title: {
      description: "ページタイトル",
      control: "text",
    },
    showBack: {
      description: "戻るボタンを表示するか",
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

/**
 * 基本的な使用例
 */
export const Default: Story = {
  args: {
    title: "タスク一覧",
    showBack: false,
  },
};

/**
 * 戻るボタン付き
 */
export const WithBackButton: Story = {
  args: {
    title: "タスク編集",
    showBack: true,
  },
};

/**
 * アクションボタン付き
 */
export const WithActions: Story = {
  args: {
    title: "タスク一覧",
    showBack: false,
  },
  render: (args) => ({
    components: { AppHeader },
    setup() {
      return { args };
    },
    template: `
      <AppHeader v-bind="args">
        <template #actions>
          <v-btn color="primary" prepend-icon="mdi-plus">新規作成</v-btn>
        </template>
      </AppHeader>
    `,
  }),
};

/**
 * 戻るボタンとアクションボタンの組み合わせ
 */
export const FullHeader: Story = {
  args: {
    title: "タスク詳細",
    showBack: true,
  },
  render: (args) => ({
    components: { AppHeader },
    setup() {
      return { args };
    },
    template: `
      <AppHeader v-bind="args">
        <template #actions>
          <v-btn variant="outlined" prepend-icon="mdi-pencil">編集</v-btn>
          <v-btn color="error" variant="outlined" prepend-icon="mdi-delete">削除</v-btn>
        </template>
      </AppHeader>
    `,
  }),
};
