<!-- ===================================
  TaskDetailSidebar - タスク詳細サイドバー
  
  責務:
  - 選択されたタスクの詳細情報を表示
  - 編集ボタンから編集ページへ遷移
  
  Props:
  - task: 表示するタスク
  - isOpen: サイドバー表示状態
  
  Events:
  - close: 閉じるボタンクリック時
  - edit: 編集ボタンクリック時（taskId）
=================================== -->

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../types'

// ===================================
// Props / Emits
// ===================================
interface Props {
  task: Task | null
  isOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
})

const emit = defineEmits<{
  close: []
  edit: [taskId: string]
}>()

// ===================================
// Computed
// ===================================

/**
 * 作業日をフォーマット
 */
const formattedWorkDate = computed(() => {
  if (!props.task) return ''
  const date = new Date(props.task.workDate)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
})

/**
 * 作成日時をフォーマット
 */
const formattedCreatedAt = computed(() => {
  if (!props.task) return ''
  return formatDateTime(props.task.createdAt)
})

/**
 * 更新日時をフォーマット
 */
const formattedUpdatedAt = computed(() => {
  if (!props.task) return ''
  return formatDateTime(props.task.updatedAt)
})

function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ===================================
// Events
// ===================================

function handleClose() {
  emit('close')
}

function handleEdit() {
  if (props.task) {
    emit('edit', props.task.id)
  }
}
</script>

<template>
  <v-navigation-drawer
    :model-value="isOpen && !!task"
    location="right"
    width="400"
    temporary
    @update:model-value="!$event && handleClose()"
  >
    <template v-if="task" #default>
      <!-- ヘッダー -->
      <v-toolbar density="compact" color="transparent">
        <v-toolbar-title class="text-subtitle-1">タスク詳細</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="handleClose" />
      </v-toolbar>

      <v-divider />

      <!-- コンテンツ -->
      <div class="pa-4">
        <!-- 作業日 -->
        <section class="mb-6">
          <h3 class="text-subtitle-2 text-grey mb-2">
            <v-icon icon="mdi-calendar" size="small" class="mr-1" />
            作業日
          </h3>
          <p class="text-body-1">{{ formattedWorkDate }}</p>
        </section>

        <!-- 作業者 -->
        <section class="mb-6">
          <h3 class="text-subtitle-2 text-grey mb-2">
            <v-icon icon="mdi-account-group" size="small" class="mr-1" />
            作業者（{{ task.workers.length }}名）
          </h3>
          <v-chip-group>
            <v-chip
              v-for="worker in task.workers"
              :key="worker.id"
              size="small"
              variant="outlined"
            >
              {{ worker.name }}
            </v-chip>
          </v-chip-group>
          <p v-if="task.workers.length === 0" class="text-body-2 text-grey">
            作業者なし
          </p>
        </section>

        <!-- 使用機械 -->
        <section class="mb-6">
          <h3 class="text-subtitle-2 text-grey mb-2">
            <v-icon icon="mdi-cog" size="small" class="mr-1" />
            使用機械
          </h3>
          <v-chip v-if="task.machine" color="primary" variant="tonal">
            {{ task.machine.name }}
          </v-chip>
          <p v-else class="text-body-2 text-grey">機械なし</p>
        </section>

        <!-- 使用材料 -->
        <section class="mb-6">
          <h3 class="text-subtitle-2 text-grey mb-2">
            <v-icon icon="mdi-package-variant" size="small" class="mr-1" />
            使用材料（{{ task.materials.length }}件）
          </h3>
          <v-list
            v-if="task.materials.length > 0"
            density="compact"
            class="bg-transparent"
          >
            <v-list-item
              v-for="material in task.materials"
              :key="material.id"
              class="px-0"
            >
              <v-list-item-title>{{ material.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ material.amount }} {{ material.unitName }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <p v-else class="text-body-2 text-grey">材料なし</p>
        </section>

        <v-divider class="mb-4" />

        <!-- タイムスタンプ -->
        <section class="text-caption text-grey">
          <div class="d-flex justify-space-between mb-1">
            <span>作成日時:</span>
            <span>{{ formattedCreatedAt }}</span>
          </div>
          <div class="d-flex justify-space-between">
            <span>更新日時:</span>
            <span>{{ formattedUpdatedAt }}</span>
          </div>
        </section>
      </div>
    </template>

    <!-- フッター -->
    <template v-if="task" #append>
      <v-divider />
      <div class="pa-4">
        <v-btn
          color="primary"
          block
          variant="elevated"
          prepend-icon="mdi-pencil"
          @click="handleEdit"
        >
          編集する
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
section h3 {
  display: flex;
  align-items: center;
}
</style>
