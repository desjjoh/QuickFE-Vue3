<template>
  <Transition :css="transition" :name="name" mode="out-in" appear>
    <FlexBox grow v-if="error" key="error" class="error-boundary__state">
      <slot name="error" :error="error" :clear-error="clearError"></slot>
    </FlexBox>

    <FlexBox grow v-else key="default" class="error-boundary__state">
      <slot></slot>
    </FlexBox>
  </Transition>
</template>

<script setup lang="ts">
import { onErrorCaptured, ref, type Ref } from 'vue'
import FlexBox from '../flex/FlexBox.vue'

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
</script>

<style scoped lang="scss">
.error-boundary__state {
  height: 100%;
}
</style>
