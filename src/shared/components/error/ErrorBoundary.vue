<template>
  <Transition :name="name" mode="out-in" appear>
    <div v-if="error" key="error" class="error-boundary__state">
      <slot :name="slotName" :error="error" v-bind="slotProps"></slot>
    </div>

    <div v-else key="default" class="error-boundary__state">
      <slot></slot>
    </div>
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
  display: block;
  min-width: 0;
  height: 100%;
}
</style>
