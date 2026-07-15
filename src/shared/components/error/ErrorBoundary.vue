<template>
  <Transition :css="transition" :name="name" mode="out-in" appear>
    <span v-if="error" key="error" class="error-boundary__state">
      <slot :name="slotName" :error="error" v-bind="slotProps"></slot>
    </span>

    <span v-else key="default" class="error-boundary__state">
      <slot></slot>
    </span>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onErrorCaptured, ref, type Ref } from 'vue'

defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    transition?: boolean
    name?: string
  }>(),
  {
    transition: true,
    name: 'router-view-fade',
  },
)

const error: Ref<Error | undefined> = ref<Error>()

onErrorCaptured((err: Error): boolean => {
  error.value = err
  return false
})

function clearError(): void {
  error.value = undefined
}

const slotProps = computed(() => {
  if (!error.value) return {}
  return { error: error.value, clearError }
})

const slotName = computed(() => (error.value ? 'error' : 'default'))
</script>

<style scoped lang="scss">
.error-boundary__state {
  display: contents;
}
</style>
