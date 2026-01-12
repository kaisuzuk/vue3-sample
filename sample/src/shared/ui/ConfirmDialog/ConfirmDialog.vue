<!-- ===================================
  ConfirmDialog - 確認ダイアログ
  
  責務:
  - 削除などの確認が必要な操作のダイアログ表示
  - 確認/キャンセルの選択
  
  Props:
  - modelValue: ダイアログ表示状態
  - title: ダイアログタイトル
  - message: 確認メッセージ
  - confirmText: 確認ボタンテキスト
  - cancelText: キャンセルボタンテキスト
  - confirmColor: 確認ボタンの色
  - loading: 処理中フラグ
  
  Events:
  - update:modelValue: ダイアログ表示状態変更
  - confirm: 確認ボタンクリック
  - cancel: キャンセルボタンクリック
=================================== -->

<script setup lang="ts">
import { computed } from 'vue'

// ===================================
// Props / Emits
// ===================================
interface Props {
  /** ダイアログ表示状態 */
  modelValue: boolean
  /** ダイアログタイトル */
  title: string
  /** 確認メッセージ */
  message: string
  /** 確認ボタンテキスト */
  confirmText?: string
  /** キャンセルボタンテキスト */
  cancelText?: string
  /** 確認ボタンの色 */
  confirmColor?: string
  /** 処理中フラグ */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '確認',
  cancelText: 'キャンセル',
  confirmColor: 'primary',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

// ===================================
// Computed
// ===================================
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// ===================================
// Events
// ===================================
function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
  isOpen.value = false
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="400"
    persistent
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ title }}
      </v-card-title>

      <v-card-text>
        {{ message }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="loading"
          @click="handleCancel"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          variant="flat"
          :loading="loading"
          :disabled="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
