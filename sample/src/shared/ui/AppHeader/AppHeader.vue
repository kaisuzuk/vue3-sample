<!-- ===================================
  AppHeader - アプリケーションヘッダー
  
  責務:
  - ページタイトルの表示
  - 戻るボタン（オプション）
  - アクションボタンスロット
  
  Props:
  - title: ページタイトル
  - showBack: 戻るボタン表示フラグ
  
  Events:
  - back: 戻るボタンクリック時
  
  Slots:
  - actions: 右側のアクションボタン領域
=================================== -->

<script setup lang="ts">
// ===================================
// Props / Emits
// ===================================
interface Props {
  /** ページタイトル */
  title: string
  /** 戻るボタンを表示するか */
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  showBack: false,
})

const emit = defineEmits<{
  back: []
}>()

// ===================================
// Events
// ===================================
function handleBack() {
  emit('back')
}
</script>

<template>
  <header class="app-header d-flex align-center mb-6">
    <!-- 戻るボタン -->
    <v-btn
      v-if="showBack"
      icon="mdi-arrow-left"
      variant="text"
      class="mr-2"
      @click="handleBack"
    />

    <!-- タイトル -->
    <h1 class="text-h5">{{ title }}</h1>

    <v-spacer />

    <!-- アクションスロット -->
    <div class="app-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  min-height: 48px;
}

.app-header__actions {
  display: flex;
  gap: 8px;
}
</style>
