<!-- ===================================
  TaskFilterDialog - タスク絞り込みダイアログ
  
  責務:
  - 絞り込み条件の入力UI
  - 日付範囲、作業者、材料での絞り込み
  
  CDD での位置づけ:
  - Section レイヤー（入力フォームを構成するUI）
=================================== -->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Worker, Material } from '@/features/master/types'

// ===================================
// Props / Emits
// ===================================

interface Props {
  /** ダイアログ表示状態 */
  modelValue: boolean
  /** 作業者マスタ */
  workers: Worker[]
  /** 材料マスタ */
  materials: Material[]
  /** 現在のフィルター値 */
  currentFilter: FilterValues
}

interface FilterValues {
  workDateFrom: string
  workDateTo: string
  workerIds: string[]
  materialIds: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'apply': [filter: FilterValues]
  'clear': []
}>()

// ===================================
// State
// ===================================

// 作業中のフィルター値（確定前）
const localFilter = ref<FilterValues>({
  workDateFrom: '',
  workDateTo: '',
  workerIds: [],
  materialIds: [],
})

// ===================================
// Computed
// ===================================

/**
 * ダイアログの開閉状態
 */
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

/**
 * フィルターが設定されているか
 */
const hasFilter = computed(() => {
  return (
    localFilter.value.workDateFrom !== '' ||
    localFilter.value.workDateTo !== '' ||
    localFilter.value.workerIds.length > 0 ||
    localFilter.value.materialIds.length > 0
  )
})

/**
 * 作業者の選択肢
 */
const workerItems = computed(() => 
  props.workers.map(w => ({
    title: w.name,
    value: w.id,
  }))
)

/**
 * 材料の選択肢
 */
const materialItems = computed(() =>
  props.materials.map(m => ({
    title: m.name,
    value: m.id,
  }))
)

// ===================================
// Watchers
// ===================================

// ダイアログが開いたときに現在のフィルター値を反映
watch(isOpen, (open) => {
  if (open) {
    localFilter.value = { ...props.currentFilter }
  }
})

// ===================================
// Actions
// ===================================

/**
 * 適用
 */
function handleApply() {
  emit('apply', { ...localFilter.value })
  isOpen.value = false
}

/**
 * クリア
 */
function handleClear() {
  localFilter.value = {
    workDateFrom: '',
    workDateTo: '',
    workerIds: [],
    materialIds: [],
  }
  emit('clear')
  isOpen.value = false
}

/**
 * キャンセル
 */
function handleCancel() {
  isOpen.value = false
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-filter-variant</v-icon>
        絞り込み条件
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-container>
          <!-- 作業日範囲 -->
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">作業日</div>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="localFilter.workDateFrom"
                label="開始日"
                type="date"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="localFilter.workDateTo"
                label="終了日"
                type="date"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
            </v-col>
          </v-row>

          <!-- 作業者 -->
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">作業者</div>
              <v-select
                v-model="localFilter.workerIds"
                :items="workerItems"
                label="作業者を選択"
                variant="outlined"
                density="compact"
                multiple
                chips
                closable-chips
                clearable
                hide-details
              />
            </v-col>
          </v-row>

          <!-- 材料 -->
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">使用材料</div>
              <v-select
                v-model="localFilter.materialIds"
                :items="materialItems"
                label="材料を選択"
                variant="outlined"
                density="compact"
                multiple
                chips
                closable-chips
                clearable
                hide-details
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-btn
          variant="text"
          color="error"
          :disabled="!hasFilter"
          @click="handleClear"
        >
          クリア
        </v-btn>
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
        >
          キャンセル
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleApply"
        >
          適用
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
