# Storybook 入門

このドキュメントでは、Storybook を使ったことがない人向けに、「Storybook とは何か」「なぜ使うのか」「どう使うのか」を説明します。

---

## Storybook とは

### 一言で言うと

Storybook は、**画面を起動しなくても、コンポーネント単体を動かして確認できるツール**です。

### Vue2 時代の開発（Storybook なし）

```
1. 画面全体を起動する
2. ログインする
3. 目的の画面まで遷移する
4. 特定の状態を再現する（エラー、ローディングなど）
5. やっと確認できる
```

問題点：
- 確認に時間がかかる
- 特定の状態（エラーなど）の再現が難しい
- API が必要

### Storybook があると

```
1. Storybook を起動する
2. 確認したいコンポーネントを選ぶ
3. 状態を切り替えて確認する
```

メリット：
- コンポーネント単体で確認できる
- 状態（通常、エラー、ローディング）を簡単に切り替えられる
- API 不要（props で状態を渡すだけ）

---

## なぜ Storybook を使うのか

### 理由 1：CDD（コンポーネント駆動開発）と相性が良い

このプロジェクトでは「部品を先に作り、画面は後から組み合わせる」という考え方を採用しています。

Storybook は「部品単体で確認・開発する」ためのツールなので、CDD と自然に噛み合います。

### 理由 2：設計の健全性がわかる

Storybook で確認しようとしたとき、以下のような状況になったら設計に問題があるサインです：

| 状況 | 問題 |
|------|------|
| props が多すぎる | コンポーネントの責務が広すぎる |
| Story を書くのが難しい | API や Store に依存しすぎている |
| 状態を説明できない | ロジックが UI に漏れている |

### 理由 3：レビューがしやすくなる

Storybook があると、レビュー時にこう確認できます：

- 「このボタン、Storybook の primary と同じ？」
- 「エラー状態の Story がないけど、想定してる？」
- 「ローディング中の表示はどうなる？」

---

## Storybook の基本概念

### Story とは

**Story = コンポーネントの「1 つの状態」**

例えば Button コンポーネントの場合：

- 通常状態 → 1 つの Story
- disabled 状態 → 1 つの Story
- loading 状態 → 1 つの Story
- danger（危険操作）→ 1 つの Story

これらをすべて Storybook に登録しておくと、状態を切り替えて確認できます。

### なぜ状態ごとに分けるのか

- 実装者が「どんな状態を想定すべきか」わかる
- レビュー時に「想定漏れ」を見つけやすい
- 画面でしか再現できない状態を減らせる

---

## Storybook 対象のコンポーネント

### 必須対象

| 種類 | 例 | 理由 |
|------|-----|------|
| shared/ui | Button, TextField, Select | 全画面で使うので品質が重要 |
| sections | ItemsTableSection, FormSection | 状態パターンの確認が必要 |

### 任意対象

| 種類 | 例 | 理由 |
|------|-----|------|
| Wrapper | RegisterButton, DangerButton | 用途が固定されているものは確認価値あり |

### 対象外

| 種類 | 例 | 理由 |
|------|-----|------|
| pages | ItemsListPage | 画面統合は実画面で確認 |
| widgets | ItemsListWidget | 依存が多く Storybook 向きでない |
| 外部依存が重いもの | Google Map | Storybook で再現困難 |

---

## Story の書き方

### 基本構造

```typescript
// components/Button/Button.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import Button from './Button.vue'

// メタ情報（コンポーネントの登録）
const meta: Meta<typeof Button> = {
  title: 'shared/ui/Button',  // Storybook 上の表示パス
  component: Button,
  tags: ['autodocs'],         // 自動ドキュメント生成
}

export default meta
type Story = StoryObj<typeof Button>

// 各 Story の定義
export const Primary: Story = {
  args: {
    variant: 'primary',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">ボタン</Button>',
  }),
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">ボタン</Button>',
  }),
}

export const Danger: Story = {
  args: {
    variant: 'danger',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">削除する</Button>',
  }),
}

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">保存中...</Button>',
  }),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">ボタン</Button>',
  }),
}
```

### Section の Story 例

