<template>
  <div class="container">
    <FlexBox class="alert" align-items="center" wrap="nowrap" :gap="3">
      <BlockText text-align="center" element="h3">
        {{ props.message }}
      </BlockText>
    </FlexBox>
  </div>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

const props = defineProps<{ message: string }>()
</script>

<style lang="scss" scoped>
svg {
  flex: none;
}

.container {
  position: relative;
  height: 100%;
  display: grid;
  place-items: center;
  padding: space(5);
}

.alert {
  max-width: space(135);
}
</style>
