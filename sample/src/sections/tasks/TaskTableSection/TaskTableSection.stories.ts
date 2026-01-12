import type { Meta, StoryObj } from "@storybook/vue3";
import TaskTableSection from "./TaskTableSection.vue";
import type { Task } from "@/features/tasks/types";

/**
 * TaskTableSection - タスク一覧テーブル
 *
 * タスクデータをテーブル形式で表示するコンポーネント。
 * ソート機能と行選択機能を提供する。
 */
const meta: Meta<typeof TaskTableSection> = {
  title: "sections/tasks/TaskTableSection",
  component: TaskTableSection,
  tags: ["autodocs"],
  argTypes: {
    tasks: {
      description: "タスク配列",
    },
    isLoading: {
      description: "ローディング状態",
      control: "boolean",
    },
    selectedTaskId: {
      description: "選択中のタスクID",
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TaskTableSection>;

// モックデータ
const mockTasks: Task[] = [
  {
    id: "task-1",
    workDate: "2024-01-15",
    workers: [
      { id: "w1", name: "山田太郎" },
      { id: "w2", name: "鈴木花子" },
    ],
    machine: { id: "m1", name: "掘削機A" },
    materials: [
      {
        id: "mat1",
        name: "セメント",
        amount: 100,
        unitId: "u1",
        unitName: "kg",
      },
      { id: "mat2", name: "砂利", amount: 50, unitId: "u1", unitName: "kg" },
    ],
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "task-2",
    workDate: "2024-01-16",
    workers: [{ id: "w3", name: "佐藤次郎" }],
    machine: { id: "m2", name: "クレーンB" },
    materials: [
      { id: "mat3", name: "鉄筋", amount: 200, unitId: "u2", unitName: "本" },
    ],
    createdAt: "2024-01-16T08:00:00Z",
    updatedAt: "2024-01-16T08:00:00Z",
  },
  {
    id: "task-3",
    workDate: "2024-01-17",
    workers: [
      { id: "w1", name: "山田太郎" },
      { id: "w4", name: "田中三郎" },
      { id: "w5", name: "高橋四郎" },
    ],
    machine: { id: "m3", name: "ブルドーザーC" },
    materials: [],
    createdAt: "2024-01-17T07:30:00Z",
    updatedAt: "2024-01-17T12:00:00Z",
  },
];

/**
 * 通常表示
 */
export const Default: Story = {
  args: {
    tasks: mockTasks,
    isLoading: false,
    selectedTaskId: null,
  },
};

/**
 * 行選択状態
 */
export const WithSelection: Story = {
  args: {
    tasks: mockTasks,
    isLoading: false,
    selectedTaskId: "task-2",
  },
};

/**
 * ローディング中
 */
export const Loading: Story = {
  args: {
    tasks: [],
    isLoading: true,
    selectedTaskId: null,
  },
};

/**
 * データなし
 */
export const Empty: Story = {
  args: {
    tasks: [],
    isLoading: false,
    selectedTaskId: null,
  },
};

/**
 * 大量データ（10件）
 */
export const ManyItems: Story = {
  args: {
    tasks: Array.from({ length: 10 }, (_, i) => ({
      id: `task-${i + 1}`,
      workDate: `2024-01-${String(i + 10).padStart(2, "0")}`,
      workers: [{ id: `w${i}`, name: `作業者${i + 1}` }],
      machine: {
        id: `m${i % 3}`,
        name: `機械${String.fromCharCode(65 + (i % 3))}`,
      },
      materials:
        i % 2 === 0
          ? [
              {
                id: `mat${i}`,
                name: `材料${i}`,
                amount: 100,
                unitId: "u1",
                unitName: "kg",
              },
            ]
          : [],
      createdAt: `2024-01-${String(i + 10).padStart(2, "0")}T09:00:00Z`,
      updatedAt: `2024-01-${String(i + 10).padStart(2, "0")}T09:00:00Z`,
    })),
    isLoading: false,
    selectedTaskId: null,
  },
};

/**
 * 材料が多いケース
 */
export const ManyMaterials: Story = {
  args: {
    tasks: [
      {
        id: "task-many-materials",
        workDate: "2024-01-20",
        workers: [{ id: "w1", name: "山田太郎" }],
        machine: { id: "m1", name: "掘削機A" },
        materials: [
          {
            id: "mat1",
            name: "セメント",
            amount: 100,
            unitId: "u1",
            unitName: "kg",
          },
          {
            id: "mat2",
            name: "砂利",
            amount: 50,
            unitId: "u1",
            unitName: "kg",
          },
          {
            id: "mat3",
            name: "鉄筋",
            amount: 200,
            unitId: "u2",
            unitName: "本",
          },
          {
            id: "mat4",
            name: "ボルト",
            amount: 500,
            unitId: "u3",
            unitName: "個",
          },
          {
            id: "mat5",
            name: "コンクリート",
            amount: 10,
            unitId: "u4",
            unitName: "m³",
          },
        ],
        createdAt: "2024-01-20T09:00:00Z",
        updatedAt: "2024-01-20T09:00:00Z",
      },
    ],
    isLoading: false,
    selectedTaskId: null,
  },
};
