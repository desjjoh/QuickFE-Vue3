<template>
  <FullContainer>
    <FlexBox class="alert" align-items="center" wrap="nowrap" :gap="3">
      <BlockText text-align="center" element="h3">
        {{ props.message }}
      </BlockText>
    </FlexBox>
  </FullContainer>
</template>

<script setup lang="ts">
import FullContainer from '@/shared/components/container/FullContainer.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

const props = defineProps<{ message: string }>()
</script>

<style lang="scss" scoped>
svg {
  flex: none;
}

.alert {
  max-width: space(135);
}
</style>
