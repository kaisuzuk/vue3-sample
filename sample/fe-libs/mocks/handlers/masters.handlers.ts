// ===================================
// マスタ関連 MSW Handlers
// ===================================

import { http, HttpResponse } from "msw";
import {
  workersFixture,
  workersVersion,
  machinesFixture,
  machinesVersion,
  materialsFixture,
  materialsVersion,
  unitsFixture,
  unitsVersion,
} from "../fixtures/masters";

/**
 * GET /api/masters - 全マスタ取得
 */
export const getMastersHandler = http.get("/api/masters", () => {
  return HttpResponse.json({
    workers: workersFixture,
    machines: machinesFixture,
    materials: materialsFixture,
    units: unitsFixture,
    versions: {
      workers: workersVersion,
      machines: machinesVersion,
      materials: materialsVersion,
      units: unitsVersion,
    },
  });
});

/**
 * GET /api/masters/check - マスタ更新チェック
 * 常に「更新なし」を返す（デフォルト動作）
 */
export const checkMastersHandler = http.get("/api/masters/check", () => {
  return HttpResponse.json({
    updatedMasters: [],
  });
});

/**
 * GET /api/masters/workers - 作業者マスタ取得
 */
export const getWorkersHandler = http.get("/api/masters/workers", () => {
  return HttpResponse.json({
    workers: workersFixture,
    version: workersVersion,
  });
});

/**
 * GET /api/masters/machines - 機械マスタ取得
 */
export const getMachinesHandler = http.get("/api/masters/machines", () => {
  return HttpResponse.json({
    machines: machinesFixture,
    version: machinesVersion,
  });
});

/**
 * GET /api/masters/materials - 材料マスタ取得
 */
export const getMaterialsHandler = http.get("/api/masters/materials", () => {
  return HttpResponse.json({
    materials: materialsFixture,
    version: materialsVersion,
  });
});

/**
 * GET /api/masters/units - 単位マスタ取得
 */
export const getUnitsHandler = http.get("/api/masters/units", () => {
  return HttpResponse.json({
    units: unitsFixture,
    version: unitsVersion,
  });
});

// Handler のエクスポート
export const mastersHandlers = [
  getMastersHandler,
  checkMastersHandler,
  getWorkersHandler,
  getMachinesHandler,
  getMaterialsHandler,
  getUnitsHandler,
];
