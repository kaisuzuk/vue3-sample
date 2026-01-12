<!-- ===================================
  TaskListPage - タスク一覧画面（P001）
  
  責務:
  - ルーティングのエントリーポイント
  - ページレイアウトの配置
  
  CDD での位置づけ:
  - Page レイヤー（最上位、Widget を配置）
=================================== -->

<script setup lang="ts">
import TaskListWidget from '@/features/tasks/components/TaskListWidget.vue'
</script>

<template>
  <div class="task-list-page">
    <v-container fluid class="pa-6">
      <TaskListWidget />
    </v-container>
  </div>
</template>

<style scoped>
.task-list-page {
  height: 100%;
  background-color: rgb(var(--v-theme-background));
}
</style>
