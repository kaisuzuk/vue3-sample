// ===================================
// タスクフォーム Composable
// ===================================

import { ref, computed, watch } from "vue";
import type { Task, CreateTaskRequest } from "../types";
import { validateTaskForm } from "@/entities/task";

/**
 * フォームの材料入力
 */
export interface FormMaterial {
  id: string;
  amount: number | null;
  unitId: string;
}

/**
 * フォームの入力値
 */
export interface TaskFormValues {
  workDate: string;
  workerIds: string[];
  machineId: string;
  materials: FormMaterial[];
}

/**
 * フォームのエラー
 */
export interface TaskFormErrors {
  workDate?: string;
  workerIds?: string;
  machineId?: string;
  materials?: string;
  general?: string;
}

/**
 * useTaskForm のオプション
 */
export interface UseTaskFormOptions {
  /** 編集モード（trueの場合、既存タスクを編集） */
  isEditMode?: boolean;
  /** 編集対象のタスクID */
  taskId?: string;
}

/**
 * タスクフォームを管理する Composable
 *
 * 責務:
 * - フォーム入力値の管理
 * - バリデーション
 * - 登録/更新 API の呼び出し
 */
export function useTaskForm(options: UseTaskFormOptions = {}) {
  const { isEditMode = false, taskId } = options;

  // ===================================
  // State
  // ===================================

  // フォーム入力値
  const form = ref<TaskFormValues>({
    workDate: new Date().toISOString().split("T")[0], // 今日の日付
    workerIds: [],
    machineId: "",
    materials: [],
  });

  // エラー
  const errors = ref<TaskFormErrors>({});

  // UI状態
  const isSubmitting = ref(false);
  const isLoadingTask = ref(false);
  const isDirty = ref(false);
  const submitSuccess = ref(false);

  // 編集対象のタスク（編集モード時）
  const originalTask = ref<Task | null>(null);

  // ===================================
  // Computed
  // ===================================

  /**
   * フォームが有効か
   */
  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0 && isDirty.value;
  });

  /**
   * 送信可能か
   */
  const canSubmit = computed(() => {
    return !isSubmitting.value && isDirty.value;
  });

  /**
   * 材料が追加されているか
   */
  const hasMaterials = computed(() => {
    return form.value.materials.length > 0;
  });

  /**
   * API リクエスト用データ
   */
  const requestData = computed<CreateTaskRequest>(() => ({
    workDate: form.value.workDate,
    workerIds: form.value.workerIds,
    machineId: form.value.machineId,
    materials: form.value.materials
      .filter((m) => m.id && m.amount !== null && m.amount > 0)
      .map((m) => ({
        id: m.id,
        amount: m.amount as number,
        unitId: m.unitId,
      })),
  }));

  // ===================================
  // Actions
  // ===================================

  /**
   * フォームをリセット
   */
  function resetForm() {
    form.value = {
      workDate: new Date().toISOString().split("T")[0],
      workerIds: [],
      machineId: "",
      materials: [],
    };
    errors.value = {};
    isDirty.value = false;
    submitSuccess.value = false;
  }

  /**
   * タスクデータからフォームを初期化（編集モード用）
   */
  function initializeFromTask(task: Task) {
    originalTask.value = task;
    form.value = {
      workDate: task.workDate,
      workerIds: task.workers.map((w) => w.id),
      machineId: task.machine?.id ?? "",
      materials: task.materials.map((m) => ({
        id: m.id,
        amount: m.amount,
        unitId: m.unitId,
      })),
    };
    isDirty.value = false;
  }

  /**
   * 編集対象のタスクを取得
   */
  async function fetchTask(id: string) {
    isLoadingTask.value = true;
    errors.value = {};

    try {
      const response = await fetch(`/api/tasks/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("タスクが見つかりません");
        }
        throw new Error(`HTTP error: ${response.status}`);
      }

      const task: Task = await response.json();
      initializeFromTask(task);
      return task;
    } catch (e) {
      errors.value.general =
        e instanceof Error ? e.message : "タスクの取得に失敗しました";
      throw e;
    } finally {
      isLoadingTask.value = false;
    }
  }

  /**
   * バリデーション実行
   * @description entities/task/validate の純粋関数を利用
   */
  function validate(): boolean {
    const result = validateTaskForm({
      workDate: form.value.workDate,
      workerIds: form.value.workerIds,
      machineId: form.value.machineId,
      materials: form.value.materials,
    });

    errors.value = result.errors as TaskFormErrors;
    return result.isValid;
  }

  /**
   * 材料を追加
   */
  function addMaterial() {
    form.value.materials.push({
      id: "",
      amount: null,
      unitId: "",
    });
  }

  /**
   * 材料を削除
   */
  function removeMaterial(index: number) {
    form.value.materials.splice(index, 1);
  }

  /**
   * 材料の単位を更新（材料選択時に自動設定）
   */
  function updateMaterialUnit(index: number, unitId: string) {
    if (form.value.materials[index]) {
      form.value.materials[index].unitId = unitId;
    }
  }

  /**
   * フォーム送信（新規作成）
   */
  async function createTask(): Promise<Task | null> {
    if (!validate()) {
      return null;
    }

    isSubmitting.value = true;
    errors.value = {};

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData.value),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error: ${response.status}`);
      }

      const task: Task = await response.json();
      submitSuccess.value = true;
      isDirty.value = false;
      return task;
    } catch (e) {
      errors.value.general =
        e instanceof Error ? e.message : "登録に失敗しました";
      return null;
    } finally {
      isSubmitting.value = false;
    }
  }

  /**
   * フォーム送信（更新）
   */
  async function updateTask(): Promise<Task | null> {
    if (!taskId) {
      errors.value.general = "タスクIDが指定されていません";
      return null;
    }

    if (!validate()) {
      return null;
    }

    isSubmitting.value = true;
    errors.value = {};

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData.value),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error: ${response.status}`);
      }

      const task: Task = await response.json();
      submitSuccess.value = true;
      isDirty.value = false;
      originalTask.value = task;
      return task;
    } catch (e) {
      errors.value.general =
        e instanceof Error ? e.message : "更新に失敗しました";
      return null;
    } finally {
      isSubmitting.value = false;
    }
  }

  /**
   * フォーム送信（モードに応じて自動選択）
   */
  async function submit(): Promise<Task | null> {
    if (isEditMode) {
      return updateTask();
    } else {
      return createTask();
    }
  }

  // ===================================
  // Watchers
  // ===================================

  // フォーム変更を監視して isDirty を更新
  watch(
    form,
    () => {
      isDirty.value = true;
      // 入力時にエラーをクリア（UX向上）
      if (Object.keys(errors.value).length > 0) {
        errors.value = {};
      }
    },
    { deep: true }
  );

  // ===================================
  // Return
  // ===================================

  return {
    // State
    form,
    errors,
    isSubmitting,
    isLoadingTask,
    isDirty,
    submitSuccess,
    originalTask,

    // Computed
    isValid,
    canSubmit,
    hasMaterials,
    requestData,

    // Options
    isEditMode,
    taskId,

    // Actions
    resetForm,
    initializeFromTask,
    fetchTask,
    validate,
    addMaterial,
    removeMaterial,
    updateMaterialUnit,
    createTask,
    updateTask,
    submit,
  };
}

/**
 * useTaskForm の戻り値型
 */
export type UseTaskForm = ReturnType<typeof useTaskForm>;
