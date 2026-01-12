// ===================================
// タスク一覧 Composable
// ===================================

import { ref, computed, watch } from "vue";
import type { Task, TaskListQuery, TaskListResponse } from "../types";

/**
 * タスク一覧を管理する Composable
 *
 * 責務:
 * - タスク一覧データの取得
 * - ページネーション状態管理
 * - ソート状態管理
 * - 選択タスク状態管理
 */
export function useTaskList() {
  // ===================================
  // State
  // ===================================
  const tasks = ref<Task[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const selectedTaskId = ref<string | null>(null);

  // ページネーション
  const page = ref(1);
  const limit = ref(10);
  const total = ref(0);
  const totalPages = ref(0);

  // ソート
  const sortBy = ref<string>("workDate");
  const sortOrder = ref<"asc" | "desc">("desc");

  // ===================================
  // Computed
  // ===================================

  /**
   * 現在選択中のタスク
   */
  const selectedTask = computed(() => {
    if (!selectedTaskId.value) return null;
    return tasks.value.find((t) => t.id === selectedTaskId.value) || null;
  });

  /**
   * API クエリパラメータ
   */
  const query = computed<TaskListQuery>(() => ({
    page: page.value,
    limit: limit.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  }));

  /**
   * ページネーション情報
   */
  const pagination = computed(() => ({
    page: page.value,
    limit: limit.value,
    total: total.value,
    totalPages: totalPages.value,
    hasNext: page.value < totalPages.value,
    hasPrev: page.value > 1,
  }));

  // ===================================
  // Actions
  // ===================================

  /**
   * タスク一覧を取得
   */
  async function fetchTasks() {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({
        page: String(page.value),
        limit: String(limit.value),
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
      });

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data: TaskListResponse = await response.json();

      tasks.value = data.items;
      total.value = data.total;
      totalPages.value = data.totalPages;
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      tasks.value = [];
      total.value = 0;
      totalPages.value = 0;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ページ変更
   */
  function changePage(newPage: number) {
    if (newPage < 1 || newPage > totalPages.value) return;
    page.value = newPage;
    // 選択をクリア
    selectedTaskId.value = null;
  }

  /**
   * 次ページへ
   */
  function nextPage() {
    if (page.value < totalPages.value) {
      changePage(page.value + 1);
    }
  }

  /**
   * 前ページへ
   */
  function prevPage() {
    if (page.value > 1) {
      changePage(page.value - 1);
    }
  }

  /**
   * ソート変更
   */
  function changeSort(newSortBy: string) {
    if (sortBy.value === newSortBy) {
      // 同じカラムなら順序を反転
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      sortBy.value = newSortBy;
      sortOrder.value = "desc";
    }
    // ページを1に戻す
    page.value = 1;
    selectedTaskId.value = null;
  }

  /**
   * タスクを選択
   */
  function selectTask(taskId: string | null) {
    selectedTaskId.value = taskId;
  }

  /**
   * 選択をクリア
   */
  function clearSelection() {
    selectedTaskId.value = null;
  }

  /**
   * 表示件数を変更
   */
  function changeLimit(newLimit: number) {
    limit.value = newLimit;
    page.value = 1;
    selectedTaskId.value = null;
  }

  // ===================================
  // Watchers
  // ===================================

  // ページ/ソート変更時に自動取得
  watch([page, sortBy, sortOrder, limit], () => {
    fetchTasks();
  });

  // ===================================
  // Return
  // ===================================

  return {
    // State
    tasks,
    isLoading,
    error,
    selectedTaskId,

    // Computed
    selectedTask,
    query,
    pagination,

    // Actions
    fetchTasks,
    changePage,
    nextPage,
    prevPage,
    changeSort,
    selectTask,
    clearSelection,
    changeLimit,
  };
}

/**
 * useTaskList の戻り値型
 */
export type UseTaskList = ReturnType<typeof useTaskList>;
