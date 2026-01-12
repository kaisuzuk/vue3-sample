<!-- ===================================
  TaskFormWidget - タスクフォーム Widget
  
  責務:
  - useTaskForm でフォームロジックを管理
  - TaskFormSection にデータを配布
  - 送信/キャンセル処理
  - ページ遷移
  
  Props:
  - mode: 'create' | 'edit'
  - taskId: 編集対象のタスクID（編集モード時）
=================================== -->

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskForm } from '@/features/tasks/model/useTaskForm'
import { useMasterStore } from '@/features/master/model/useMasterStore'
import { TaskFormSection } from '@/sections/tasks/TaskFormSection'

// ===================================
// Props
// ===================================
interface Props {
  mode: 'create' | 'edit'
  taskId?: string
}

const props = defineProps<Props>()

// ===================================
// Composables
// ===================================
const router = useRouter()

const {
  form,
  errors,
  isSubmitting,
  isLoadingTask,
  isDirty,
  fetchTask,
  addMaterial,
  removeMaterial,
  submit,
  resetForm,
} = useTaskForm({
  isEditMode: props.mode === 'edit',
  taskId: props.taskId,
})

const { workers, machines, materials, units } = useMasterStore()

// ===================================
// Computed
// ===================================

const pageTitle = computed(() => {
  return props.mode === 'create' ? '新規タスク登録' : 'タスク編集'
})

const submitButtonText = computed(() => {
  if (isSubmitting.value) {
    return '送信中...'
  }
  return props.mode === 'create' ? '登録する' : '更新する'
})

// ===================================
// Lifecycle
// ===================================
onMounted(async () => {
  if (props.mode === 'edit' && props.taskId) {
    try {
      await fetchTask(props.taskId)
    } catch {
      // エラーは useTaskForm 内で処理
    }
  }
})

// ===================================
// Event Handlers
// ===================================

async function handleSubmit() {
  const result = await submit()
  if (result) {
    // 成功時は一覧に戻る
    router.push({ name: 'task-list' })
  }
}

function handleCancel() {
  if (isDirty.value) {
    // 変更がある場合は確認
    if (!window.confirm('変更内容が保存されていません。破棄しますか？')) {
      return
    }
  }
  router.push({ name: 'task-list' })
}

function handleFormUpdate(newForm: typeof form.value) {
  form.value = newForm
}
</script>

<template>
  <div class="task-form-widget">
    <!-- ヘッダー -->
    <div class="d-flex align-center mb-6">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        @click="handleCancel"
      />
      <h1 class="text-h5 ml-2">{{ pageTitle }}</h1>
    </div>

    <!-- ローディング（編集モード時） -->
    <div v-if="isLoadingTask" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
      <div class="mt-4 text-grey">タスクを読み込み中...</div>
    </div>

    <!-- エラー表示 -->
    <v-alert
      v-else-if="errors.general"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
    >
      {{ errors.general }}
    </v-alert>

    <!-- フォーム -->
    <template v-else>
      <TaskFormSection
        :form="form"
        :errors="errors"
        :workers="workers"
        :machines="machines"
        :materials="materials"
        :units="units"
        :is-submitting="isSubmitting"
        @update:form="handleFormUpdate"
        @add:material="addMaterial"
        @remove:material="removeMaterial"
      />

      <!-- アクションボタン -->
      <v-divider class="my-6" />

      <div class="d-flex gap-3">
        <v-btn
          color="primary"
          size="large"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          @click="handleSubmit"
        >
          <v-icon start icon="mdi-check" />
          {{ submitButtonText }}
        </v-btn>

        <v-btn
          variant="outlined"
          size="large"
          :disabled="isSubmitting"
          @click="handleCancel"
        >
          キャンセル
        </v-btn>

        <v-spacer />

        <v-btn
          v-if="mode === 'create'"
          variant="text"
          :disabled="isSubmitting"
          @click="resetForm"
        >
          リセット
        </v-btn>
      </div>
    </template>
  </div>
</template>

<style scoped>
.task-form-widget {
  max-width: 900px;
}
</style>
