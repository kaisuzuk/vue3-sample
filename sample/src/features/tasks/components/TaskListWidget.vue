<!-- ===================================
  TaskListWidget - タスク一覧 Widget
  
  責務:
  - TaskTableSection と TaskDetailSidebar を統合
  - TaskFilterDialog で絞り込み
  - useTaskList で状態管理
  - ページネーションUI
  - ページ遷移ロジック
  
  CDD での位置づけ:
  - Widget レイヤー（ロジック + UI の接続層）
=================================== -->

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskList, type TaskFilter } from '../model/useTaskList'
import { useMasterStore } from '@/features/master/model/useMasterStore'
import TaskTableSection from './TaskTableSection.vue'
import TaskDetailSidebar from './TaskDetailSidebar.vue'
import TaskFilterDialog from './TaskFilterDialog.vue'

// ===================================
// Composable
// ===================================
const router = useRouter()
const {
  tasks,
  isLoading,
  error,
  selectedTask,
  selectedTaskId,
  pagination,
  filter,
  hasFilter,
  filterCount,
  fetchTasks,
  changePage,
  changeSort,
  selectTask,
  clearSelection,
  changeLimit,
  applyFilter,
  clearFilter,
} = useTaskList()

const { workers, materials } = useMasterStore()

// サイドバー開閉
const isSidebarOpen = ref(false)

// フィルターダイアログ開閉
const isFilterDialogOpen = ref(false)

// ===================================
// Lifecycle
// ===================================
onMounted(() => {
  fetchTasks()
})

// ===================================
// Event Handlers
// ===================================

/**
 * 行クリック時
 */
function handleRowClick(taskId: string) {
  selectTask(taskId)
  isSidebarOpen.value = true
}

/**
 * ソート変更
 */
function handleSortChange(sortBy: string) {
  changeSort(sortBy)
}

/**
 * サイドバーを閉じる
 */
function handleSidebarClose() {
  isSidebarOpen.value = false
  clearSelection()
}

/**
 * 編集ページへ遷移
 */
function handleEdit(taskId: string) {
  router.push({ name: 'task-edit', params: { id: taskId } })
}

/**
 * 新規作成ページへ遷移
 */
function handleCreate() {
  router.push({ name: 'task-create' })
}

/**
 * ページ変更
 */
function handlePageChange(page: number) {
  changePage(page)
}

/**
 * 表示件数変更
 */
function handleLimitChange(limit: number) {
  changeLimit(limit)
}

/**
 * フィルターダイアログを開く
 */
function handleOpenFilter() {
  isFilterDialogOpen.value = true
}

/**
 * フィルター適用
 */
function handleApplyFilter(newFilter: TaskFilter) {
  applyFilter(newFilter)
}

/**
 * フィルタークリア
 */
function handleClearFilter() {
  clearFilter()
}
</script>

<template>
  <div class="task-list-widget">
    <!-- ヘッダー -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h2 class="text-h5">タスク一覧</h2>
        <p class="text-body-2 text-grey">
          全 {{ pagination.total }} 件
          <span v-if="hasFilter" class="ml-2">
            （絞り込み中）
          </span>
        </p>
      </div>
      <div class="d-flex ga-2">
        <!-- 絞り込みボタン -->
        <v-btn
          variant="outlined"
          :color="hasFilter ? 'primary' : undefined"
          prepend-icon="mdi-filter-variant"
          @click="handleOpenFilter"
        >
          絞り込み
          <v-badge
            v-if="filterCount > 0"
            :content="filterCount"
            color="primary"
            inline
            class="ml-1"
          />
        </v-btn>
        <!-- 新規作成ボタン -->
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="handleCreate"
        >
          新規作成
        </v-btn>
      </div>
    </div>

    <!-- フィルター適用中チップ -->
    <div v-if="hasFilter" class="mb-4">
      <v-chip
        color="primary"
        variant="tonal"
        closable
        @click:close="handleClearFilter"
      >
        <v-icon start>mdi-filter</v-icon>
        絞り込み条件をクリア
      </v-chip>
    </div>

    <!-- エラー表示 -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
    >
      データの取得に失敗しました: {{ error.message }}
    </v-alert>

    <!-- テーブル -->
    <TaskTableSection
      :tasks="tasks"
      :is-loading="isLoading"
      :selected-task-id="selectedTaskId"
      @click:row="handleRowClick"
      @update:sort="handleSortChange"
    />

    <!-- ページネーション -->
    <div class="d-flex align-center justify-space-between mt-4">
      <!-- 表示件数 -->
      <div class="d-flex align-center">
        <span class="text-body-2 text-grey mr-2">表示件数:</span>
        <v-select
          :model-value="pagination.limit"
          :items="[10, 20, 50, 100]"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 100px"
          @update:model-value="handleLimitChange"
        />
      </div>

      <!-- ページング -->
      <v-pagination
        :model-value="pagination.page"
        :length="pagination.totalPages"
        :disabled="isLoading"
        :total-visible="5"
        density="compact"
        @update:model-value="handlePageChange"
      />
    </div>

    <!-- 詳細サイドバー -->
    <TaskDetailSidebar
      :task="selectedTask"
      :is-open="isSidebarOpen"
      @close="handleSidebarClose"
      @edit="handleEdit"
    />

    <!-- フィルターダイアログ -->
    <TaskFilterDialog
      v-model="isFilterDialogOpen"
      :workers="workers"
      :materials="materials"
      :current-filter="filter"
      @apply="handleApplyFilter"
      @clear="handleClearFilter"
    />
  </div>
</template>

<style scoped>
.task-list-widget {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
