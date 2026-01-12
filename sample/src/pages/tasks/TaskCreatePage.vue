<!-- ===================================
  TaskCreatePage - タスク新規登録画面（P002）
  
  責務:
  - ルーティングのエントリーポイント
  - ページレイアウトの配置
=================================== -->

<script setup lang="ts">
import { TaskFormWidget } from '@/widgets/tasks'
</script>

<template>
  <div class="task-create-page">
    <v-container class="pa-6">
      <TaskFormWidget mode="create" />
    </v-container>
  </div>
</template>

<style scoped>
.task-create-page {
  height: 100%;
  background-color: rgb(var(--v-theme-background));
}
</style>
