// ===================================
// MSW シナリオ切り替えユーティリティ
// ===================================

import type { SetupWorker } from "msw/browser";
import { mastersHandlers } from "./handlers/masters.handlers";
import {
  tasksScenarios,
  tasksScenarioDescriptions,
  defaultTaskScenario,
  type TaskScenarioId,
} from "./scenarios";

// ローカルストレージキー
const SCENARIO_STORAGE_KEY = "msw-scenario";

/**
 * 現在のシナリオを取得
 */
export function getCurrentScenario(): TaskScenarioId {
  if (typeof window === "undefined") return defaultTaskScenario;

  const stored = localStorage.getItem(SCENARIO_STORAGE_KEY);
  if (stored && stored in tasksScenarios) {
    return stored as TaskScenarioId;
  }
  return defaultTaskScenario;
}

/**
 * シナリオを保存
 */
export function saveScenario(scenarioId: TaskScenarioId): void {
  localStorage.setItem(SCENARIO_STORAGE_KEY, scenarioId);
}

/**
 * シナリオをクリア（デフォルトに戻す）
 */
export function clearScenario(): void {
  localStorage.removeItem(SCENARIO_STORAGE_KEY);
}

/**
 * 指定したシナリオの handler を取得
 */
export function getHandlersForScenario(scenarioId: TaskScenarioId) {
  const taskHandlers = tasksScenarios[scenarioId] || tasksScenarios.normal;
  return [...mastersHandlers, ...taskHandlers];
}

/**
 * シナリオを切り替え（worker を再設定）
 */
export async function switchScenario(
  worker: SetupWorker,
  scenarioId: TaskScenarioId
): Promise<void> {
  // 現在の handler をリセット
  worker.resetHandlers();

  // 新しい handler を設定
  const handlers = getHandlersForScenario(scenarioId);
  worker.use(...handlers);

  // ローカルストレージに保存
  saveScenario(scenarioId);

  console.log(`[MSW] Scenario switched to: ${scenarioId}`);
}

/**
 * シナリオ一覧を取得
 */
export function getAvailableScenarios(): {
  id: TaskScenarioId;
  description: string;
}[] {
  return Object.entries(tasksScenarioDescriptions).map(([id, description]) => ({
    id: id as TaskScenarioId,
    description,
  }));
}

// 再エクスポート
export { tasksScenarioDescriptions, defaultTaskScenario };
export type { TaskScenarioId };
