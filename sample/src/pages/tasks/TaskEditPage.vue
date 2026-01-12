<script setup lang="ts">
import { useRoute } from 'vue-router'

// タスク編集画面（P003）
// 責務: ルーティング受け、初期データ取得、レイアウト配置

const route = useRoute()
const taskId = route.params.id as string
</script>

<template>
  <div class="task-edit-page">
    <v-container>
      <h1>タスク編集</h1>
      <p>タスクID: {{ taskId }}</p>
      <p>（Phase 5 で実装予定）</p>
    </v-container>
  </div>
</template>

<style scoped>
.task-edit-page {
  height: 100%;
}
</style>
