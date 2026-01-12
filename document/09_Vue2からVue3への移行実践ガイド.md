# Vue2 → Vue3 移行 実践ガイド

このドキュメントでは、既存のVue2画面を **MSW + Storybook + CDD** を活用して Vue3 に移行する具体的な手順を解説します。

「タスク一覧画面」を例に、1から順を追って説明します。

---

## 目次

1. [移行の全体像](#1-移行の全体像)
2. [STEP 0: 既存コードの分析](#step-0-既存コードの分析)
3. [STEP 1: 型定義の作成](#step-1-型定義の作成)
4. [STEP 2: MSW fixtures の作成](#step-2-msw-fixtures-の作成)
5. [STEP 3: MSW handlers の作成](#step-3-msw-handlers-の作成)
6. [STEP 4: Composable の作成](#step-4-composable-の作成)
7. [STEP 5: Section の作成](#step-5-section-の作成)
8. [STEP 6: Story の作成](#step-6-story-の作成)
9. [STEP 7: Widget の作成](#step-7-widget-の作成)
10. [STEP 8: Page の作成](#step-8-page-の作成)
11. [STEP 9: 動作確認](#step-9-動作確認)
12. [チェックリスト](#チェックリスト)

---

## 1. 移行の全体像

### 従来の開発フロー（Vue2）

```
1. 画面全体を作る
2. API ができるのを待つ
3. 画面を動かして確認
4. 不具合があれば修正
```

### 新しい開発フロー（Vue3 + CDD）

```
1. 型定義を作る（API 仕様書から）
2. MSW でモック API を作る（バックエンド不要）
3. Section（部品）を作る
4. Storybook で Section を確認
5. Widget で Section を組み合わせる
6. Page に Widget を配置
7. 動作確認
```

**ポイント:** バックエンド API を待たずに開発を進められる

### 作業順序と成果物

```
STEP 0: 既存コードの分析
    ↓
STEP 1: types/index.ts（型定義）
    ↓
STEP 2: fixtures/xxx.ts（モックデータ）
    ↓
STEP 3: handlers/xxx.handlers.ts（API モック）
    ↓
STEP 4: model/useXxx.ts（ロジック）
    ↓
STEP 5: XxxSection.vue（UI 部品）
    ↓
STEP 6: XxxSection.stories.ts（確認用）
    ↓
STEP 7: XxxWidget.vue（部品の結合）
    ↓
STEP 8: XxxPage.vue（画面）
    ↓
STEP 9: 動作確認
```

---

## STEP 0: 既存コードの分析

### やること

既存のVue2コードから、以下を洗い出します：

1. **API エンドポイント**: どの API を呼んでいるか
2. **データ構造**: どんなデータを扱っているか
3. **状態管理**: どんな状態（state）があるか
4. **ユーザー操作**: どんなイベントがあるか

### 例：タスク一覧画面（Vue2）

```javascript
// 既存の Vue2 コード（例）
export default {
  data() {
    return {
      tasks: [],           // タスク一覧
      loading: false,      // ローディング状態
      selectedTask: null,  // 選択中のタスク
      page: 1,             // ページ番号
      itemsPerPage: 10,    // 1ページあたりの件数
    }
  },
  mounted() {
    this.fetchTasks()
  },
  methods: {
    async fetchTasks() {
      this.loading = true
      const res = await axios.get('/api/tasks', {
        params: { page: this.page, limit: this.itemsPerPage }
      })
      this.tasks = res.data.items
      this.loading = false
    },
    selectTask(task) {
      this.selectedTask = task
    },
    async deleteTask(id) {
      await axios.delete(`/api/tasks/${id}`)
      this.fetchTasks()
    }
  }
}
```

### 分析結果をメモする

| 項目 | 内容 |
|------|------|
| **API** | `GET /api/tasks`, `DELETE /api/tasks/:id` |
| **データ** | Task（id, workDate, workers, machine, materials） |
| **状態** | tasks, loading, selectedTask, page, itemsPerPage |
| **操作** | 一覧取得、選択、削除 |

---

## STEP 1: 型定義の作成

### やること

API レスポンスやデータ構造の型を定義します。

### なぜ先に型を作るのか

- API 仕様書があれば、バックエンドを待たずに作れる
- 型があると、後続の作業でエディタが補完してくれる
- 型がドキュメントの役割を果たす

### 作成するファイル

```
src/features/tasks/types/index.ts
```

### コード例

```typescript
// src/features/tasks/types/index.ts

/** 作業者（タスクに紐づく簡易版） */
export interface TaskWorker {
  id: string
  name: string
}

/** 機械（タスクに紐づく簡易版） */
export interface TaskMachine {
  id: string
  name: string
}

/** 材料（使用量付き） */
export interface TaskMaterial {
  id: string
  name: string
  amount: number
  unitId: string
  unitName: string
}

/** タスク */
export interface Task {
  id: string
  workDate: string  // YYYY-MM-DD
  workers: TaskWorker[]
  machine: TaskMachine
  materials: TaskMaterial[]
  createdAt: string
  updatedAt: string
}

/** タスク一覧 API レスポンス */
export interface TaskListResponse {
  items: Task[]
  total: number
  page: number
  limit: number
}

/** タスク登録リクエスト */
export interface CreateTaskRequest {
  workDate: string
  workerIds: string[]
  machineId: string
  materials: {
    id: string
    amount: number
    unitId: string
  }[]
}
```

### ポイント

- API 仕様書やバックエンドの Swagger から型を起こす
- `Task` と `CreateTaskRequest` は別の型にする（レスポンスとリクエストは違う）
- 迷ったら「API が返す形」に合わせる

---

## STEP 2: MSW fixtures の作成

### やること

API モックで返すテストデータを作成します。

### なぜ fixtures を分けるのか

- handlers に直接書くとコードが長くなる
- 複数の handlers で同じデータを使いまわせる
- テストデータのバリエーションを増やしやすい

### 作成するファイル

```
fe-libs/mocks/fixtures/tasks/
├── index.ts
├── tasks.normal.ts    # 通常データ（15件程度）
└── tasks.large.ts     # 大量データ（100件）
```

### コード例

```typescript
// fe-libs/mocks/fixtures/tasks/tasks.normal.ts
import type { Task } from '@/features/tasks/types'

export const normalTasks: Task[] = [
  {
    id: 'task-001',
    workDate: '2024-01-15',
    workers: [
      { id: 'w1', name: '山田太郎' },
      { id: 'w2', name: '鈴木花子' },
    ],
    machine: { id: 'm1', name: '掘削機A' },
    materials: [
      { id: 'mat1', name: 'セメント', amount: 100, unitId: 'u1', unitName: 'kg' },
    ],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'task-002',
    workDate: '2024-01-16',
    workers: [
      { id: 'w3', name: '佐藤次郎' },
    ],
    machine: { id: 'm2', name: 'クレーンB' },
    materials: [],
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
  },
  // ... 15件程度用意
]
```

```typescript
// fe-libs/mocks/fixtures/tasks/index.ts
export { normalTasks } from './tasks.normal'
export { largeTasks } from './tasks.large'
```

### ポイント

- 最低限 5〜15 件程度のデータを用意
- 境界値テスト用に「0件」「大量」のパターンも用意
- 実際の業務データに近い値を入れる（「テスト1」ではなく「山田太郎」）

---

## STEP 3: MSW handlers の作成

### やること

API エンドポイントごとに、リクエストを受け取ってレスポンスを返す処理を書きます。

### 作成するファイル

```
fe-libs/mocks/handlers/tasks.handlers.ts
```

### コード例

```typescript
// fe-libs/mocks/handlers/tasks.handlers.ts
import { http, HttpResponse, delay } from 'msw'
import type { Task, TaskListResponse, CreateTaskRequest } from '@/features/tasks/types'
import { normalTasks } from '../fixtures/tasks'

// メモリ上のデータ（CRUD 操作で変更される）
let tasks: Task[] = [...normalTasks]

export const tasksHandlers = [
  // ========== GET /api/tasks（一覧取得） ==========
  http.get('/api/tasks', async ({ request }) => {
    await delay(300)  // 本番に近いレイテンシを再現

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10

    // ページネーション
    const start = (page - 1) * limit
    const end = start + limit
    const items = tasks.slice(start, end)

    const response: TaskListResponse = {
      items,
      total: tasks.length,
      page,
      limit,
    }

    return HttpResponse.json(response)
  }),

  // ========== GET /api/tasks/:id（詳細取得） ==========
  http.get('/api/tasks/:id', async ({ params }) => {
    await delay(200)

    const task = tasks.find(t => t.id === params.id)
    if (!task) {
      return HttpResponse.json(
        { message: 'タスクが見つかりません' },
        { status: 404 }
      )
    }

    return HttpResponse.json(task)
  }),

  // ========== POST /api/tasks（新規作成） ==========
  http.post('/api/tasks', async ({ request }) => {
    await delay(500)

    const body = await request.json() as CreateTaskRequest

    // バリデーション例
    if (!body.workDate) {
      return HttpResponse.json(
        { message: '作業日は必須です' },
        { status: 400 }
      )
    }

    // 新しいタスクを作成
    const newTask: Task = {
      id: `task-${Date.now()}`,
      workDate: body.workDate,
      workers: body.workerIds.map(id => ({ id, name: `作業者${id}` })),
      machine: { id: body.machineId, name: `機械${body.machineId}` },
      materials: body.materials.map(m => ({
        ...m,
        name: `材料${m.id}`,
        unitName: '個',
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    tasks.unshift(newTask)  // 先頭に追加

    return HttpResponse.json(newTask, { status: 201 })
  }),

  // ========== DELETE /api/tasks/:id（削除） ==========
  http.delete('/api/tasks/:id', async ({ params }) => {
    await delay(300)

    const index = tasks.findIndex(t => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json(
        { message: 'タスクが見つかりません' },
        { status: 404 }
      )
    }

    tasks.splice(index, 1)

    return HttpResponse.json({ success: true })
  }),
]
```

### ポイント

- `delay()` を入れて本番に近いレイテンシを再現
- エラーパターン（404, 400）も実装する
- メモリ上のデータを更新することで CRUD を再現

---

## STEP 4: Composable の作成

### やること

API 呼び出しと状態管理のロジックを Composable として切り出します。

### なぜ Composable を分けるのか

- コンポーネントから「ロジック」を分離できる
- テストしやすくなる
- 複数のコンポーネントで再利用できる

### 作成するファイル

```
src/features/tasks/model/useTaskList.ts
```

### コード例

```typescript
// src/features/tasks/model/useTaskList.ts
import { ref, computed } from 'vue'
import type { Task, TaskListResponse } from '../types'

export function useTaskList() {
  // ===== State =====
  const tasks = ref<Task[]>([])
  const total = ref(0)
  const page = ref(1)
  const itemsPerPage = ref(10)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedTaskId = ref<string | null>(null)

  // ===== Computed =====
  const selectedTask = computed(() =>
    tasks.value.find(t => t.id === selectedTaskId.value) ?? null
  )

  const totalPages = computed(() =>
    Math.ceil(total.value / itemsPerPage.value)
  )

  // ===== Actions =====
  async function fetchTasks() {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        page: String(page.value),
        limit: String(itemsPerPage.value),
      })

      const res = await fetch(`/api/tasks?${params}`)
      if (!res.ok) throw new Error('取得に失敗しました')

      const data: TaskListResponse = await res.json()
      tasks.value = data.items
      total.value = data.total
    } catch (e) {
      error.value = e instanceof Error ? e.message : '不明なエラー'
    } finally {
      isLoading.value = false
    }
  }

  function selectTask(taskId: string | null) {
    selectedTaskId.value = taskId
  }

  async function deleteTask(taskId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('削除に失敗しました')

      // 選択解除
      if (selectedTaskId.value === taskId) {
        selectedTaskId.value = null
      }

      // 一覧を再取得
      await fetchTasks()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : '削除エラー'
      return false
    }
  }

  function changePage(newPage: number) {
    page.value = newPage
    fetchTasks()
  }

  // ===== Return =====
  return {
    // State
    tasks,
    total,
    page,
    itemsPerPage,
    isLoading,
    error,
    selectedTask,
    selectedTaskId,
    totalPages,
    // Actions
    fetchTasks,
    selectTask,
    deleteTask,
    changePage,
  }
}
```

### ポイント

- State（データ）と Actions（操作）を明確に分ける
- `return` で公開するものを明示する
- エラーハンドリングを含める

---

## STEP 5: Section の作成

### やること

UI 部品（Section）を作成します。Section は **props で完結** させます。

### なぜ props で完結させるのか

- Storybook で単体確認できる
- API や Store に依存しないので再利用しやすい
- テストしやすい

### 作成するファイル

```
src/sections/tasks/TaskTableSection/
├── TaskTableSection.vue
└── index.ts
```

### コード例

```vue
<!-- src/sections/tasks/TaskTableSection/TaskTableSection.vue -->
<script setup lang="ts">
import type { Task } from '@/features/tasks/types'

// ===== Props（入力） =====
interface Props {
  tasks: Task[]
  isLoading?: boolean
  selectedTaskId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  selectedTaskId: null,
})

// ===== Emits（出力） =====
const emit = defineEmits<{
  select: [taskId: string]
}>()

// ===== Handlers =====
function handleRowClick(task: Task) {
  emit('select', task.id)
}

// ===== Table =====
const headers = [
  { title: '作業日', key: 'workDate' },
  { title: '作業者', key: 'workers' },
  { title: '機械', key: 'machine' },
  { title: '材料', key: 'materials' },
]
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="tasks"
    :loading="isLoading"
    item-value="id"
    hover
    @click:row="(_, { item }) => handleRowClick(item)"
  >
    <!-- 作業者カラム -->
    <template #item.workers="{ item }">
      {{ item.workers.map(w => w.name).join(', ') }}
    </template>

    <!-- 機械カラム -->
    <template #item.machine="{ item }">
      {{ item.machine.name }}
    </template>

    <!-- 材料カラム -->
    <template #item.materials="{ item }">
      <template v-if="item.materials.length > 0">
        {{ item.materials[0].name }}
        <span v-if="item.materials.length > 1" class="text-grey">
          他{{ item.materials.length - 1 }}件
        </span>
      </template>
      <span v-else class="text-grey">-</span>
    </template>

    <!-- 空状態 -->
    <template #no-data>
      <div class="text-center py-8">
        <v-icon size="48" color="grey-lighten-1">mdi-clipboard-text-outline</v-icon>
        <p class="text-grey mt-2">タスクがありません</p>
      </div>
    </template>
  </v-data-table>
</template>
```

### ポイント

- **API を呼ばない**（props で受け取る）
- **Store を import しない**
- **router を使わない**（親に emit で通知）
- Props と Emits を明確に定義する

---

## STEP 6: Story の作成

### やること

Section を Storybook で確認するための Story を作成します。

### なぜ Story を作るのか

- 画面を起動せずに UI を確認できる
- 複数の状態（ローディング、空、エラー）を簡単に切り替えられる
- レビュー時に「どんな状態があるか」を共有できる

### 作成するファイル

```
src/sections/tasks/TaskTableSection/TaskTableSection.stories.ts
```

### コード例

```typescript
// src/sections/tasks/TaskTableSection/TaskTableSection.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import TaskTableSection from './TaskTableSection.vue'
import type { Task } from '@/features/tasks/types'

const meta: Meta<typeof TaskTableSection> = {
  title: 'sections/tasks/TaskTableSection',
  component: TaskTableSection,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TaskTableSection>

// ===== モックデータ =====
const mockTasks: Task[] = [
  {
    id: 'task-001',
    workDate: '2024-01-15',
    workers: [{ id: 'w1', name: '山田太郎' }, { id: 'w2', name: '鈴木花子' }],
    machine: { id: 'm1', name: '掘削機A' },
    materials: [{ id: 'mat1', name: 'セメント', amount: 100, unitId: 'u1', unitName: 'kg' }],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'task-002',
    workDate: '2024-01-16',
    workers: [{ id: 'w3', name: '佐藤次郎' }],
    machine: { id: 'm2', name: 'クレーンB' },
    materials: [],
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
  },
]

// ===== Stories =====

/** 通常表示（データあり） */
export const Default: Story = {
  args: {
    tasks: mockTasks,
    isLoading: false,
  },
}

/** ローディング中 */
export const Loading: Story = {
  args: {
    tasks: [],
    isLoading: true,
  },
}

/** データなし */
export const Empty: Story = {
  args: {
    tasks: [],
    isLoading: false,
  },
}

/** 大量データ（スクロール確認） */
export const ManyItems: Story = {
  args: {
    tasks: Array.from({ length: 50 }, (_, i) => ({
      id: `task-${i}`,
      workDate: `2024-01-${String(i + 1).padStart(2, '0')}`,
      workers: [{ id: `w${i}`, name: `作業者${i + 1}` }],
      machine: { id: `m${i % 3}`, name: `機械${String.fromCharCode(65 + (i % 3))}` },
      materials: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    isLoading: false,
  },
}

/** 行選択状態 */
export const WithSelection: Story = {
  args: {
    tasks: mockTasks,
    isLoading: false,
    selectedTaskId: 'task-001',
  },
}
```

### Storybook で確認する

```bash
pnpm storybook
```

ブラウザで http://localhost:6006 を開き、サイドバーから `sections/tasks/TaskTableSection` を選択。

各 Story を切り替えて、以下を確認：

- [ ] Default: データが正しく表示される
- [ ] Loading: ローディング表示が出る
- [ ] Empty: 空状態のメッセージが出る
- [ ] ManyItems: スクロールが正常に動く
- [ ] WithSelection: 選択行がハイライトされる

---

## STEP 7: Widget の作成

### やること

Section を組み合わせて、画面の一部を構成する Widget を作成します。

### Widget の役割

- 複数の Section を組み合わせる
- Composable を呼び出してデータを取得
- Section に props を渡す

### 作成するファイル

```
src/widgets/tasks/TaskListWidget/
├── TaskListWidget.vue
└── index.ts
```

### コード例

```vue
<!-- src/widgets/tasks/TaskListWidget/TaskListWidget.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { TaskTableSection } from '@/sections/tasks'
import { TaskDetailSidebar } from '@/widgets/tasks'
import { useTaskList } from '@/features/tasks/model'

// ===== Composable =====
const {
  tasks,
  isLoading,
  selectedTask,
  selectedTaskId,
  fetchTasks,
  selectTask,
  deleteTask,
} = useTaskList()

// ===== Lifecycle =====
onMounted(() => {
  fetchTasks()
})

// ===== Handlers =====
function handleSelect(taskId: string) {
  selectTask(taskId)
}

function handleCloseSidebar() {
  selectTask(null)
}

async function handleDelete(taskId: string) {
  const success = await deleteTask(taskId)
  if (success) {
    // 成功通知などを出す
  }
}
</script>

<template>
  <v-row>
    <!-- メインコンテンツ -->
    <v-col :cols="selectedTask ? 8 : 12">
      <TaskTableSection
        :tasks="tasks"
        :is-loading="isLoading"
        :selected-task-id="selectedTaskId"
        @select="handleSelect"
      />
    </v-col>

    <!-- サイドバー（選択時のみ表示） -->
    <v-col v-if="selectedTask" cols="4">
      <TaskDetailSidebar
        :task="selectedTask"
        @close="handleCloseSidebar"
        @delete="handleDelete"
      />
    </v-col>
  </v-row>
</template>
```

### ポイント

- Composable からデータを取得
- Section に props を渡す
- イベントを受け取って処理

---

## STEP 8: Page の作成

### やること

Widget を配置して、ルーティングに対応する Page を作成します。

### Page の役割

- Widget を配置する
- ヘッダーやレイアウトを設定
- ルーティングパラメータを受け取る

### 作成するファイル

```
src/pages/tasks/TaskListPage.vue
```

### コード例

```vue
<!-- src/pages/tasks/TaskListPage.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AppHeader } from '@/shared/ui'
import { TaskListWidget } from '@/widgets/tasks'

const router = useRouter()

function handleCreate() {
  router.push('/tasks/new')
}
</script>

<template>
  <div>
    <AppHeader title="タスク管理">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="handleCreate">
          新規登録
        </v-btn>
      </template>
    </AppHeader>

    <TaskListWidget />
  </div>
</template>
```

### ポイント

- Page はシンプルに保つ（Widget に処理を任せる）
- ルーティングは Page で扱う

---

## STEP 9: 動作確認

### 開発サーバーを起動

```bash
pnpm dev
```

ブラウザで http://localhost:5173/tasks を開きます。

### 確認項目

| 確認項目 | 期待動作 |
|----------|----------|
| 一覧表示 | タスク一覧が表示される |
| ローディング | 読み込み中にスピナーが表示される |
| 行選択 | 行クリックでサイドバーが開く |
| 削除 | 削除ボタンで確認ダイアログ → 削除される |
| ページ遷移 | 新規登録ボタンで登録画面に遷移 |

### MSW が動いているか確認

ブラウザの開発者ツール → Network タブで、`/api/tasks` へのリクエストが返ってきていれば OK。

---

## チェックリスト

移行作業の完了確認に使ってください。

### STEP 1: 型定義

- [ ] API レスポンスの型を定義した
- [ ] リクエストの型を定義した
- [ ] types/index.ts から export した

### STEP 2-3: MSW

- [ ] fixtures にモックデータを作成した
- [ ] handlers に API モックを作成した
- [ ] handlers/index.ts に登録した
- [ ] 開発サーバーで MSW が動作することを確認した

### STEP 4: Composable

- [ ] 状態（ref）を定義した
- [ ] アクション（関数）を定義した
- [ ] エラーハンドリングを実装した
- [ ] model/index.ts から export した

### STEP 5: Section

- [ ] Props で必要なデータを受け取る設計にした
- [ ] Emits でイベントを通知する設計にした
- [ ] API / Store / Router に依存していない
- [ ] sections/xxx/index.ts から export した

### STEP 6: Story

- [ ] Default Story を作成した
- [ ] Loading Story を作成した
- [ ] Empty Story を作成した
- [ ] Error Story を作成した（該当する場合）
- [ ] Storybook で全パターンを確認した

### STEP 7: Widget

- [ ] Composable を呼び出している
- [ ] Section に props を渡している
- [ ] widgets/xxx/index.ts から export した

### STEP 8: Page

- [ ] Widget を配置した
- [ ] ヘッダーを設定した
- [ ] router に登録した

### STEP 9: 動作確認

- [ ] 開発サーバーで動作確認した
- [ ] 主要な操作（CRUD）が動作する
- [ ] エラー時の挙動を確認した

---

## まとめ

### 移行のポイント

| ポイント | 説明 |
|----------|------|
| **型から始める** | API 仕様書があれば即着手可能 |
| **MSW でバックエンド不要** | API を待たずに開発を進められる |
| **Section は props で完結** | Storybook で確認しやすい設計 |
| **Story で状態を網羅** | エッジケースを見落とさない |
| **Widget で結合** | Section + Composable の接続点 |

### 作業時間の目安（1画面あたり）

| ステップ | 目安時間 |
|----------|----------|
| STEP 0: 分析 | 30分 |
| STEP 1: 型定義 | 30分 |
| STEP 2-3: MSW | 1〜2時間 |
| STEP 4: Composable | 1時間 |
| STEP 5: Section | 2時間 |
| STEP 6: Story | 1時間 |
| STEP 7-8: Widget/Page | 1時間 |
| STEP 9: 動作確認 | 30分 |
| **合計** | **7〜9時間** |

慣れてくると短縮できます。最初の1画面は時間をかけて丁寧に進めましょう。
