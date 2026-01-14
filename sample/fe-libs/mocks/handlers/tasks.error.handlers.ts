// ===================================
// タスク関連 異常系 Handlers
// ===================================

import { http, HttpResponse, delay } from "msw";

// ===================================
// 空データ
// ===================================

/**
 * GET /api/tasks - 空データを返す
 */
export const getTasksEmptyHandler = http.get("/api/tasks", async () => {
  await delay(200);
  return HttpResponse.json({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
});

// ===================================
// 遅延（ローディング確認用）
// ===================================

/**
 * GET /api/tasks - 3秒遅延
 */
export const getTasksDelayHandler = http.get("/api/tasks", async () => {
  await delay(3000); // 3秒遅延
  return HttpResponse.json({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
});

// ===================================
// サーバーエラー (500)
// ===================================

/**
 * GET /api/tasks - 500 エラー
 */
export const getTasksServerErrorHandler = http.get("/api/tasks", async () => {
  await delay(200);
  return HttpResponse.json(
    { message: "Internal Server Error" },
    { status: 500 }
  );
});

/**
 * POST /api/tasks - 500 エラー
 */
export const createTaskServerErrorHandler = http.post(
  "/api/tasks",
  async () => {
    await delay(200);
    return HttpResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
);

/**
 * PUT /api/tasks/:id - 500 エラー
 */
export const updateTaskServerErrorHandler = http.put(
  "/api/tasks/:id",
  async () => {
    await delay(200);
    return HttpResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
);

// ===================================
// バリデーションエラー (400)
// ===================================

/**
 * POST /api/tasks - バリデーションエラー
 */
export const createTaskValidationErrorHandler = http.post(
  "/api/tasks",
  async () => {
    await delay(200);
    return HttpResponse.json(
      {
        message: "Validation Error",
        errors: {
          workDate: "作業日は必須です",
          workerIds: "作業者を1人以上選択してください",
          machineId: "使用機械を選択してください",
        },
      },
      { status: 400 }
    );
  }
);

/**
 * PUT /api/tasks/:id - バリデーションエラー
 */
export const updateTaskValidationErrorHandler = http.put(
  "/api/tasks/:id",
  async () => {
    await delay(200);
    return HttpResponse.json(
      {
        message: "Validation Error",
        errors: {
          workDate: "作業日は必須です",
          workerIds: "作業者を1人以上選択してください",
        },
      },
      { status: 400 }
    );
  }
);

// ===================================
// ネットワークエラー
// ===================================

/**
 * GET /api/tasks - ネットワークエラー
 */
export const getTasksNetworkErrorHandler = http.get("/api/tasks", () => {
  return HttpResponse.error();
});

/**
 * POST /api/tasks - ネットワークエラー
 */
export const createTaskNetworkErrorHandler = http.post("/api/tasks", () => {
  return HttpResponse.error();
});

// ===================================
// エクスポート
// ===================================

export const tasksErrorHandlers = {
  empty: {
    getTasksEmptyHandler,
  },
  delay: {
    getTasksDelayHandler,
  },
  serverError: {
    getTasksServerErrorHandler,
    createTaskServerErrorHandler,
    updateTaskServerErrorHandler,
  },
  validationError: {
    createTaskValidationErrorHandler,
    updateTaskValidationErrorHandler,
  },
  networkError: {
    getTasksNetworkErrorHandler,
    createTaskNetworkErrorHandler,
  },
};
