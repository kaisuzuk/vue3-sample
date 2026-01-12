# Vue2 から Vue3 への変更点

このドキュメントでは、Vue2 + Options API から Vue3 + Composition API への移行で知っておくべき変更点を、**具体的なコード比較**で説明します。

---

## 1. コンポーネントの書き方が変わる

### Vue2（Options API）

```vue
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="updateMessage">更新</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  methods: {
    updateMessage() {
      this.message = 'Updated!'
    }
  }
}
</script>
```

### Vue3（Composition API + script setup）

```vue
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="updateMessage">更新</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello')

const updateMessage = () => {
  message.value = 'Updated!'
}
</script>
```

### 変更ポイント

| Vue2 | Vue3 |
|------|------|
| `export default { ... }` | `<script setup>` |
| `data()` で状態定義 | `ref()` または `reactive()` で定義 |
| `this.message` でアクセス | `message.value` でアクセス（template内では `.value` 不要） |
| `methods: { ... }` | 普通の関数として定義 |

---

## 2. `this` がなくなる

Vue2 では `this` を多用していましたが、Vue3 Composition API では **`this` を使いません**。

### Vue2

```javascript
export default {
  data() {
    return { count: 0 }
  },
  computed: {
    doubled() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log(this.count)
  }
}
```

### Vue3

```typescript
import { ref, computed, onMounted } from 'vue'

const count = ref(0)

const doubled = computed(() => count.value * 2)

const increment = () => {
  count.value++
}

onMounted(() => {
  console.log(count.value)
})
```

### 対応表

| Vue2 | Vue3 |
|------|------|
| `this.xxx` | `xxx.value`（refの場合） |
| `computed: { ... }` | `computed(() => ...)` |
| `watch: { ... }` | `watch(xxx, () => ...)` |
| `mounted()` | `onMounted(() => ...)` |
| `created()` | `<script setup>` 内に直接書く |

---

## 3. Props の定義方法

### Vue2

```javascript
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  }
}
```

### Vue3

```typescript
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// 使用時
console.log(props.title)
console.log(props.count)
```

または、簡易的に書く場合：

```typescript
const props = defineProps<{
  title: string
  count?: number
}>()
```

---

## 4. Emit の定義方法

### Vue2

```javascript
export default {
  methods: {
    handleClick() {
      this.$emit('update', { id: 1, value: 'new' })
    }
  }
}
```

### Vue3

```typescript
const emit = defineEmits<{
  update: [payload: { id: number; value: string }]
}>()

const handleClick = () => {
  emit('update', { id: 1, value: 'new' })
}
```

または、簡易的に書く場合：

```typescript
const emit = defineEmits(['update', 'delete'])

emit('update', { id: 1, value: 'new' })
```

---

## 5. v-model の変更

### Vue2（単一の v-model）

```vue
<!-- 親コンポーネント -->
<CustomInput v-model="text" />

<!-- 子コンポーネント -->
<script>
export default {
  props: ['value'],
  methods: {
    onInput(e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>
```

### Vue3（v-model の引数指定）

```vue
<!-- 親コンポーネント -->
<CustomInput v-model="text" />
<!-- または明示的に -->
<CustomInput v-model:modelValue="text" />

<!-- 子コンポーネント -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>
```

### 変更ポイント

| Vue2 | Vue3 |
|------|------|
| `props: ['value']` | `props: ['modelValue']` |
| `$emit('input', ...)` | `emit('update:modelValue', ...)` |

---

## 6. Vuex → Pinia

### Vue2 + Vuex

```javascript
// store/index.js
export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    asyncIncrement({ commit }) {
      setTimeout(() => commit('increment'), 1000)
    }
  },
  getters: {
    doubled: state => state.count * 2
  }
})

// コンポーネント内
this.$store.state.count
this.$store.commit('increment')
this.$store.dispatch('asyncIncrement')
this.$store.getters.doubled
```

### Vue3 + Pinia

```typescript
// stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  
  const doubled = computed(() => count.value * 2)
  
  const increment = () => {
    count.value++
  }
  
  const asyncIncrement = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    count.value++
  }
  
  return { count, doubled, increment, asyncIncrement }
})

// コンポーネント内
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()
store.count
store.increment()
store.asyncIncrement()
store.doubled
```

### 変更ポイント

| Vuex | Pinia |
|------|-------|
| `state`, `mutations`, `actions`, `getters` を分離 | すべてを関数内で定義 |
| `this.$store` でアクセス | `useXxxStore()` でアクセス |
| `commit` / `dispatch` | 直接メソッドを呼ぶ |

---

## 7. ライフサイクルフックの対応

| Vue2 | Vue3 |
|------|------|
| `beforeCreate` | `<script setup>` 内に直接書く |
| `created` | `<script setup>` 内に直接書く |
| `beforeMount` | `onBeforeMount` |
| `mounted` | `onMounted` |
| `beforeUpdate` | `onBeforeUpdate` |
| `updated` | `onUpdated` |
| `beforeDestroy` | `onBeforeUnmount` |
| `destroyed` | `onUnmounted` |

### 例

```typescript
import { onMounted, onUnmounted } from 'vue'

// created 相当（直接書く）
console.log('コンポーネント初期化')

onMounted(() => {
  console.log('マウント完了')
})

onUnmounted(() => {
  console.log('アンマウント')
})
```

---

## 8. やってはいけないこと（Vue2 の癖）

Vue2 で許容されていた以下のパターンは、Vue3 + CDD では **禁止** です。

### ❌ コンポーネント内で直接 API を呼ぶ

```typescript
// ❌ NG
const fetchData = async () => {
  const res = await axios.get('/api/items')
  items.value = res.data
}
```

→ API 呼び出しは `features/api` や `services` に分離します。

### ❌ Store を直接インポートして状態を変更

```typescript
// ❌ NG
import { useItemStore } from '@/stores/item'

const store = useItemStore()
store.items.push(newItem) // 直接変更
```

→ Store の更新は Store 内のアクションを通じて行います。

### ❌ 親から子の内部状態を直接操作

```typescript
// ❌ NG
const childRef = ref()
childRef.value.internalState = 'new value'
```

→ props と emit でデータをやり取りします。

---

## まとめ

| 観点 | Vue2 | Vue3 |
|------|------|------|
| API スタイル | Options API | Composition API |
| 状態定義 | `data()` | `ref()` / `reactive()` |
| 状態アクセス | `this.xxx` | `xxx.value` |
| 型安全性 | なし（JavaScript） | TypeScript 推奨 |
| 状態管理 | Vuex | Pinia |
| ビルド | Vue CLI | Vite |

---

## 次のステップ

Vue3 の基本的な書き方を理解したら、[02_CDD設計ガイド](./02_CDD設計ガイド.md) に進んで、このプロジェクトの設計思想を学びましょう。
