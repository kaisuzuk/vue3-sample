<script setup lang="ts">
import { onMounted } from 'vue'
import { useMasterStore } from '@/features/master/model/useMasterStore'

const { initializeMasters } = useMasterStore()

onMounted(async () => {
  await initializeMasters()
})
</script>

<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
