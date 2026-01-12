# Storybook ガイド

このドキュメントでは、Storybook の基本概念から実践的な使い方まで解説します。

---

## 目次

1. [Storybook とは](#1-storybook-とは)
2. [なぜ Storybook を使うのか](#2-なぜ-storybook-を使うのか)
3. [基本概念](#3-基本概念)
4. [対象コンポーネントの設計指針](#4-対象コンポーネントの設計指針)
5. [設定ファイル解説](#5-設定ファイル解説)
6. [Story ファイルの書き方](#6-story-ファイルの書き方)
7. [実践サンプル集](#7-実践サンプル集)
8. [必須 Story チェックリスト](#8-必須-story-チェックリスト)
9. [開発フローへの組み込み](#9-開発フローへの組み込み)
10. [トラブルシューティング](#10-トラブルシューティング)

---

## 1. Storybook とは

### 一言で言うと

Storybook は、**画面を起動しなくても、コンポーネント単体を動かして確認できるツール**です。

### 従来の開発（Storybook なし）

```
1. 画面全体を起動する
2. ログインする
3. 目的の画面まで遷移する
4. 特定の状態を再現する（エラー、ローディングなど）
5. やっと確認できる
```

**問題点:**
- 確認に時間がかかる
- 特定の状態（エラーなど）の再現が難しい
- API が必要

### Storybook があると

```
1. Storybook を起動する
2. 確認したいコンポーネントを選ぶ
3. 状態を切り替えて確認する
```

**メリット:**
- コンポーネント単体で確認できる
- 状態（通常、エラー、ローディング）を簡単に切り替えられる
- API 不要（props で状態を渡すだけ）
- デザイナーや QA との共有が容易

---

## 2. なぜ Storybook を使うのか

### 理由 1：CDD（コンポーネント駆動開発）と相性が良い

「部品を先に作り、画面は後から組み合わせる」という考え方を採用する場合、Storybook は「部品単体で確認・開発する」ためのツールとして自然に噛み合います。

### 理由 2：設計の健全性がわかる

Storybook で確認しようとしたとき、以下のような状況になったら設計に問題があるサインです：

| 状況 | 問題 |
|------|------|
| props が多すぎる | コンポーネントの責務が広すぎる |
| Story を書くのが難しい | API や Store に依存しすぎている |
| 状態を説明できない | ロジックが UI に漏れている |
| Story が増えすぎる | コンポーネントを分割すべき |

### 理由 3：レビューがしやすくなる

Storybook があると、レビュー時にこう確認できます：

- 「このボタン、Storybook の primary と同じ？」
- 「エラー状態の Story がないけど、想定してる？」
- 「ローディング中の表示はどうなる？」

---

## 3. 基本概念

### Story とは

**Story = コンポーネントの「1 つの状態」**

例えば Button コンポーネントの場合：

| Story 名 | 状態 |
|----------|------|
| Primary | 通常のプライマリボタン |
| Secondary | セカンダリボタン |
| Disabled | 操作不可状態 |
| Loading | ローディング中 |

これらをすべて Storybook に登録しておくと、状態を切り替えて確認できます。

### なぜ状態ごとに分けるのか

- 実装者が「どんな状態を想定すべきか」わかる
- レビュー時に「想定漏れ」を見つけやすい
- 画面でしか再現できない状態を減らせる

---

## 4. 対象コンポーネントの設計指針

### レイヤー別の対象判断

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

### よくある NG 例

```typescript
// ❌ NG: コンポーネント内で API を呼んでいる
onMounted(async () => {
  items.value = await fetchItems()
})

// ❌ NG: Store を import している
import { useItemStore } from '@/stores/item'
```

→ Section は props で受け取る設計に変更する

---

## 5. 設定ファイル解説

### 5.1 main.ts（メイン設定）

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

### 5.2 preview.ts（プレビュー設定）

Vuetify を使用するプロジェクトでは、preview.ts での設定が重要です。

```typescript
// .storybook/preview.ts
import type { Preview } from "@storybook/vue3";
import { setup } from "@storybook/vue3";

// ===== Vuetify のセットアップ =====
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components,
  directives,
  theme: { defaultTheme: "light" },
});

// Vue アプリに Vuetify を登録
setup((app) => {
  app.use(vuetify);
});

// ===== プレビュー設定 =====
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "dark", value: "#121212" },
        { name: "grey", value: "#F5F5F5" },
      ],
    },
  },
  
  // 全 Story を v-app でラップ（Vuetify 必須）
  decorators: [
    (story) => ({
      components: { story },
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

**重要:** Vuetify コンポーネントは `<v-app>` 内でないと正常に動作しないため、decorators で自動ラップしています。

---

## 6. Story ファイルの書き方

### 6.1 基本構造

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
      control: "text",
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

### 6.2 title の命名規則

ディレクトリ構造に合わせた命名を採用します。

| ディレクトリ | title 例 |
|-------------|----------|
| `sections/tasks/TaskTableSection` | `sections/tasks/TaskTableSection` |
| `shared/ui/AppHeader` | `shared/ui/AppHeader` |

### 6.3 argTypes の control 種類

```typescript
argTypes: {
  text: { control: "text" },           // テキスト入力
  count: { control: "number" },        // 数値入力
  isActive: { control: "boolean" },    // トグル
  size: {                              // セレクトボックス
    control: "select", 
    options: ["small", "medium", "large"] 
  },
  variant: {                           // ラジオボタン
    control: "radio",
    options: ["outlined", "filled", "text"],
  },
  items: { control: "object" },        // 配列・オブジェクト
  date: { control: "date" },           // 日付
  color: { control: "color" },         // 色選択
}
```

### 6.4 ファイル配置ルール

```
src/
├── shared/ui/
│   └── Button/
│       ├── Button.vue
│       └── Button.stories.ts   # 同じフォルダに配置
└── sections/
    └── tasks/
        └── TaskTableSection/
            ├── TaskTableSection.vue
            └── TaskTableSection.stories.ts
```

**ルール：Story ファイルはコンポーネントと同じフォルダに配置**

---

## 7. 実践サンプル集

### 7.1 シンプルなコンポーネント（args パターン）

Props のみで完結するシンプルなパターン。

```typescript
// shared/ui/AppHeader/AppHeader.stories.ts
import type { Meta, StoryObj } from "@storybook/vue3";
import AppHeader from "./AppHeader.vue";

const meta: Meta<typeof AppHeader> = {
  title: "shared/ui/AppHeader",
  component: AppHeader,
  tags: ["autodocs"],
  argTypes: {
    title: { description: "ページタイトル", control: "text" },
    showBack: { description: "戻るボタンを表示するか", control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

export const Default: Story = {
  args: {
    title: "タスク一覧",
    showBack: false,
  },
};

export const WithBackButton: Story = {
  args: {
    title: "タスク編集",
    showBack: true,
  },
};
```

### 7.2 スロットを使うコンポーネント（render パターン）

```typescript
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

### 7.3 v-model を使うコンポーネント

`ref` を使って双方向バインディングを実現。

```typescript
// shared/ui/ConfirmDialog/ConfirmDialog.stories.ts
import { ref } from "vue";

export const Interactive: Story = {
  render: () => ({
    components: { ConfirmDialog },
    setup() {
      const isOpen = ref(false);
      const handleConfirm = () => {
        console.log("確認ボタンがクリックされました");
        isOpen.value = false;
      };
      return { isOpen, handleConfirm };
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
        />
      </div>
    `,
  }),
};
```

### 7.4 複雑なフォームコンポーネント

複数の Props と双方向バインディング、イベントハンドラを持つパターン。

```typescript
// sections/tasks/TaskFormSection/TaskFormSection.stories.ts
import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import TaskFormSection from "./TaskFormSection.vue";

const meta: Meta<typeof TaskFormSection> = {
  title: "sections/tasks/TaskFormSection",
  component: TaskFormSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TaskFormSection>;

// モックマスタデータ
const mockWorkers = [
  { id: "w1", name: "山田太郎", department: "工事部" },
  { id: "w2", name: "鈴木花子", department: "工事部" },
];
const mockMachines = [
  { id: "m1", name: "掘削機A", category: "掘削" },
];

// 初期状態
export const Default: Story = {
  render: () => ({
    components: { TaskFormSection },
    setup() {
      const form = ref({ workDate: "", workerIds: [], machineId: "", materials: [] });
      const errors = ref({});
      return {
        form, errors,
        workers: mockWorkers,
        machines: mockMachines,
        canSubmit: false,
        submitting: false,
      };
    },
    template: `
      <TaskFormSection
        :form="form"
        :errors="errors"
        :workers="workers"
        :machines="machines"
        :canSubmit="canSubmit"
        :submitting="submitting"
      />
    `,
  }),
};

// 入力済み
export const Filled: Story = {
  render: () => ({
    components: { TaskFormSection },
    setup() {
      const form = ref({
        workDate: "2024-01-15",
        workerIds: ["w1", "w2"],
        machineId: "m1",
        materials: [{ id: "mat1", amount: 100, unitId: "u1" }],
      });
      const errors = ref({});
      return {
        form, errors,
        workers: mockWorkers,
        machines: mockMachines,
        canSubmit: true,
        submitting: false,
      };
    },
    template: `
      <TaskFormSection
        :form="form"
        :errors="errors"
        :workers="workers"
        :machines="machines"
        :canSubmit="canSubmit"
        :submitting="submitting"
      />
    `,
  }),
};

// エラーあり
export const WithErrors: Story = {
  render: () => ({
    components: { TaskFormSection },
    setup() {
      const form = ref({ workDate: "", workerIds: [], machineId: "", materials: [] });
      const errors = ref({
        workDate: "作業日を入力してください",
        workerIds: "作業者を1名以上選択してください",
        machineId: "機械を選択してください",
      });
      return {
        form, errors,
        workers: mockWorkers,
        machines: mockMachines,
        canSubmit: false,
        submitting: false,
      };
    },
    template: `
      <TaskFormSection
        :form="form"
        :errors="errors"
        :workers="workers"
        :machines="machines"
        :canSubmit="canSubmit"
        :submitting="submitting"
      />
    `,
  }),
};

// 送信中
export const Submitting: Story = {
  render: () => ({
    components: { TaskFormSection },
    setup() {
      const form = ref({
        workDate: "2024-01-15",
        workerIds: ["w1"],
        machineId: "m1",
        materials: [],
      });
      const errors = ref({});
      return {
        form, errors,
        workers: mockWorkers,
        machines: mockMachines,
        canSubmit: false,
        submitting: true,
      };
    },
    template: `
      <TaskFormSection
        :form="form"
        :errors="errors"
        :workers="workers"
        :machines="machines"
        :canSubmit="canSubmit"
        :submitting="submitting"
      />
    `,
  }),
};

// 無効状態
export const Disabled: Story = {
  render: () => ({
    components: { TaskFormSection },
    setup() {
      const form = ref({
        workDate: "2024-01-15",
        workerIds: ["w1"],
        machineId: "m1",
        materials: [],
      });
      const errors = ref({});
      return {
        form, errors,
        workers: mockWorkers,
        machines: mockMachines,
        canSubmit: false,
        submitting: false,
        disabled: true,
      };
    },
    template: `
      <TaskFormSection
        :form="form"
        :errors="errors"
        :workers="workers"
        :machines="machines"
        :disabled="disabled"
      />
    `,
  }),
};
```

### 7.5 テーブルコンポーネント（状態バリエーション）

```typescript
// sections/tasks/TaskTableSection/TaskTableSection.stories.ts
const mockTasks = [
  {
    id: "task-1",
    workDate: "2024-01-15",
    workers: [{ id: "w1", name: "山田太郎" }],
    machine: { id: "m1", name: "掘削機A" },
    materials: [],
  },
];

// 通常表示
export const Default: Story = {
  args: {
    tasks: mockTasks,
    isLoading: false,
    selectedTaskId: null,
  },
};

// ローディング中
export const Loading: Story = {
  args: {
    tasks: [],
    isLoading: true,
    selectedTaskId: null,
  },
};

// データなし
export const Empty: Story = {
  args: {
    tasks: [],
    isLoading: false,
    selectedTaskId: null,
  },
};

// 大量データ
export const ManyItems: Story = {
  args: {
    tasks: Array.from({ length: 50 }, (_, i) => ({
      id: `task-${i + 1}`,
      workDate: `2024-01-${String(i + 10).padStart(2, "0")}`,
      workers: [{ id: `w${i}`, name: `作業者${i + 1}` }],
      machine: { id: `m${i % 3}`, name: `機械${String.fromCharCode(65 + (i % 3))}` },
      materials: [],
    })),
    isLoading: false,
    selectedTaskId: null,
  },
};
```

---

## 8. 必須 Story チェックリスト

新しいコンポーネントを作ったら、最低限以下の Story を用意してください。

### 共通 UI（Button, TextField など）

- [ ] Default（通常状態）
- [ ] Disabled（操作不可）
- [ ] Loading（ローディング中）※該当する場合
- [ ] 各 variant / size の組み合わせ

### Section（入力・表示コンポーネント）

- [ ] Default（通常表示）
- [ ] Empty（データなし）
- [ ] WithErrors（エラー表示）
- [ ] Disabled / Readonly（操作不可）
- [ ] ManyItems（大量データ）※リスト系の場合

### レビュー時のセルフチェック

PR を出す前に確認してください：

- [ ] API / Store / 業務ロジックを import していない
- [ ] props と emit だけで完結している
- [ ] Story が「状態一覧」になっている
- [ ] 複数の状態パターンがある（1 つだけは NG）
- [ ] 画面固有の命名になっていない

---

## 9. 開発フローへの組み込み

### 起動方法

```bash
# プロジェクトルートで
pnpm storybook
```

ブラウザで http://localhost:6006 が開きます。

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
+------------------+--------------------------------------+
```

### おすすめ開発フロー

```
1. コンポーネントを作る
2. まず Storybook で単体起動する
3. 状態違いを Story として洗い出す
4. props / emit が自然か確認
5. 問題なければ画面に組み込む
```

**「画面を見てから調整」ではなく「Storybook で固めてから組み込む」**

---

## 10. トラブルシューティング

### Vuetify コンポーネントが正しく表示されない

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

### パスエイリアス（@/）が解決されない

**原因:** Vite 設定が Storybook に継承されていない

**解決:** `main.ts` の `viteFinal` で設定

```typescript
import path from 'path';

viteFinal: async (config) => {
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '../src'),
  };
  return config;
},
```

### Story ファイルが認識されない

**原因:** stories パターンに一致していない

**解決:** `main.ts` の stories 設定を確認

```typescript
stories: [
  "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
]
```

---

## まとめ

| ポイント | 説明 |
|----------|------|
| **対象を絞る** | sections と shared/ui に限定 |
| **Props で完結** | API やルーティングに依存しない |
| **バリエーション** | 正常系・エッジケースを網羅 |
| **Vuetify 統合** | preview.ts で v-app ラップ必須 |
| **設計の健康診断** | Story が書きにくい = 設計を見直すサイン |

Storybook を活用することで、コンポーネントの品質向上と開発効率アップを実現できます。

---

## 次のステップ

Storybook の基本を理解したら、[06_MSW入門](./06_MSW入門.md) で API モックの作り方を学びましょう。
