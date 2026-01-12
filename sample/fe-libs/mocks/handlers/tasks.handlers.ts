// ===================================
// タスク関連 MSW Handlers（Phase 2 以降で実装）
// ===================================

import { http, HttpResponse } from "msw";

/**
 * GET /api/tasks - タスク一覧取得（仮実装）
 */
export const getTasksHandler = http.get("/api/tasks", () => {
  return HttpResponse.json({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
});

/**
 * GET /api/tasks/:id - タスク詳細取得（仮実装）
 */
export const getTaskHandler = http.get("/api/tasks/:id", () => {
  return HttpResponse.json({ message: "Not Found" }, { status: 404 });
});

/**
 * POST /api/tasks - タスク登録（仮実装）
 */
export const createTaskHandler = http.post("/api/tasks", () => {
  return HttpResponse.json({ message: "Not Implemented" }, { status: 501 });
});

/**
 * PUT /api/tasks/:id - タスク更新（仮実装）
 */
export const updateTaskHandler = http.put("/api/tasks/:id", () => {
  return HttpResponse.json({ message: "Not Implemented" }, { status: 501 });
});

/**
 * DELETE /api/tasks/:id - タスク削除（仮実装）
 */
export const deleteTaskHandler = http.delete("/api/tasks/:id", () => {
  return new HttpResponse(null, { status: 204 });
});

// Handler のエクスポート
export const tasksHandlers = [
  getTasksHandler,
  getTaskHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
];
