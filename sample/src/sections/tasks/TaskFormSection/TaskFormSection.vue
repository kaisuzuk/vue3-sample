<!-- ===================================
  TaskFormSection - タスクフォーム（Presentational）
  
  責務:
  - フォーム入力UIの提供
  - バリデーションエラーの表示
  
  Props:
  - form: フォーム入力値
  - errors: バリデーションエラー
  - workers: 作業者マスタ
  - machines: 機械マスタ
  - materials: 材料マスタ
  - units: 単位マスタ
  - isSubmitting: 送信中フラグ
  
  Events:
  - update:form: フォーム値変更時
  - add:material: 材料追加時
  - remove:material: 材料削除時
=================================== -->

<script setup lang="ts">
import { computed } from 'vue'
import type { TaskFormValues, TaskFormErrors, FormMaterial } from '@/features/tasks/model/useTaskForm'
import type { Worker, Machine, Material, Unit } from '@/features/master/types'

// ===================================
// Props / Emits
// ===================================
interface Props {
  form: TaskFormValues
  errors: TaskFormErrors
  workers: Worker[]
  machines: Machine[]
  materials: Material[]
  units: Unit[]
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
})

const emit = defineEmits<{
  'update:form': [form: TaskFormValues]
  'add:material': []
  'remove:material': [index: number]
}>()

// ===================================
// Form 更新ヘルパー
// ===================================

function updateField<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
  emit('update:form', { ...props.form, [key]: value })
}

function updateMaterial(index: number, field: keyof FormMaterial, value: string | number | null) {
  const newMaterials = [...props.form.materials]
  newMaterials[index] = { ...newMaterials[index], [field]: value }
  
  // 材料選択時に単位を自動設定
  if (field === 'id' && typeof value === 'string') {
    const material = props.materials.find((m) => m.id === value)
    if (material) {
      newMaterials[index].unitId = material.defaultUnitId
    }
  }
  
  emit('update:form', { ...props.form, materials: newMaterials })
}

// ===================================
// Computed
// ===================================

/**
 * 作業者選択用のアイテム
 */
const workerItems = computed(() =>
  props.workers.map((w) => ({
    title: w.name,
    value: w.id,
  }))
)

/**
 * 機械選択用のアイテム
 */
const machineItems = computed(() =>
  props.machines.map((m) => ({
    title: m.name,
    value: m.id,
  }))
)

/**
 * 材料選択用のアイテム
 */
const materialItems = computed(() =>
  props.materials.map((m) => ({
    title: m.name,
    value: m.id,
  }))
)

/**
 * 単位名を取得
 */
function getUnitName(unitId: string): string {
  const unit = props.units.find((u) => u.id === unitId)
  return unit?.name ?? ''
}

// ===================================
// Events
// ===================================

function handleAddMaterial() {
  emit('add:material')
}

function handleRemoveMaterial(index: number) {
  emit('remove:material', index)
}
</script>

<template>
  <v-form class="task-form-section">
    <!-- 作業日 -->
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          :model-value="form.workDate"
          label="作業日"
          type="date"
          :error-messages="errors.workDate"
          :disabled="isSubmitting"
          required
          @update:model-value="updateField('workDate', $event)"
        />
      </v-col>
    </v-row>

    <!-- 作業者 -->
    <v-row>
      <v-col cols="12">
        <v-select
          :model-value="form.workerIds"
          :items="workerItems"
          label="作業者"
          multiple
          chips
          closable-chips
          :error-messages="errors.workerIds"
          :disabled="isSubmitting"
          hint="1名以上選択してください"
          persistent-hint
          @update:model-value="updateField('workerIds', $event)"
        />
      </v-col>
    </v-row>

    <!-- 使用機械 -->
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          :model-value="form.machineId"
          :items="machineItems"
          label="使用機械"
          :error-messages="errors.machineId"
          :disabled="isSubmitting"
          clearable
          @update:model-value="updateField('machineId', $event ?? '')"
        />
      </v-col>
    </v-row>

    <!-- 使用材料 -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-2">
          <h3 class="text-subtitle-1">使用材料</h3>
          <v-spacer />
          <v-btn
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
            :disabled="isSubmitting"
            @click="handleAddMaterial"
          >
            材料を追加
          </v-btn>
        </div>

        <v-alert
          v-if="errors.materials"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-2"
        >
          {{ errors.materials }}
        </v-alert>

        <!-- 材料リスト -->
        <div v-if="form.materials.length > 0" class="materials-list">
          <v-card
            v-for="(material, index) in form.materials"
            :key="index"
            variant="outlined"
            class="mb-2 pa-3"
          >
            <v-row align="center">
              <!-- 材料選択 -->
              <v-col cols="12" md="5">
                <v-select
                  :model-value="material.id"
                  :items="materialItems"
                  label="材料"
                  density="compact"
                  hide-details
                  :disabled="isSubmitting"
                  @update:model-value="updateMaterial(index, 'id', $event)"
                />
              </v-col>

              <!-- 使用量 -->
              <v-col cols="8" md="4">
                <v-text-field
                  :model-value="material.amount"
                  label="使用量"
                  type="number"
                  density="compact"
                  hide-details
                  :disabled="isSubmitting"
                  :suffix="getUnitName(material.unitId)"
                  @update:model-value="updateMaterial(index, 'amount', $event ? Number($event) : null)"
                />
              </v-col>

              <!-- 削除ボタン -->
              <v-col cols="4" md="3" class="text-right">
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  size="small"
                  :disabled="isSubmitting"
                  @click="handleRemoveMaterial(index)"
                />
              </v-col>
            </v-row>
          </v-card>
        </div>

        <!-- 材料なしメッセージ -->
        <v-alert
          v-else
          type="info"
          variant="tonal"
          density="compact"
        >
          使用材料がありません。「材料を追加」ボタンで追加できます。
        </v-alert>
      </v-col>
    </v-row>
  </v-form>
</template>

<style scoped>
.task-form-section {
  max-width: 800px;
}

.materials-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
