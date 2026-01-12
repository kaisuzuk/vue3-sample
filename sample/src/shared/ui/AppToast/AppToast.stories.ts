import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import AppToast from "./AppToast.vue";

/**
 * AppToast - トースト通知コンポーネント
 *
 * 成功/エラー/情報などのトースト通知を表示する。
 */
const meta: Meta<typeof AppToast> = {
  title: "shared/ui/AppToast",
  component: AppToast,
  tags: ["autodocs"],
  argTypes: {
    message: {
      description: "トーストメッセージ",
      control: "text",
    },
    type: {
      description: "トーストタイプ",
      control: "select",
      options: ["success", "error", "warning", "info"],
    },
    timeout: {
      description: "表示時間（ミリ秒）",
      control: "number",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppToast>;

/**
 * 成功メッセージ
 */
export const Success: Story = {
  args: {
    modelValue: true,
    message: "タスクを登録しました",
    type: "success",
    timeout: 4000,
  },
};

/**
 * エラーメッセージ
 */
export const Error: Story = {
  args: {
    modelValue: true,
    message: "タスクの登録に失敗しました",
    type: "error",
    timeout: 4000,
  },
};

/**
 * 警告メッセージ
 */
export const Warning: Story = {
  args: {
    modelValue: true,
    message: "入力内容に問題があります",
    type: "warning",
    timeout: 4000,
  },
};

/**
 * 情報メッセージ
 */
export const Info: Story = {
  args: {
    modelValue: true,
    message: "データを読み込んでいます...",
    type: "info",
    timeout: 4000,
  },
};

/**
 * 全タイプの一覧
 */
export const AllTypes: Story = {
  render: () => ({
    components: { AppToast },
    setup() {
      const showSuccess = ref(false);
      const showError = ref(false);
      const showWarning = ref(false);
      const showInfo = ref(false);
      return { showSuccess, showError, showWarning, showInfo };
    },
    template: `
      <div class="d-flex flex-column ga-4">
        <v-btn color="success" @click="showSuccess = true">成功</v-btn>
        <v-btn color="error" @click="showError = true">エラー</v-btn>
        <v-btn color="warning" @click="showWarning = true">警告</v-btn>
        <v-btn color="info" @click="showInfo = true">情報</v-btn>
        
        <AppToast v-model="showSuccess" message="タスクを登録しました" type="success" />
        <AppToast v-model="showError" message="タスクの登録に失敗しました" type="error" />
        <AppToast v-model="showWarning" message="入力内容に問題があります" type="warning" />
        <AppToast v-model="showInfo" message="データを読み込んでいます..." type="info" />
      </div>
    `,
  }),
};
