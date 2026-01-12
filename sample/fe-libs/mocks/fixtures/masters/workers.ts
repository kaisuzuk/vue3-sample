// ===================================
// 作業者マスタ fixture
// ===================================

export interface Worker {
  id: string;
  name: string;
  department: string;
}

export const workersFixture: Worker[] = [
  { id: "w001", name: "山田 太郎", department: "製造部" },
  { id: "w002", name: "鈴木 花子", department: "製造部" },
  { id: "w003", name: "佐藤 次郎", department: "製造部" },
  { id: "w004", name: "田中 美咲", department: "品質管理部" },
  { id: "w005", name: "高橋 健一", department: "品質管理部" },
  { id: "w006", name: "伊藤 さくら", department: "開発部" },
  { id: "w007", name: "渡辺 大輔", department: "開発部" },
  { id: "w008", name: "中村 優子", department: "総務部" },
];

export const workersVersion = "v1.0.0";
