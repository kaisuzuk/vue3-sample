<!-- ===================================
  TaskEditPage - タスク編集画面（P003）
  
  責務:
  - ルーティングのエントリーポイント
  - ページレイアウトの配置
  - タスクIDの取得
=================================== -->

<script setup lang="ts">
import { useRoute } from 'vue-router'
import TaskFormWidget from '@/features/tasks/components/TaskFormWidget.vue'

const route = useRoute()
const taskId = route.params.id as string
</script>

<template>
  <div class="task-edit-page">
    <v-container class="pa-6">
      <TaskFormWidget mode="edit" :task-id="taskId" />
    </v-container>
  </div>
</template>

<style scoped>
.task-edit-page {
  height: 100%;
  background-color: rgb(var(--v-theme-background));
}
</style>
