/**
 * @file Task ドメインバリデーション
 * @description
 * 純粋関数として定義された Task のバリデーションロジック。
 * UI層から独立しているため、単体テストが容易。
 *
 * @example
 * import { validateTaskForm } from '@/entities/task/validate'
 *
 * const result = validateTaskForm({
 *   workDate: '2024-01-15',
 *   workerIds: ['w001'],
 *   machineId: 'm001',
 *   materials: []
 * })
 *
 * if (!result.isValid) {
 *   console.log(result.errors)
 * }
 */

// ===================================
// Types
// ===================================

/**
 * バリデーション対象のフォーム値
 */
export interface TaskFormInput {
  workDate: string;
  workerIds: string[];
  machineId: string;
  materials: Array<{
    id: string;
    amount: number | null;
    unitId: string;
  }>;
}

/**
 * バリデーションエラー
 */
export interface TaskValidationErrors {
  workDate?: string;
  workerIds?: string;
  machineId?: string;
  materials?: string;
}

/**
 * バリデーション結果
 */
export interface TaskValidationResult {
  isValid: boolean;
  errors: TaskValidationErrors;
}

// ===================================
// Validators
// ===================================

/**
 * 作業日のバリデーション
 */
export function validateWorkDate(workDate: string): string | undefined {
  if (!workDate) {
    return "作業日は必須です";
  }
  // 日付形式チェック（YYYY-MM-DD）
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(workDate)) {
    return "作業日の形式が正しくありません";
  }
  return undefined;
}

/**
 * 作業者のバリデーション
 */
export function validateWorkers(workerIds: string[]): string | undefined {
  if (workerIds.length === 0) {
    return "作業者を1名以上選択してください";
  }
  return undefined;
}

/**
 * 使用機械のバリデーション
 */
export function validateMachine(machineId: string): string | undefined {
  if (!machineId) {
    return "使用機械を選択してください";
  }
  return undefined;
}

/**
 * 材料のバリデーション
 */
export function validateMaterials(
  materials: TaskFormInput["materials"]
): string | undefined {
  const invalidMaterial = materials.find(
    (m) => m.id && (m.amount === null || m.amount <= 0)
  );
  if (invalidMaterial) {
    return "材料の使用量は0より大きい値を入力してください";
  }
  return undefined;
}

// ===================================
// Main Validator
// ===================================

/**
 * タスクフォームのバリデーション（純粋関数）
 *
 * @param input - バリデーション対象のフォーム値
 * @returns バリデーション結果
 *
 * @description
 * この関数は純粋関数として実装されており、
 * 副作用なく同じ入力に対して常に同じ結果を返す。
 * これにより、単体テストが容易になる。
 */
export function validateTaskForm(input: TaskFormInput): TaskValidationResult {
  const errors: TaskValidationErrors = {};

  const workDateError = validateWorkDate(input.workDate);
  if (workDateError) errors.workDate = workDateError;

  const workersError = validateWorkers(input.workerIds);
  if (workersError) errors.workerIds = workersError;

  const machineError = validateMachine(input.machineId);
  if (machineError) errors.machineId = machineError;

  const materialsError = validateMaterials(input.materials);
  if (materialsError) errors.materials = materialsError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
