<script setup lang="ts">
import { onMounted } from 'vue'
import { useMasterStore } from '@/features/master/model/useMasterStore'
import MswScenarioSwitcher from '@/devtools/MswScenarioSwitcher.vue'

const { initializeMasters } = useMasterStore()

// 開発環境かどうか
const isDev = import.meta.env.DEV

onMounted(async () => {
  await initializeMasters()
})
</script>

<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>

    <!-- 開発環境でのみ MSW シナリオ切り替えUIを表示 -->
    <MswScenarioSwitcher v-if="isDev" />
  </v-app>
</template>
