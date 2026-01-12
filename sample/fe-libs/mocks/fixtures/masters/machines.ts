// ===================================
// 機械マスタ fixture
// ===================================

export interface Machine {
  id: string;
  name: string;
  category: string;
}

export const machinesFixture: Machine[] = [
  { id: "m001", name: "プレス機 A-1", category: "プレス" },
  { id: "m002", name: "プレス機 A-2", category: "プレス" },
  { id: "m003", name: "旋盤 B-1", category: "切削" },
  { id: "m004", name: "旋盤 B-2", category: "切削" },
  { id: "m005", name: "フライス盤 C-1", category: "切削" },
  { id: "m006", name: "溶接機 D-1", category: "溶接" },
  { id: "m007", name: "塗装ブース E-1", category: "塗装" },
  { id: "m008", name: "検査装置 F-1", category: "検査" },
];

export const machinesVersion = "v1.0.0";
