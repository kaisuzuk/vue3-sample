# Storybook 解説資料

このドキュメントでは、本サンプルプロジェクトにおける Storybook の設定・使い方・Story ファイルの書き方を詳細に解説します。

---

## 目次

1. [Storybook とは](#1-storybook-とは)
2. [本プロジェクトでの導入状況](#2-本プロジェクトでの導入状況)
3. [起動方法](#3-起動方法)
4. [設定ファイル解説](#4-設定ファイル解説)
5. [Story ファイルの書き方](#5-story-ファイルの書き方)
6. [実践サンプル集](#6-実践サンプル集)
7. [Story 対象コンポーネントの設計指針](#7-story-対象コンポーネントの設計指針)
8. [よくあるパターン](#8-よくあるパターン)
9. [トラブルシューティング](#9-トラブルシューティング)

---

## 1. Storybook とは

Storybook は **コンポーネントの独立したカタログ** を作成するツールです。

### 主な特徴

| 特徴 | 説明 |
|------|------|
| **独立表示** | コンポーネントを単体で表示・確認できる |
| **ドキュメント生成** | Props の説明を自動的にドキュメント化 |
| **インタラクティブ操作** | Controls パネルで Props を動的に変更可能 |
| **状態バリエーション** | 異なる Props の組み合わせを Story として保存 |

### なぜ Storybook を使うのか

```
従来の開発:
  開発者 → アプリ起動 → 画面遷移 → 確認したいコンポーネントまで操作

Storybook を使った開発:
  開発者 → Storybook 起動 → コンポーネントを直接確認
```

**メリット:**
- アプリ全体を起動せずにコンポーネント単体を確認できる
- エッジケース（エラー状態、空データなど）を簡単に再現できる
- デザイナーや QA との共有が容易

---

## 2. 本プロジェクトでの導入状況

### インストール済みパッケージ

```json
{
  "devDependencies": {
    "@storybook/vue3-vite": "^8.6.15",
    "@storybook/addon-essentials": "^8.6.15",
    "storybook": "^8.6.15"
  }
}
```

### Story が存在するコンポーネント

| カテゴリ | コンポーネント | Story ファイル |
|----------|---------------|----------------|
| sections | TaskTableSection | `TaskTableSection.stories.ts` |
| sections | TaskFormSection | `TaskFormSection.stories.ts` |
| shared/ui | AppHeader | `AppHeader.stories.ts` |
| shared/ui | ConfirmDialog | `ConfirmDialog.stories.ts` |
| shared/ui | AppToast | `AppToast.stories.ts` |

### Storybook 対象外のコンポーネント

| レイヤー | 理由 |
|----------|------|
| pages | ルーティングや API 呼び出しに依存 |
| widgets | 複数の section や API 呼び出しを含む |

---

## 3. 起動方法

```bash
# sample ディレクトリで実行
cd sample
pnpm storybook
```

起動後、ブラウザで http://localhost:6006 を開くと Storybook UI が表示されます。

### 画面構成

```
+------------------+--------------------------------------+
| サイドバー        |  Canvas                               |
|                  |  +--------------------------------+  |
| ▼ sections       |  |                                |  |
|   ▼ tasks        |  |    コンポーネント表示            |  |
|     TaskTable... |  |                                |  |
|     TaskForm...  |  +--------------------------------+  |
|                  |                                      |
| ▼ shared         |  [Controls]  [Actions]  [Docs]       |
|   ▼ ui           |  Props を変更して動作確認            |
|     AppHeader    |                                      |
|     ConfirmDia...|                                      |
|     AppToast     |                                      |
+------------------+--------------------------------------+
```

---

## 4. 設定ファイル解説

### 4.1 main.ts（メイン設定）

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/vue3-vite";

const config: StorybookConfig = {
  // Story ファイルの検索パターン
  stories: [
    "../src/**/*.mdx",                           // MDXドキュメント
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"  // Storyファイル
  ],
  
  // 使用するアドオン
  addons: [
    "@storybook/addon-essentials"  // Controls, Actions, Docs など基本機能
  ],
  
  // フレームワーク設定
  framework: {
    name: "@storybook/vue3-vite",  // Vue 3 + Vite
    options: {},
  },
  
  // Vite 設定のカスタマイズ（必要に応じて）
  viteFinal: async (config) => {
    return config;
  },
};

export default config;
```

### 4.2 preview.ts（プレビュー設定）

Vuetify を使用するプロジェクトでは、preview.ts での設定が重要です。

```typescript
// .storybook/preview.ts
import type { Preview } from "@storybook/vue3";
import { setup } from "@storybook/vue3";

// ===== Vuetify のセットアップ =====
import "vuetify/styles";                         // Vuetify CSS
import "@mdi/font/css/materialdesignicons.css";  // Material Design Icons
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

// Vuetify インスタンス作成
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "light",
  },
});

// Vue アプリに Vuetify を登録
setup((app) => {
  app.use(vuetify);
});

// ===== プレビュー設定 =====
const preview: Preview = {
  parameters: {
    // Controls パネルの設定
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // 背景色の選択肢
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "dark", value: "#121212" },
        { name: "grey", value: "#F5F5F5" },
      ],
    },
  },
  
  // 全 Story に適用するラッパー
  decorators: [
    (story) => ({
      components: { story },
      // Vuetify の v-app でラップ（必須）
      template: `
        <v-app>
          <v-main>
            <v-container>
              <story />
            </v-container>
          </v-main>
        </v-app>
      `,
    }),
  ],
};

export default preview;
```

**重要ポイント:**
- Vuetify コンポーネントは `<v-app>` 内でないと正常に動作しない
- `decorators` で全 Story を自動的にラップ

---

## 5. Story ファイルの書き方

### 5.1 基本構造

```typescript
import type { Meta, StoryObj } from "@storybook/vue3";
import MyComponent from "./MyComponent.vue";

// ===== メタ情報 =====
const meta: Meta<typeof MyComponent> = {
  title: "カテゴリ/コンポーネント名",  // サイドバーでの表示階層
  component: MyComponent,               // 対象コンポーネント
  tags: ["autodocs"],                   // 自動ドキュメント生成
  argTypes: {                           // Props の説明
    propName: {
      description: "説明文",
      control: "text",  // コントロールの種類
    },
  },
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

// ===== Story 定義 =====
/**
 * Story の説明（Docs に表示される）
 */
export const Default: Story = {
  args: {
    propName: "値",
  },
};
```

### 5.2 title の命名規則

本プロジェクトでは、ディレクトリ構造に合わせた命名を採用しています。

| ディレクトリ | title 例 |
|-------------|----------|
| `sections/tasks/TaskTableSection` | `sections/tasks/TaskTableSection` |
| `shared/ui/AppHeader` | `shared/ui/AppHeader` |

### 5.3 argTypes の control 種類

```typescript
argTypes: {
  // テキスト入力
  text: { control: "text" },
  
  // 数値入力
  count: { control: "number" },
  
  // 真偽値（トグル）
  isActive: { control: "boolean" },
  
  // セレクトボックス
  size: { 
    control: "select", 
    options: ["small", "medium", "large"] 
  },
  
  // ラジオボタン
  variant: {
    control: "radio",
    options: ["outlined", "filled", "text"],
  },
  
  // 配列・オブジェクト
  items: { control: "object" },
  
  // 日付
  date: { control: "date" },
  
  // 色選択
  color: { control: "color" },
}
```

---

## 6. 実践サンプル集

### 6.1 シンプルなコンポーネント（AppHeader）

Props のみで完結するシンプルなパターン。

```typescript
// src/shared/ui/AppHeader/AppHeader.stories.ts
import type { Meta, StoryObj } from "@storybook/vue3";
import AppHeader from "./AppHeader.vue";

/**
 * AppHeader - アプリケーションヘッダー
 *
 * ページタイトルと戻るボタン、アクションボタンを配置するヘッダーコンポーネント。
 * 全画面で共通して使用される。
 */
const meta: Meta<typeof AppHeader> = {
  title: "shared/ui/AppHeader",
  component: AppHeader,
  tags: ["autodocs"],
  argTypes: {
    title: {
      description: "ページタイトル",
      control: "text",
    },
    showBack: {
      description: "戻るボタンを表示するか",
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

/**
 * 基本的な使用例
 */
export const Default: Story = {
  args: {
    title: "タスク一覧",
    showBack: false,
  },
};

/**
 * 戻るボタン付き
 */
export const WithBackButton: Story = {
  args: {
    title: "タスク編集",
    showBack: true,
  },
};
```

### 6.2 スロットを使うコンポーネント

`render` 関数を使ってテンプレートをカスタマイズ。

```typescript
/**
 * アクションボタン付き
 */
export const WithActions: Story = {
  args: {
    title: "タスク一覧",
    showBack: false,
  },
  render: (args) => ({
    components: { AppHeader },
    setup() {
      return { args };
    },
    template: `
      <AppHeader v-bind="args">
        <template #actions>
          <v-btn color="primary" prepend-icon="mdi-plus">新規作成</v-btn>
        </template>
      </AppHeader>
    `,
  }),
};
```

### 6.3 v-model を使うコンポーネント（ConfirmDialog）

`ref` を使って双方向バインディングを実現。

```typescript
// src/shared/ui/ConfirmDialog/ConfirmDialog.stories.ts
import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const meta: Meta<typeof ConfirmDialog> = {
  title: "shared/ui/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  argTypes: {
    title: {
      description: "ダイアログタイトル",
      control: "text",
    },
    message: {
      description: "確認メッセージ",
      control: "text",
    },
    confirmText: {
      description: "確認ボタンテキスト",
      control: "text",
    },
    cancelText: {
      description: "キャンセルボタンテキスト",
      control: "text",
    },
    confirmColor: {
      description: "確認ボタンの色",
      control: "select",
      options: ["primary", "error", "warning", "success"],
    },
    loading: {
      description: "処理中フラグ",
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

/**
 * 削除確認ダイアログ
 */
export const DeleteConfirm: Story = {
  args: {
    modelValue: true,
    title: "タスクを削除しますか？",
    message: "この操作は取り消せません。本当に削除しますか？",
    confirmText: "削除",
    confirmColor: "error",
  },
};

/**
 * 処理中状態
 */
export const Loading: Story = {
  args: {
    modelValue: true,
    title: "削除中...",
    message: "タスクを削除しています。",
    confirmText: "削除",
    confirmColor: "error",
    loading: true,
  },
};

/**
 * インタラクティブなデモ
 */
export const Interactive: Story = {
  render: () => ({
    components: { ConfirmDialog },
    setup() {
      const isOpen = ref(false);
      const handleConfirm = () => {
        console.log("確認ボタンがクリックされました");
        isOpen.value = false;
      };
      const handleCancel = () => {
        console.log("キャンセルされました");
        isOpen.value = false;
      };
      return { isOpen, handleConfirm, handleCancel };
    },
    template: `
      <div>
        <v-btn color="error" @click="isOpen = true">
          削除ダイアログを開く
        </v-btn>
        <ConfirmDialog
          v-model="isOpen"
          title="削除確認"
          message="本当に削除しますか？"
          confirmText="削除"
          confirmColor="error"
          @confirm="handleConfirm"
          @cancel="handleCancel"
        />
      </div>
    `,
  }),
};
```

### 6.4 複雑なフォームコンポーネント（TaskFormSection）

複数の Props と双方向バインディング、イベントハンドラを持つパターン。

```typescript
// src/sections/tasks/TaskFormSection/TaskFormSection.stories.ts
import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import TaskFormSection from "./TaskFormSection.vue";
import type {
  TaskFormValues,
  TaskFormErrors,
} from "@/features/tasks/model/useTaskForm";
import type { Worker, Machine, Material, Unit } from "@/features/master/types";

const meta: Meta<typeof TaskFormSection> = {
  title: "sections/tasks/TaskFormSection",
  component: TaskFormSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TaskFormSection>;

// ===== モックマスタデータ =====
const mockWorkers: Worker[] = [
  { id: "w1", name: "山田太郎", department: "工事部" },
  { id: "w2", name: "鈴木花子", department: "工事部" },
  { id: "w3", name: "佐藤次郎", department: "管理部" },
];

const mockMachines: Machine[] = [
  { id: "m1", name: "掘削機A", category: "掘削" },
  { id: "m2", name: "クレーンB", category: "運搬" },
];

const mockMaterials: Material[] = [
  { id: "mat1", name: "セメント", category: "建材", defaultUnitId: "u1" },
  { id: "mat2", name: "砂利", category: "建材", defaultUnitId: "u1" },
];

const mockUnits: Unit[] = [
  { id: "u1", name: "キログラム", symbol: "kg" },
  { id: "u2", name: "本", symbol: "本" },
];

// ===== 初期値 =====
const emptyForm: TaskFormValues = {
  workDate: "",
  workerIds: [],
  machineId: "",
  materials: [],
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
        machineId: "機械を選択してください",
        materials: "",
        general: "",
      });

      return {
        form,
        errors,
        workers: mockWorkers,
        machines: mockMachines,
        materials: mockMaterials,
        units: mockUnits,
        handleUpdate: (v: TaskFormValues) => { form.value = v; },
        handleAddMaterial: () => {},
        handleRemoveMaterial: () => {},
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
```

### 6.5 テーブルコンポーネント（TaskTableSection）

配列データを渡すパターン。

```typescript
// src/sections/tasks/TaskTableSection/TaskTableSection.stories.ts
import type { Meta, StoryObj } from "@storybook/vue3";
import TaskTableSection from "./TaskTableSection.vue";
import type { Task } from "@/features/tasks/types";

const meta: Meta<typeof TaskTableSection> = {
  title: "sections/tasks/TaskTableSection",
  component: TaskTableSection,
  tags: ["autodocs"],
  argTypes: {
    tasks: { description: "タスク配列" },
    isLoading: { description: "ローディング状態", control: "boolean" },
    selectedTaskId: { description: "選択中のタスクID", control: "text" },
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
      { id: "mat1", name: "セメント", amount: 100, unitId: "u1", unitName: "kg" },
    ],
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  // ... 他のデータ
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
 * 大量データ
 */
export const ManyItems: Story = {
  args: {
    tasks: Array.from({ length: 10 }, (_, i) => ({
      id: `task-${i + 1}`,
      workDate: `2024-01-${String(i + 10).padStart(2, "0")}`,
      workers: [{ id: `w${i}`, name: `作業者${i + 1}` }],
      machine: { id: `m${i % 3}`, name: `機械${String.fromCharCode(65 + (i % 3))}` },
      materials: [],
      createdAt: `2024-01-${String(i + 10).padStart(2, "0")}T09:00:00Z`,
      updatedAt: `2024-01-${String(i + 10).padStart(2, "0")}T09:00:00Z`,
    })),
    isLoading: false,
    selectedTaskId: null,
  },
};
```

---

## 7. Story 対象コンポーネントの設計指針

### 対象レイヤー

```
┌──────────────────────────────────────────────────────┐
│  pages/                                              │
│    ├── ルーティング依存                             │  ❌ 対象外
│    └── API 呼び出し                                 │
├──────────────────────────────────────────────────────┤
│  widgets/                                            │
│    ├── 複数の section を組み合わせ                  │  ❌ 対象外
│    └── API 呼び出し or 状態管理                     │
├──────────────────────────────────────────────────────┤
│  sections/                                           │
│    ├── Props で完結                                 │  ✅ 対象
│    └── UI ロジックのみ                              │
├──────────────────────────────────────────────────────┤
│  shared/ui/                                          │
│    ├── 汎用的な UI 部品                             │  ✅ 対象
│    └── どこからでも使える                           │
└──────────────────────────────────────────────────────┘
```

### Storybook 対象にするコンポーネントの条件

| 条件 | 説明 |
|------|------|
| **Props で完結** | 必要なデータはすべて Props で受け取る |
| **API 非依存** | 内部で fetch や axios を呼び出さない |
| **ルーティング非依存** | router.push() などを呼び出さない |
| **Emit でイベント通知** | 親へのイベント伝達は emit で行う |

---

## 8. よくあるパターン

### 8.1 Actions でイベントを確認

```typescript
export const WithActions: Story = {
  args: {
    items: mockItems,
  },
  // play 関数でインタラクション
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '削除' }));
  },
};
```

### 8.2 複数の Story でバリエーションを網羅

```typescript
// 正常系
export const Default: Story = { args: { ... } };

// エッジケース
export const Empty: Story = { args: { items: [] } };
export const Loading: Story = { args: { isLoading: true } };
export const Error: Story = { args: { error: "エラーが発生しました" } };

// 境界値
export const SingleItem: Story = { args: { items: [item] } };
export const ManyItems: Story = { args: { items: manyItems } };
```

### 8.3 パラメータでレイアウト調整

```typescript
export const FullWidth: Story = {
  args: { ... },
  parameters: {
    layout: 'fullscreen',  // 全画面表示
  },
};

export const Centered: Story = {
  args: { ... },
  parameters: {
    layout: 'centered',  // 中央揃え
  },
};
```

---

## 9. トラブルシューティング

### 9.1 Vuetify コンポーネントが正しく表示されない

**原因:** `<v-app>` でラップされていない

**解決:** `preview.ts` の decorators を確認

```typescript
decorators: [
  (story) => ({
    components: { story },
    template: "<v-app><v-main><story /></v-main></v-app>",
  }),
],
```

### 9.2 パスエイリアス（@/）が解決されない

**原因:** Vite 設定が Storybook に継承されていない

**解決:** `main.ts` の `viteFinal` で設定

```typescript
viteFinal: async (config) => {
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '../src'),
  };
  return config;
},
```

### 9.3 Story ファイルが認識されない

**原因:** stories パターンに一致していない

**解決:** `main.ts` の stories 設定を確認

```typescript
stories: [
  "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
]
```

---

## 10. まとめ

| ポイント | 説明 |
|----------|------|
| **対象を絞る** | sections と shared/ui に限定 |
| **Props で完結** | API やルーティングに依存しない |
| **バリエーション** | 正常系・エッジケースを網羅 |
| **Vuetify 統合** | preview.ts で v-app ラップ必須 |

Storybook を活用することで、コンポーネントの品質向上と開発効率アップを実現できます。
