// ===================================
// タスク一覧 fixture（大量データ・ページネーションテスト用）
// ===================================

import type { TaskFixture } from "./tasks.normal";

// 作業者候補
const workerPool = [
  { id: "w001", name: "山田 太郎" },
  { id: "w002", name: "鈴木 花子" },
  { id: "w003", name: "佐藤 次郎" },
  { id: "w004", name: "田中 美咲" },
  { id: "w005", name: "高橋 健一" },
  { id: "w006", name: "伊藤 さくら" },
  { id: "w007", name: "渡辺 大輔" },
  { id: "w008", name: "中村 優子" },
];

// 機械候補
const machinePool = [
  { id: "m001", name: "プレス機 A-1" },
  { id: "m002", name: "プレス機 A-2" },
  { id: "m003", name: "旋盤 B-1" },
  { id: "m004", name: "旋盤 B-2" },
  { id: "m005", name: "フライス盤 C-1" },
  { id: "m006", name: "溶接機 D-1" },
  { id: "m007", name: "塗装ブース E-1" },
  { id: "m008", name: "検査装置 F-1" },
];

// 材料候補
const materialPool = [
  { id: "mt001", name: "アルミ板 A5052", unitId: "u007", unitName: "枚" },
  { id: "mt002", name: "ステンレス板 SUS304", unitId: "u007", unitName: "枚" },
  { id: "mt003", name: "鉄板 SS400", unitId: "u007", unitName: "枚" },
  { id: "mt004", name: "銅板 C1100", unitId: "u007", unitName: "枚" },
  { id: "mt005", name: "ABS樹脂", unitId: "u001", unitName: "キログラム" },
  {
    id: "mt006",
    name: "ポリカーボネート",
    unitId: "u001",
    unitName: "キログラム",
  },
  { id: "mt007", name: "ナイロン", unitId: "u001", unitName: "キログラム" },
  { id: "mt008", name: "ネジ M3×10", unitId: "u006", unitName: "個" },
  { id: "mt009", name: "ネジ M4×15", unitId: "u006", unitName: "個" },
  { id: "mt010", name: "ワッシャー M4", unitId: "u006", unitName: "個" },
];

/**
 * 100件の大量データを生成
 */
function generateLargeDataset(): TaskFixture[] {
  const tasks: TaskFixture[] = [];
  const baseDate = new Date("2024-01-01");

  for (let i = 0; i < 100; i++) {
    const taskDate = new Date(baseDate);
    taskDate.setDate(taskDate.getDate() + i);

    // ランダムに1-3人の作業者を選択
    const workerCount = 1 + (i % 3);
    const workers = [];
    for (let j = 0; j < workerCount; j++) {
      workers.push(workerPool[(i + j) % workerPool.length]);
    }

    // 機械を選択
    const machine = machinePool[i % machinePool.length];

    // ランダムに0-3個の材料を選択
    const materialCount = i % 4;
    const materials = [];
    for (let j = 0; j < materialCount; j++) {
      const material = materialPool[(i + j) % materialPool.length];
      materials.push({
        ...material,
        amount: Math.floor((i + j + 1) * 1.5),
      });
    }

    tasks.push({
      id: `t${String(i + 1).padStart(3, "0")}`,
      workDate: taskDate.toISOString().split("T")[0],
      workers,
      machine,
      materials,
      createdAt: taskDate.toISOString(),
      updatedAt: taskDate.toISOString(),
    });
  }

  return tasks;
}

export const tasksLargeFixture = generateLargeDataset();