```typescript
// pages/items/sections/ItemsTableSection.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import ItemsTableSection from './ItemsTableSection.vue'

const meta: Meta<typeof ItemsTableSection> = {
  title: 'sections/ItemsTableSection',
  component: ItemsTableSection,
}

export default meta
type Story = StoryObj<typeof ItemsTableSection>

// 通常表示
export const Default: Story = {
  args: {
    items: [
      { id: '1', name: '商品A', price: 1000 },
      { id: '2', name: '商品B', price: 2000 },
      { id: '3', name: '商品C', price: 3000 },
    ],
  },
}

// 空の状態
export const Empty: Story = {
  args: {
    items: [],
  },
}

// 大量データ
export const ManyItems: Story = {
  args: {
    items: Array.from({ length: 50 }, (_, i) => ({
      id: String(i + 1),
      name: `商品${i + 1}`,
      price: (i + 1) * 100,
    })),
  },
}
```

### フォーム Section の Story 例

```typescript
// pages/items/sections/ItemFormSection.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import ItemFormSection from './ItemFormSection.vue'

const meta: Meta<typeof ItemFormSection> = {
  title: 'sections/ItemFormSection',
  component: ItemFormSection,
}

export default meta
type Story = StoryObj<typeof ItemFormSection>

// 初期状態
export const Default: Story = {
  args: {
    form: { name: '', price: 0 },
    errors: {},
    canSubmit: false,
    submitting: false,
  },
}

// 入力済み
export const Filled: Story = {
  args: {
    form: { name: '新商品', price: 1500 },
    errors: {},
    canSubmit: true,
    submitting: false,
  },
}

// エラーあり
export const WithErrors: Story = {
  args: {
    form: { name: '', price: -100 },
    errors: {
      name: '商品名は必須です',
      price: '価格は0以上にしてください',
    },
    canSubmit: false,
    submitting: false,
  },
}

// 送信中
export const Submitting: Story = {
  args: {
    form: { name: '新商品', price: 1500 },
    errors: {},
    canSubmit: false,
    submitting: true,
  },
}

// 無効状態
export const Disabled: Story = {
  args: {
    form: { name: '既存商品', price: 1000 },
    errors: {},
    canSubmit: false,
    submitting: false,
    disabled: true,
  },
}
```

---

## 必須 Story チェックリスト

新しいコンポーネントを作ったら、最低限以下の Story を用意してください：

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

---

## Storybook の起動方法

```bash
# プロジェクトルートで
npm run storybook
# または
pnpm storybook
```

ブラウザで `http://localhost:6006` が開きます。

---

## ファイル配置ルール

```
src/
├── components/
│   └── Button/
│       ├── Button.vue
│       └── Button.stories.ts   # 同じフォルダに配置
└── pages/
    └── items/
        └── sections/
            ├── ItemsTableSection.vue
            └── ItemsTableSection.stories.ts
```

**ルール：Story ファイルはコンポーネントと同じフォルダに配置**

---

## レビュー時のセルフチェック

PR を出す前に確認してください：

- [ ] API / Store / 業務ロジックを import していない
- [ ] props と emit だけで完結している
- [ ] Story が「状態一覧」になっている
- [ ] 複数の状態パターンがある（1 つだけは NG）
- [ ] 画面固有の命名になっていない

---

## よくある NG 例

### ❌ Story が 1 つしかない

```typescript
// ❌ NG
export const Default: Story = {
  args: { /* ... */ }
}
// これだけ
```

→ 最低でも Default, Disabled, Error の 3 パターンは用意する

### ❌ コンポーネント内で API を呼んでいる

```typescript
// ❌ NG: Storybook で動かせない
onMounted(async () => {
  items.value = await fetchItems()
})
```

→ props で受け取る設計に変更する

### ❌ Store を import している

```typescript
// ❌ NG
import { useItemStore } from '@/stores/item'
```

→ Section は Store に依存しない設計にする

---

## Storybook と設計の関係

Storybook は「設計の健康診断」です。

| Storybook で起きること | 意味 |
|----------------------|------|
| Story が書きにくい | 依存が多すぎる |
| props が多すぎる | 責務が広すぎる |
| 状態を説明できない | ロジックが UI に漏れている |
| Story が増えすぎる | コンポーネントを分割すべき |

Storybook で違和感を感じたら、設計を見直すタイミングです。

---

## 実務でのおすすめフロー

1. コンポーネントを作る
2. **まず Storybook で単体起動する**
3. 状態違いを Story として洗い出す
4. props / emit が自然か確認
5. 問題なければ画面に組み込む

「画面を見てから調整」ではなく「**Storybook で固めてから組み込む**」

---

## 次のステップ

Storybook の基本を理解したら、[06_MSW入門](./06_MSW入門.md) で API モックの作り方を学びましょう。
