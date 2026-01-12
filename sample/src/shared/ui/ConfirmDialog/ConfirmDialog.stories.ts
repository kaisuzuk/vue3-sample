import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import ConfirmDialog from "./ConfirmDialog.vue";

/**
 * ConfirmDialog - 確認ダイアログ
 *
 * 削除などの確認が必要な操作で使用する汎用ダイアログ。
 */
const meta: Meta<typeof ConfirmDialog> = {
  title: "shared/ui/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  argTypes: {
    title: {
      description: "ダイアログタイトル",
      control: "text",
    },
    message: {
      description: "確認メッセージ",
      control: "text",
    },
    confirmText: {
      description: "確認ボタンテキスト",
      control: "text",
    },
    cancelText: {
      description: "キャンセルボタンテキスト",
      control: "text",
    },
    confirmColor: {
      description: "確認ボタンの色",
      control: "select",
      options: ["primary", "error", "warning", "success"],
    },
    loading: {
      description: "処理中フラグ",
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

/**
 * 基本的な確認ダイアログ
 */
export const Default: Story = {
  args: {
    modelValue: true,
    title: "確認",
    message: "この操作を実行しますか？",
  },
};

/**
 * 削除確認ダイアログ
 */
export const DeleteConfirm: Story = {
  args: {
    modelValue: true,
    title: "タスクを削除しますか？",
    message: "この操作は取り消せません。本当に削除しますか？",
    confirmText: "削除",
    confirmColor: "error",
  },
};

/**
 * カスタムボタンテキスト
 */
export const CustomButtons: Story = {
  args: {
    modelValue: true,
    title: "変更を保存",
    message: "入力内容を保存しますか？",
    confirmText: "保存する",
    cancelText: "保存しない",
    confirmColor: "primary",
  },
};

/**
 * 処理中状態
 */
export const Loading: Story = {
  args: {
    modelValue: true,
    title: "削除中...",
    message: "タスクを削除しています。しばらくお待ちください。",
    confirmText: "削除",
    confirmColor: "error",
    loading: true,
  },
};

/**
 * インタラクティブなデモ
 */
export const Interactive: Story = {
  render: () => ({
    components: { ConfirmDialog },
    setup() {
      const isOpen = ref(false);
      const handleConfirm = () => {
        console.log("Confirmed!");
        isOpen.value = false;
      };
      return { isOpen, handleConfirm };
    },
    template: `
      <div>
        <v-btn color="error" @click="isOpen = true">削除</v-btn>
        <ConfirmDialog
          v-model="isOpen"
          title="タスクを削除しますか？"
          message="この操作は取り消せません。"
          confirm-text="削除"
          confirm-color="error"
          @confirm="handleConfirm"
        />
      </div>
    `,
  }),
};
