<!-- ===================================
  TaskTableSection - タスク一覧テーブル
  
  責務:
  - タスクデータをテーブル形式で表示
  - ソート機能の提供
  - 行クリックで選択イベント発火
  
  Props:
  - tasks: タスク配列
  - isLoading: ローディング状態
  - selectedTaskId: 選択中のタスクID
  - sortBy: ソートキー
  - sortOrder: ソート順
  
  Events:
  - click:row: 行クリック時（taskId）
  - update:sort: ソート変更時（sortBy）
=================================== -->

<script setup lang="ts">
import type { Task } from '../types'

// ===================================
// Props / Emits
// ===================================
interface Props {
  tasks: Task[]
  isLoading?: boolean
  selectedTaskId?: string | null
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  selectedTaskId: null,
  sortBy: 'workDate',
  sortOrder: 'desc',
})

const emit = defineEmits<{
  'click:row': [taskId: string]
  'update:sort': [sortBy: string]
}>()

// ===================================
// テーブル列定義
// ===================================
const headers = [
  {
    title: '作業日',
    key: 'workDate',
    sortable: true,
    width: '120px',
  },
  {
    title: '作業者',
    key: 'workers',
    sortable: false,
  },
  {
    title: '使用機械',
    key: 'machine',
    sortable: false,
  },
  {
    title: '使用材料',
    key: 'materials',
    sortable: false,
  },
  {
    title: '作成日時',
    key: 'createdAt',
    sortable: true,
    width: '160px',
  },
]

// ===================================
// Computed
// ===================================

/**
 * 作業者名をカンマ区切りで表示
 */
function formatWorkers(workers: Task['workers']): string {
  if (!workers || workers.length === 0) return '-'
  return workers.map((w) => w.name).join(', ')
}

/**
 * 機械名を表示
 */
function formatMachine(machine: Task['machine']): string {
  return machine?.name || '-'
}

/**
 * 材料をカンマ区切りで表示（最大3件）
 */
function formatMaterials(materials: Task['materials']): string {
  if (!materials || materials.length === 0) return '-'
  const names = materials.slice(0, 3).map((m) => m.name)
  if (materials.length > 3) {
    names.push(`他${materials.length - 3}件`)
  }
  return names.join(', ')
}

/**
 * 日時をフォーマット
 */
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

/**
 * 日付をフォーマット
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * ソートアイコンを取得
 */
function getSortIcon(key: string): string {
  if (props.sortBy !== key) return 'mdi-unfold-more-horizontal'
  return props.sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'
}

// ===================================
// Events
// ===================================

function handleRowClick(task: Task) {
  emit('click:row', task.id)
}

function handleSort(key: string) {
  emit('update:sort', key)
}
</script>

<template>
  <v-table
    hover
    class="task-table"
    :loading="isLoading"
  >
    <thead>
      <tr>
        <th
          v-for="header in headers"
          :key="header.key"
          :style="header.width ? { width: header.width } : {}"
          :class="{ sortable: header.sortable }"
          @click="header.sortable && handleSort(header.key)"
        >
          <div class="d-flex align-center">
            {{ header.title }}
            <v-icon
              v-if="header.sortable"
              :icon="getSortIcon(header.key)"
              size="small"
              class="ml-1"
            />
          </div>
        </th>
      </tr>
    </thead>

    <tbody>
      <!-- ローディング -->
      <tr v-if="isLoading">
        <td :colspan="headers.length" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
          <div class="mt-2 text-grey">読み込み中...</div>
        </td>
      </tr>

      <!-- データなし -->
      <tr v-else-if="tasks.length === 0">
        <td :colspan="headers.length" class="text-center py-8 text-grey">
          <v-icon icon="mdi-clipboard-text-off" size="48" class="mb-2" />
          <div>タスクがありません</div>
        </td>
      </tr>

      <!-- データ行 -->
      <template v-else>
        <tr
          v-for="task in tasks"
          :key="task.id"
          :class="{
            'selected-row': selectedTaskId === task.id,
            'cursor-pointer': true,
          }"
          @click="handleRowClick(task)"
        >
          <td>{{ formatDate(task.workDate) }}</td>
          <td>{{ formatWorkers(task.workers) }}</td>
          <td>{{ formatMachine(task.machine) }}</td>
          <td>{{ formatMaterials(task.materials) }}</td>
          <td>{{ formatDateTime(task.createdAt) }}</td>
        </tr>
      </template>
    </tbody>
  </v-table>
</template>

<style scoped>
.task-table {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}

.task-table thead th {
  background-color: rgb(var(--v-theme-surface));
  font-weight: 600;
  white-space: nowrap;
}

.task-table thead th.sortable {
  cursor: pointer;
}

.task-table thead th.sortable:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.selected-row {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
