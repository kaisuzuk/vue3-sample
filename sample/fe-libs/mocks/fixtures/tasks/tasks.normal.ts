// ===================================
// タスク一覧 fixture（正常系）
// ===================================

export interface TaskFixture {
  id: string;
  workDate: string;
  workers: { id: string; name: string }[];
  machine: { id: string; name: string };
  materials: {
    id: string;
    name: string;
    amount: number;
    unitId: string;
    unitName: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export const tasksNormalFixture: TaskFixture[] = [
  {
    id: "t001",
    workDate: "2024-01-15",
    workers: [
      { id: "w001", name: "山田 太郎" },
      { id: "w002", name: "鈴木 花子" },
    ],
    machine: { id: "m001", name: "プレス機 A-1" },
    materials: [
      {
        id: "mt001",
        name: "アルミ板 A5052",
        amount: 10,
        unitId: "u007",
        unitName: "枚",
      },
      {
        id: "mt008",
        name: "ネジ M3×10",
        amount: 50,
        unitId: "u006",
        unitName: "個",
      },
    ],
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "t002",
    workDate: "2024-01-16",
    workers: [{ id: "w003", name: "佐藤 次郎" }],
    machine: { id: "m003", name: "旋盤 B-1" },
    materials: [
      {
        id: "mt002",
        name: "ステンレス板 SUS304",
        amount: 5,
        unitId: "u007",
        unitName: "枚",
      },
    ],
    createdAt: "2024-01-16T10:00:00Z",
    updatedAt: "2024-01-16T10:00:00Z",
  },
  {
    id: "t003",
    workDate: "2024-01-17",
    workers: [
      { id: "w004", name: "田中 美咲" },
      { id: "w005", name: "高橋 健一" },
      { id: "w006", name: "伊藤 さくら" },
    ],
    machine: { id: "m006", name: "溶接機 D-1" },
    materials: [
      {
        id: "mt003",
        name: "鉄板 SS400",
        amount: 20,
        unitId: "u007",
        unitName: "枚",
      },
      {
        id: "mt009",
        name: "ネジ M4×15",
        amount: 100,
        unitId: "u006",
        unitName: "個",
      },
      {
        id: "mt010",
        name: "ワッシャー M4",
        amount: 100,
        unitId: "u006",
        unitName: "個",
      },
    ],
    createdAt: "2024-01-17T08:30:00Z",
    updatedAt: "2024-01-17T14:00:00Z",
  },
  {
    id: "t004",
    workDate: "2024-01-18",
    workers: [{ id: "w001", name: "山田 太郎" }],
    machine: { id: "m002", name: "プレス機 A-2" },
    materials: [
      {
        id: "mt004",
        name: "銅板 C1100",
        amount: 8,
        unitId: "u007",
        unitName: "枚",
      },
    ],
    createdAt: "2024-01-18T09:00:00Z",
    updatedAt: "2024-01-18T09:00:00Z",
  },
  {
    id: "t005",
    workDate: "2024-01-19",
    workers: [
      { id: "w002", name: "鈴木 花子" },
      { id: "w007", name: "渡辺 大輔" },
    ],
    machine: { id: "m005", name: "フライス盤 C-1" },
    materials: [
      {
        id: "mt005",
        name: "ABS樹脂",
        amount: 2.5,
        unitId: "u001",
        unitName: "キログラム",
      },
    ],
    createdAt: "2024-01-19T11:00:00Z",
    updatedAt: "2024-01-19T11:00:00Z",
  },
  {
    id: "t006",
    workDate: "2024-01-20",
    workers: [{ id: "w003", name: "佐藤 次郎" }],
    machine: { id: "m007", name: "塗装ブース E-1" },
    materials: [],
    createdAt: "2024-01-20T13:00:00Z",
    updatedAt: "2024-01-20T13:00:00Z",
  },
  {
    id: "t007",
    workDate: "2024-01-21",
    workers: [
      { id: "w004", name: "田中 美咲" },
      { id: "w008", name: "中村 優子" },
    ],
    machine: { id: "m008", name: "検査装置 F-1" },
    materials: [],
    createdAt: "2024-01-21T10:00:00Z",
    updatedAt: "2024-01-21T10:00:00Z",
  },
  {
    id: "t008",
    workDate: "2024-01-22",
    workers: [{ id: "w005", name: "高橋 健一" }],
    machine: { id: "m003", name: "旋盤 B-1" },
    materials: [
      {
        id: "mt001",
        name: "アルミ板 A5052",
        amount: 15,
        unitId: "u007",
        unitName: "枚",
      },
    ],
    createdAt: "2024-01-22T09:00:00Z",
    updatedAt: "2024-01-22T09:00:00Z",
  },
  {
    id: "t009",
    workDate: "2024-01-23",
    workers: [
      { id: "w006", name: "伊藤 さくら" },
      { id: "w007", name: "渡辺 大輔" },
    ],
    machine: { id: "m004", name: "旋盤 B-2" },
    materials: [
      {
        id: "mt006",
        name: "ポリカーボネート",
        amount: 3,
        unitId: "u001",
        unitName: "キログラム",
      },
      {
        id: "mt007",
        name: "ナイロン",
        amount: 1.5,
        unitId: "u001",
        unitName: "キログラム",
      },
    ],
    createdAt: "2024-01-23T14:00:00Z",
    updatedAt: "2024-01-23T14:00:00Z",
  },
  {
    id: "t010",
    workDate: "2024-01-24",
    workers: [{ id: "w001", name: "山田 太郎" }],
    machine: { id: "m001", name: "プレス機 A-1" },
    materials: [
      {
        id: "mt002",
        name: "ステンレス板 SUS304",
        amount: 12,
        unitId: "u007",
        unitName: "枚",
      },
    ],
    createdAt: "2024-01-24T08:00:00Z",
    updatedAt: "2024-01-24T08:00:00Z",
  },
  {
    id: "t011",
    workDate: "2024-01-25",
    workers: [
      { id: "w002", name: "鈴木 花子" },
      { id: "w003", name: "佐藤 次郎" },
    ],
    machine: { id: "m006", name: "溶接機 D-1" },
    materials: [
      {
        id: "mt003",
        name: "鉄板 SS400",
        amount: 25,
        unitId: "u007",
        unitName: "枚",
      },
    ],
    createdAt: "2024-01-25T09:30:00Z",
    updatedAt: "2024-01-25T09:30:00Z",
  },
  {
    id: "t012",
    workDate: "2024-01-26",
    workers: [{ id: "w004", name: "田中 美咲" }],
    machine: { id: "m008", name: "検査装置 F-1" },
    materials: [],
    createdAt: "2024-01-26T15:00:00Z",
    updatedAt: "2024-01-26T15:00:00Z",
  },
  {
    id: "t013",
    workDate: "2024-01-27",
    workers: [
      { id: "w005", name: "高橋 健一" },
      { id: "w006", name: "伊藤 さくら" },
    ],
    machine: { id: "m002", name: "プレス機 A-2" },
    materials: [
      {
        id: "mt004",
        name: "銅板 C1100",
        amount: 6,
        unitId: "u007",
        unitName: "枚",
      },
      {
        id: "mt008",
        name: "ネジ M3×10",
        amount: 80,
        unitId: "u006",
        unitName: "個",
      },
    ],
    createdAt: "2024-01-27T10:00:00Z",
    updatedAt: "2024-01-27T10:00:00Z",
  },
  {
    id: "t014",
    workDate: "2024-01-28",
    workers: [{ id: "w007", name: "渡辺 大輔" }],
    machine: { id: "m005", name: "フライス盤 C-1" },
    materials: [
      {
        id: "mt005",
        name: "ABS樹脂",
        amount: 4,
        unitId: "u001",
        unitName: "キログラム",
      },
    ],
    createdAt: "2024-01-28T11:00:00Z",
    updatedAt: "2024-01-28T11:00:00Z",
  },
  {
    id: "t015",
    workDate: "2024-01-29",
    workers: [
      { id: "w008", name: "中村 優子" },
      { id: "w001", name: "山田 太郎" },
    ],
    machine: { id: "m007", name: "塗装ブース E-1" },
    materials: [],
    createdAt: "2024-01-29T13:30:00Z",
    updatedAt: "2024-01-29T13:30:00Z",
  },
];

// 空データ
export const tasksEmptyFixture: TaskFixture[] = [];
