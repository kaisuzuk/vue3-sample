/**
 * @file Task DTO Types
 * @description
 * タスク関連のAPIリクエスト/レスポンス型定義
 * Vue2/Vue3で共通利用可能
 */

// ===================================
// ドメインモデル
// ===================================

/** タスクに紐づく作業者 */
export interface TaskWorker {
  /** 作業者ID（作業者マスタの参照） */
  id: string;
  /** 作業者名 */
  name: string;
}

/** タスクに紐づく機械 */
export interface TaskMachine {
  /** 機械ID（機械マスタの参照） */
  id: string;
  /** 機械名 */
  name: string;
}

/** タスクに紐づく材料 */
export interface TaskMaterial {
  /** 材料ID（材料マスタの参照） */
  id: string;
  /** 材料名 */
  name: string;
  /** 使用量 */
  amount: number;
  /** 単位ID（単位マスタの参照） */
  unitId: string;
  /** 単位名 */
  unitName: string;
}

/** タスク */
export interface Task {
  /** タスクID */
  id: string;
  /** 作業日（ISO 8601形式） */
  workDate: string;
  /** 作業者リスト */
  workers: TaskWorker[];
  /** 利用機械 */
  machine: TaskMachine;
  /** 利用材料リスト */
  materials: TaskMaterial[];
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}

// ===================================
// APIリクエスト型
// ===================================

/** タスク一覧取得クエリパラメータ */
export interface TaskListQuery {
  page?: number;
  limit?: number;
  workDateFrom?: string;
  workDateTo?: string;
  workerIds?: string;
  materialIds?: string;
}

/** タスク登録リクエストの材料 */
export interface CreateTaskMaterial {
  id: string;
  amount: number;
  unitId: string;
}

/** タスク登録リクエスト */
export interface CreateTaskRequest {
  workDate: string;
  workerIds: string[];
  machineId: string;
  materials: CreateTaskMaterial[];
}

/** タスク更新リクエスト */
export interface UpdateTaskRequest {
  workDate: string;
  workerIds: string[];
  machineId: string;
  materials: CreateTaskMaterial[];
}

// ===================================
// APIレスポンス型
// ===================================

/** タスク一覧レスポンス */
export interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** タスク詳細レスポンス */
export interface TaskDetailResponse {
  task: Task;
}

/** タスク登録レスポンス */
export interface CreateTaskResponse {
  task: Task;
}

/** タスク更新レスポンス */
export interface UpdateTaskResponse {
  task: Task;
}

// ===================================
// エラー型
// ===================================

/** エラーレスポンス */
export interface ErrorResponse {
  message: string;
}

/** バリデーションエラーレスポンス */
export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string>;
}
