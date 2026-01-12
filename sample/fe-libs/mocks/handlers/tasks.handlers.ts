// ===================================
// タスク関連 MSW Handlers
// ===================================

import { http, HttpResponse, delay } from "msw";
import { tasksNormalFixture, type TaskFixture } from "../fixtures/tasks";
import { workersFixture } from "../fixtures/masters/workers";
import { machinesFixture } from "../fixtures/masters/machines";
import { materialsFixture } from "../fixtures/masters/materials";
import { unitsFixture } from "../fixtures/masters/units";

// インメモリデータストア（ミューテーション用）
let tasksData: TaskFixture[] = [...tasksNormalFixture];

/**
 * タスクデータをリセット（テスト用）
 */
export function resetTasksData() {
  tasksData = [...tasksNormalFixture];
}

/**
 * タスク登録/更新リクエストボディの型
 */
interface TaskRequestBody {
  workDate: string;
  workerIds: string[];
  machineId: string;
  materials: { id: string; amount: number; unitId: string }[];
}

/**
 * リクエストからTaskFixture形式に変換
 */
function convertRequestToTask(
  body: TaskRequestBody
): Omit<TaskFixture, "id" | "createdAt" | "updatedAt"> {
  // 作業者IDから作業者情報を取得
  const workers = body.workerIds
    .map((id) => {
      const worker = workersFixture.find((w) => w.id === id);
      return worker ? { id: worker.id, name: worker.name } : null;
    })
    .filter((w): w is { id: string; name: string } => w !== null);

  // 機械IDから機械情報を取得
  const machineData = machinesFixture.find((m) => m.id === body.machineId);
  const machine = machineData
    ? { id: machineData.id, name: machineData.name }
    : { id: body.machineId, name: "" };

  // 材料IDから材料情報を取得
  const materials = body.materials
    .map((m) => {
      const materialData = materialsFixture.find((mat) => mat.id === m.id);
      const unitData = unitsFixture.find((u) => u.id === m.unitId);
      if (!materialData) return null;
      return {
        id: materialData.id,
        name: materialData.name,
        amount: m.amount,
        unitId: m.unitId,
        unitName: unitData?.name || "",
      };
    })
    .filter((m): m is TaskFixture["materials"][0] => m !== null);

  return {
    workDate: body.workDate,
    workers,
    machine,
    materials,
  };
}

/**
 * GET /api/tasks - タスク一覧取得
 *
 * クエリパラメータ:
 * - page: ページ番号（デフォルト: 1）
 * - limit: 1ページあたりの件数（デフォルト: 10）
 * - sortBy: ソートキー（workDate, createdAt など）
 * - sortOrder: ソート順（asc, desc）
 * - workDateFrom: 作業日開始（YYYY-MM-DD）
 * - workDateTo: 作業日終了（YYYY-MM-DD）
 * - workerIds: 作業者ID（カンマ区切り）
 * - materialIds: 材料ID（カンマ区切り）
 */
export const getTasksHandler = http.get("/api/tasks", async ({ request }) => {
  await delay(200); // 実際のAPIを模倣

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const sortBy = url.searchParams.get("sortBy") || "workDate";
  const sortOrder = url.searchParams.get("sortOrder") || "desc";

  // フィルター条件
  const workDateFrom = url.searchParams.get("workDateFrom");
  const workDateTo = url.searchParams.get("workDateTo");
  const workerIdsParam = url.searchParams.get("workerIds");
  const materialIdsParam = url.searchParams.get("materialIds");

  const workerIds = workerIdsParam ? workerIdsParam.split(",") : [];
  const materialIds = materialIdsParam ? materialIdsParam.split(",") : [];

  // フィルター処理
  let filteredData = [...tasksData];

  // 作業日範囲フィルター
  if (workDateFrom) {
    filteredData = filteredData.filter((t) => t.workDate >= workDateFrom);
  }
  if (workDateTo) {
    filteredData = filteredData.filter((t) => t.workDate <= workDateTo);
  }

  // 作業者フィルター（指定された作業者のいずれかが含まれているタスク）
  if (workerIds.length > 0) {
    filteredData = filteredData.filter((t) =>
      t.workers.some((w) => workerIds.includes(w.id))
    );
  }

  // 材料フィルター（指定された材料のいずれかが含まれているタスク）
  if (materialIds.length > 0) {
    filteredData = filteredData.filter((t) =>
      t.materials.some((m) => materialIds.includes(m.id))
    );
  }

  // ソート処理
  const sortedData = filteredData.sort((a, b) => {
    let aVal: string | number = "";
    let bVal: string | number = "";

    if (sortBy === "workDate") {
      aVal = a.workDate;
      bVal = b.workDate;
    } else if (sortBy === "createdAt") {
      aVal = a.createdAt;
      bVal = b.createdAt;
    } else if (sortBy === "updatedAt") {
      aVal = a.updatedAt;
      bVal = b.updatedAt;
    }

    if (sortOrder === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  // ページネーション
  const total = sortedData.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const items = sortedData.slice(startIndex, startIndex + limit);

  return HttpResponse.json({
    items,
    total,
    page,
    limit,
    totalPages,
  });
});

/**
 * GET /api/tasks/:id - タスク詳細取得
 */
export const getTaskHandler = http.get("/api/tasks/:id", async ({ params }) => {
  await delay(100);

  const { id } = params;
  const task = tasksData.find((t) => t.id === id);

  if (!task) {
    return HttpResponse.json({ message: "Task not found" }, { status: 404 });
  }

  return HttpResponse.json(task);
});

/**
 * POST /api/tasks - タスク登録
 */
export const createTaskHandler = http.post(
  "/api/tasks",
  async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as TaskRequestBody;
    const now = new Date().toISOString();

    // IDからマスタ情報を参照して変換
    const taskData = convertRequestToTask(body);

    const newTask: TaskFixture = {
      ...taskData,
      id: `t${String(tasksData.length + 1).padStart(3, "0")}`,
      createdAt: now,
      updatedAt: now,
    };

    tasksData.push(newTask);

    return HttpResponse.json(newTask, { status: 201 });
  }
);

/**
 * PUT /api/tasks/:id - タスク更新
 */
export const updateTaskHandler = http.put(
  "/api/tasks/:id",
  async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const taskIndex = tasksData.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return HttpResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const body = (await request.json()) as TaskRequestBody;

    // IDからマスタ情報を参照して変換
    const taskData = convertRequestToTask(body);

    const updatedTask: TaskFixture = {
      ...taskData,
      id: tasksData[taskIndex].id, // IDは変更不可
      createdAt: tasksData[taskIndex].createdAt, // 作成日時は変更不可
      updatedAt: new Date().toISOString(),
    };

    tasksData[taskIndex] = updatedTask;

    return HttpResponse.json(updatedTask);
  }
);

/**
 * DELETE /api/tasks/:id - タスク削除
 */
export const deleteTaskHandler = http.delete(
  "/api/tasks/:id",
  async ({ params }) => {
    await delay(200);

    const { id } = params;
    const taskIndex = tasksData.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return HttpResponse.json({ message: "Task not found" }, { status: 404 });
    }

    tasksData.splice(taskIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }
);

// Handler のエクスポート
export const tasksHandlers = [
  getTasksHandler,
  getTaskHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
];
