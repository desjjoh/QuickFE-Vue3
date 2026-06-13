<template>
  <IconButton
    :icon="icon"
    tone="neutral"
    variant="ghost"
    :label="label"
    @click="themeStore.toggleMode"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Sun } from 'lucide-vue-next'

import { useThemeStore, type ThemeStore } from '@/stores/theme'
import IconButton from '@/shared/components/buttons/IconButton.vue'

const themeStore: ThemeStore = useThemeStore()

const icon = computed(() => (themeStore.isDark ? Sun : Moon))
const label = computed(() => `Switch to ${themeStore.nextMode} mode`)
</script>
