// ===================================
// 材料マスタ fixture
// ===================================

export interface Material {
  id: string;
  name: string;
  category: string;
  defaultUnitId: string;
}

export const materialsFixture: Material[] = [
  {
    id: "mt001",
    name: "アルミ板 A5052",
    category: "金属",
    defaultUnitId: "u007",
  },
  {
    id: "mt002",
    name: "ステンレス板 SUS304",
    category: "金属",
    defaultUnitId: "u007",
  },
  { id: "mt003", name: "鉄板 SS400", category: "金属", defaultUnitId: "u007" },
  { id: "mt004", name: "銅板 C1100", category: "金属", defaultUnitId: "u007" },
  { id: "mt005", name: "ABS樹脂", category: "樹脂", defaultUnitId: "u001" },
  {
    id: "mt006",
    name: "ポリカーボネート",
    category: "樹脂",
    defaultUnitId: "u001",
  },
  { id: "mt007", name: "ナイロン", category: "樹脂", defaultUnitId: "u001" },
  { id: "mt008", name: "ネジ M3×10", category: "部品", defaultUnitId: "u006" },
  { id: "mt009", name: "ネジ M4×15", category: "部品", defaultUnitId: "u006" },
  {
    id: "mt010",
    name: "ワッシャー M4",
    category: "部品",
    defaultUnitId: "u006",
  },
];

export const materialsVersion = "v1.0.0";
