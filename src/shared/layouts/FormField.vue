<template>
  <FlexBox class="form__field" direction="column" :gap="2">
    <FlexBox v-if="$slots.header" justify-content="space-between" align-items="center" :gap="3">
      <slot name="header"></slot>
    </FlexBox>
    <FlexBox direction="column" :gap="1">
      <slot></slot>
      <FlexBox v-if="$slots.footer" justify-content="space-between" align-items="center">
        <slot name="footer"></slot>
      </FlexBox>
    </FlexBox>
    <Transition name="form-error">
      <FlexBox v-if="$slots.error" class="alert__text" align-items="flex-start" :gap="1">
        <CircleAlert class="alert__icon" />
        <BlockText class="alert__message">
          <slot name="error"></slot>
        </BlockText>
      </FlexBox>
    </Transition>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import { CircleAlert } from 'lucide-vue-next'
import BlockText from '@/shared/components/text/BlockText.vue'
</script>

<style lang="scss" scoped>
.alert__text {
  color: color(theme, danger, theme-alpha, 11);

  &:deep(svg) {
    width: 1em;
    height: 1em;
  }
}

.alert__icon {
  flex: 0 0 auto;
  margin-block-start: 0.3rem;
}

.alert__message {
  min-width: 0;
}

.form__field {
  min-width: 0px;
}
</style>
