// ===================================
// タスク API シナリオ定義
// ===================================
// シナリオ = handler のセット
// 切り替えロジックはここに書かない
// ===================================

import {
  getTasksHandler,
  getTaskHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from "../handlers/tasks.handlers";

import {
  getTasksEmptyHandler,
  getTasksDelayHandler,
  getTasksServerErrorHandler,
  createTaskServerErrorHandler,
  updateTaskServerErrorHandler,
  createTaskValidationErrorHandler,
  updateTaskValidationErrorHandler,
  getTasksNetworkErrorHandler,
  createTaskNetworkErrorHandler,
} from "../handlers/tasks.error.handlers";

/**
 * シナリオ ID の型
 */
export type TaskScenarioId =
  | "normal"
  | "empty"
  | "delay"
  | "serverError"
  | "createValidationError"
  | "networkError";

/**
 * シナリオ定義
 */
export const tasksScenarios = {
  /**
   * 正常系（デフォルト）
   * - 一覧取得: 正常データ
   * - CRUD: すべて正常動作
   */
  normal: [
    getTasksHandler,
    getTaskHandler,
    createTaskHandler,
    updateTaskHandler,
    deleteTaskHandler,
  ],

  /**
   * 空データ
   * - 一覧取得: 0件
   * - その他: 正常動作
   */
  empty: [
    getTasksEmptyHandler,
    getTaskHandler,
    createTaskHandler,
    updateTaskHandler,
    deleteTaskHandler,
  ],

  /**
   * 遅延（ローディング確認用）
   * - 一覧取得: 3秒遅延
   * - その他: 正常動作
   */
  delay: [
    getTasksDelayHandler,
    getTaskHandler,
    createTaskHandler,
    updateTaskHandler,
    deleteTaskHandler,
  ],

  /**
   * サーバーエラー
   * - 一覧取得: 500エラー
   * - 登録: 500エラー
   * - 更新: 500エラー
   * - その他: 正常動作
   */
  serverError: [
    getTasksServerErrorHandler,
    getTaskHandler,
    createTaskServerErrorHandler,
    updateTaskServerErrorHandler,
    deleteTaskHandler,
  ],

  /**
   * 登録時バリデーションエラー
   * - 一覧取得: 正常
   * - 登録: 400エラー
   * - 更新: 400エラー
   * - その他: 正常動作
   */
  createValidationError: [
    getTasksHandler,
    getTaskHandler,
    createTaskValidationErrorHandler,
    updateTaskValidationErrorHandler,
    deleteTaskHandler,
  ],

  /**
   * ネットワークエラー
   * - 一覧取得: ネットワークエラー
   * - 登録: ネットワークエラー
   * - その他: 正常動作
   */
  networkError: [
    getTasksNetworkErrorHandler,
    getTaskHandler,
    createTaskNetworkErrorHandler,
    updateTaskHandler,
    deleteTaskHandler,
  ],
} as const;

/**
 * シナリオの説明
 */
export const tasksScenarioDescriptions: Record<TaskScenarioId, string> = {
  normal: "正常系（デフォルト）",
  empty: "空データ（0件）",
  delay: "3秒遅延（ローディング確認）",
  serverError: "サーバーエラー（500）",
  createValidationError: "バリデーションエラー（400）",
  networkError: "ネットワークエラー",
};

/**
 * デフォルトシナリオ
 */
export const defaultTaskScenario: TaskScenarioId = "normal";
