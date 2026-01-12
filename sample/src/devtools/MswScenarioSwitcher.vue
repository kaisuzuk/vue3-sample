<!-- ===================================
  MswScenarioSwitcher - シナリオ切り替えUI
  
  責務:
  - 開発時のみ表示されるシナリオ切り替えボタン
  - 画面右下に固定表示
  
  使い方:
  - App.vue に配置
  - 開発環境でのみ表示
=================================== -->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  getCurrentScenario,
  switchScenario,
  getAvailableScenarios,
  type TaskScenarioId,
} from '@fe-libs/mocks/scenarioManager'
import { worker } from '@/mocks/browser'

// ===================================
// State
// ===================================

const isOpen = ref(false)
const currentScenario = ref<TaskScenarioId>('normal')
const scenarios = getAvailableScenarios()
const isLoading = ref(false)

// ===================================
// Computed
// ===================================

const currentScenarioLabel = computed(() => {
  const scenario = scenarios.find(s => s.id === currentScenario.value)
  return scenario?.description || currentScenario.value
})

// ===================================
// Lifecycle
// ===================================

onMounted(() => {
  // 現在のシナリオを取得
  currentScenario.value = getCurrentScenario()
})

// ===================================
// Actions
// ===================================

async function handleScenarioChange(scenarioId: TaskScenarioId) {
  isLoading.value = true
  try {
    await switchScenario(worker, scenarioId)
    currentScenario.value = scenarioId
    
    // ページをリロードして変更を反映
    window.location.reload()
  } finally {
    isLoading.value = false
  }
}

function togglePanel() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="msw-scenario-switcher">
    <!-- トグルボタン -->
    <v-btn
      icon
      size="small"
      color="grey-darken-3"
      class="toggle-btn"
      @click="togglePanel"
    >
      <v-icon>mdi-flask-outline</v-icon>
      <v-tooltip activator="parent" location="left">
        MSW シナリオ切り替え
      </v-tooltip>
    </v-btn>

    <!-- パネル -->
    <v-card
      v-if="isOpen"
      class="scenario-panel"
      elevation="8"
      width="280"
    >
      <v-card-title class="text-subtitle-1 d-flex align-center">
        <v-icon class="mr-2" size="small">mdi-flask-outline</v-icon>
        MSW シナリオ
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-2">
        <v-list density="compact" nav>
          <v-list-item
            v-for="scenario in scenarios"
            :key="scenario.id"
            :active="scenario.id === currentScenario"
            :disabled="isLoading"
            color="primary"
            rounded
            @click="handleScenarioChange(scenario.id)"
          >
            <template #prepend>
              <v-icon
                :icon="scenario.id === currentScenario ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
                size="small"
              />
            </template>
            <v-list-item-title class="text-body-2">
              {{ scenario.description }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-2">
        <span class="text-caption text-grey">
          現在: {{ currentScenarioLabel }}
        </span>
        <v-spacer />
        <v-btn
          size="small"
          variant="text"
          @click="isOpen = false"
        >
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.msw-scenario-switcher {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
}

.scenario-panel {
  position: fixed;
  bottom: 60px;
  right: 16px;
}
</style>
