// ===================================
// タスク関連 MSW Handlers
// ===================================

import { http, HttpResponse, delay } from "msw";
import { tasksNormalFixture, type TaskFixture } from "../fixtures/tasks";

// インメモリデータストア（ミューテーション用）
let tasksData: TaskFixture[] = [...tasksNormalFixture];

/**
 * タスクデータをリセット（テスト用）
 */
export function resetTasksData() {
  tasksData = [...tasksNormalFixture];
}

/**
 * GET /api/tasks - タスク一覧取得
 *
 * クエリパラメータ:
 * - page: ページ番号（デフォルト: 1）
 * - limit: 1ページあたりの件数（デフォルト: 10）
 * - sortBy: ソートキー（workDate, createdAt など）
 * - sortOrder: ソート順（asc, desc）
 */
export const getTasksHandler = http.get("/api/tasks", async ({ request }) => {
  await delay(200); // 実際のAPIを模倣

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const sortBy = url.searchParams.get("sortBy") || "workDate";
  const sortOrder = url.searchParams.get("sortOrder") || "desc";

  // ソート処理
  const sortedData = [...tasksData].sort((a, b) => {
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

    const body = (await request.json()) as Omit<
      TaskFixture,
      "id" | "createdAt" | "updatedAt"
    >;
    const now = new Date().toISOString();

    const newTask: TaskFixture = {
      ...body,
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

    const body = (await request.json()) as Partial<TaskFixture>;
    const updatedTask: TaskFixture = {
      ...tasksData[taskIndex],
      ...body,
      id: tasksData[taskIndex].id, // IDは変更不可
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
