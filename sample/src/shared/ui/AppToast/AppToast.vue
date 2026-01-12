<!-- ===================================
  AppToast - トースト通知コンポーネント
  
  責務:
  - 成功/エラー/情報などのトースト通知表示
  - 自動消去
  
  使用方法:
  - useAppToast() Composable と組み合わせて使用
=================================== -->

<script setup lang="ts">
import { computed } from 'vue'

// ===================================
// Props / Emits
// ===================================
interface Props {
  /** 表示状態 */
  modelValue: boolean
  /** メッセージ */
  message: string
  /** トーストタイプ */
  type?: 'success' | 'error' | 'warning' | 'info'
  /** 表示時間（ミリ秒） */
  timeout?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  timeout: 4000,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// ===================================
// Computed
// ===================================
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const color = computed(() => {
  switch (props.type) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
    default:
      return 'info'
  }
})

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    case 'info':
    default:
      return 'mdi-information'
  }
})
</script>

<template>
  <v-snackbar
    v-model="isOpen"
    :timeout="timeout"
    :color="color"
    location="top"
  >
    <div class="d-flex align-center">
      <v-icon :icon="icon" class="mr-2" />
      {{ message }}
    </div>

    <template #actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        size="small"
        @click="isOpen = false"
      />
    </template>
  </v-snackbar>
</template>
