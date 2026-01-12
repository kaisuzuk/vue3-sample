import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import TaskFormSection from "./TaskFormSection.vue";
import type {
  TaskFormValues,
  TaskFormErrors,
} from "@/features/tasks/model/useTaskForm";
import type { Worker, Machine, Material, Unit } from "@/features/master/types";

/**
 * TaskFormSection - タスクフォーム
 *
 * タスクの登録・編集に使用するフォームコンポーネント。
 * 入力UIの提供とバリデーションエラーの表示を担当。
 */
const meta: Meta<typeof TaskFormSection> = {
  title: "sections/tasks/TaskFormSection",
  component: TaskFormSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TaskFormSection>;

// モックマスタデータ
const mockWorkers: Worker[] = [
  { id: "w1", name: "山田太郎", department: "工事部" },
  { id: "w2", name: "鈴木花子", department: "工事部" },
  { id: "w3", name: "佐藤次郎", department: "管理部" },
  { id: "w4", name: "田中三郎", department: "工事部" },
];

const mockMachines: Machine[] = [
  { id: "m1", name: "掘削機A", category: "掘削" },
  { id: "m2", name: "クレーンB", category: "運搬" },
  { id: "m3", name: "ブルドーザーC", category: "整地" },
];

const mockMaterials: Material[] = [
  { id: "mat1", name: "セメント", category: "建材", defaultUnitId: "u1" },
  { id: "mat2", name: "砂利", category: "建材", defaultUnitId: "u1" },
  { id: "mat3", name: "鉄筋", category: "金属", defaultUnitId: "u2" },
  { id: "mat4", name: "ボルト", category: "金属", defaultUnitId: "u3" },
];

const mockUnits: Unit[] = [
  { id: "u1", name: "キログラム", symbol: "kg" },
  { id: "u2", name: "本", symbol: "本" },
  { id: "u3", name: "個", symbol: "個" },
  { id: "u4", name: "立方メートル", symbol: "m³" },
];

// 初期フォーム値
const emptyForm: TaskFormValues = {
  workDate: "",
  workerIds: [],
  machineId: "",
  materials: [],
};

const filledForm: TaskFormValues = {
  workDate: "2024-01-15",
  workerIds: ["w1", "w2"],
  machineId: "m1",
  materials: [
    { id: "mat1", amount: 100, unitId: "u1" },
    { id: "mat2", amount: 50, unitId: "u1" },
  ],
};

const emptyErrors: TaskFormErrors = {
  workDate: "",
  workerIds: "",
  machineId: "",
  materials: "",
  general: "",
};

/**
 * 空のフォーム（初期状態）
 */
export const Empty: Story = {
  render: () => ({
    components: { TaskFormSection },
    setup() {
      const form = ref<TaskFormValues>({ ...emptyForm });
      const errors = ref<TaskFormErrors>({ ...emptyErrors });
      const handleUpdate = (newForm: TaskFormValues) => {
        form.value = newForm;
      };
      const handleAddMaterial = () => {
        form.value.materials.push({ id: "", amount: null, unitId: "" });
      };
      const handleRemoveMaterial = (index: number) => {
        form.value.materials.splice(index, 1);
      };
      return {
        form,
        errors,
        workers: mockWorkers,
        machines: mockMachines,
        materials: mockMaterials,
        units: mockUnits,
        handleUpdate,
        handleAddMaterial,
        handleRemoveMaterial,
      };
    },
    template: `
      <TaskFormSection
        :form="form"
        :errors="errors"
        :workers="workers"
        :machines="machines"
        :materials="materials"
        :units="units"
        @update:form="handleUpdate"
        @add:material="handleAddMaterial"
        @remove:material="handleRemoveMaterial"
      />
    `,
  }),
};

/**
 * 入力済みのフォーム
 */
export const Filled: Story = {
  render: () => ({
    components: { TaskFormSection },
    setup() {
      const form = ref<TaskFormValues>({ ...filledForm });
      const errors = ref<TaskFormErrors>({ ...emptyErrors });
      const handleUpdate = (newForm: TaskFormValues) => {
        form.value = newForm;
      };
      const handleAddMaterial = () => {
        form.value.materials.push({ id: "", amount: null, unitId: "" });
      };
      const handleRemoveMaterial = (index: number) => {
        form.value.materials.splice(index, 1);
      };
      return {
        form,
        errors,
        workers: mockWorkers,
        machines: mockMachines,
        materials: mockMaterials,
        units: mockUnits,
        handleUpdate,
        handleAddMaterial,
        handleRemoveMaterial,
      };
    },
    template: `
      <TaskFormSection
        :form="form"
        :errors="errors"
        :workers="workers"
        :machines="machines"
        :materials="materials"
        :units="units"
        @update:form="handleUpdate"
        @add:material="handleAddMaterial"
        @remove:material="handleRemoveMaterial"
      />
    `,
  }),
};

/**
 * バリデーションエラー表示
 */
export const WithErrors: Story = {
  render: () => ({
    components: { TaskFormSection },
    setup() {
      const form = ref<TaskFormValues>({ ...emptyForm });
      const errors = ref<TaskFormErrors>({
        workDate: "作業日を入力してください",
        workerIds: "作業者を1名以上選択してください",
        machineId: "",
        materials: "材料の入力に問題があります",
        general: "",
      });
      const handleUpdate = (newForm: TaskFormValues) => {
        form.value = newForm;
      };
      const handleAddMaterial = () => {
        form.value.materials.push({ id: "", amount: null, unitId: "" });
      };
      const handleRemoveMaterial = (index: number) => {
        form.value.materials.splice(index, 1);
      };
      return {
        form,
        errors,
        workers: mockWorkers,
        machines: mockMachines,
        materials: mockMaterials,
        units: mockUnits,
        handleUpdate,
        handleAddMaterial,
        handleRemoveMaterial,
      };
    },
    template: `
      <TaskFormSection
        :form="form"
        :errors="errors"
        :workers="workers"
        :machines="machines"
        :materials="materials"
        :units="units"
        @update:form="handleUpdate"
        @add:material="handleAddMaterial"
        @remove:material="handleRemoveMaterial"
      />
    `,
  }),
};

/**
 * 送信中（無効化状態）
 */
export const Submitting: Story = {
  render: () => ({
    components: { TaskFormSection },
    setup() {
      const form = ref<TaskFormValues>({ ...filledForm });
      const errors = ref<TaskFormErrors>({ ...emptyErrors });
      const handleUpdate = (newForm: TaskFormValues) => {
        form.value = newForm;
      };
      const handleAddMaterial = () => {
        form.value.materials.push({ id: "", amount: null, unitId: "" });
      };
      const handleRemoveMaterial = (index: number) => {
        form.value.materials.splice(index, 1);
      };
      return {
        form,
        errors,
        workers: mockWorkers,
        machines: mockMachines,
        materials: mockMaterials,
        units: mockUnits,
        handleUpdate,
        handleAddMaterial,
        handleRemoveMaterial,
      };
    },
    template: `
      <TaskFormSection
        :form="form"
        :errors="errors"
        :workers="workers"
        :machines="machines"
        :materials="materials"
        :units="units"
        :is-submitting="true"
        @update:form="handleUpdate"
        @add:material="handleAddMaterial"
        @remove:material="handleRemoveMaterial"
      />
    `,
  }),
};
