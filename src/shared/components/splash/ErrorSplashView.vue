<template>
  <FullContainer>
    <FlexBox direction="column" :gap="6" class="error-splash" role="alert">
      <FlexBox direction="column" :gap="2">
        <BlockText class="error-splash__eyebrow" size="sm" weight="semibold">
          {{ errorName }}
        </BlockText>

        <FlexBox direction="column" :gap="1">
          <BlockText element="h3">
            {{ $t('app.error.title') }}
          </BlockText>

          <i18n-t class="error-splash__message" keypath="app.error.message" tag="p" scope="global">
            <InlineText element="q">{{ $t('common.reload') }}</InlineText>
          </i18n-t>
        </FlexBox>
      </FlexBox>

      <FlexBox justify-content="flex-end" :gap="2" wrap="wrap">
        <BaseButton type="button" @click="handleReset">
          {{ $t('common.reload') }}
        </BaseButton>
      </FlexBox>
    </FlexBox>
  </FullContainer>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FullContainer from '@/shared/components/container/FullContainer.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

const props = defineProps<{
  error: Error | undefined
  reset?: () => void
}>()

const errorName: ComputedRef<string> = computed<string>(() => {
  return props.error?.name ?? 'Error'
})

function handleReset(): void {
  if (props.reset) {
    props.reset()
    return
  }

  window.location.reload()
}
</script>

<style scoped lang="scss">
.error-splash {
  width: 100%;
  min-width: 0;
  max-width: token($modal-sizes, md);

  & .error-splash__eyebrow {
    color: color(theme, danger, theme-alpha, 11);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  & .error-splash__error-message {
    color: color(theme, danger, theme-alpha, 11);
  }

  & .error-splash__error-stack {
    color: color(theme, danger, theme-alpha, 12);
  }
}
</style>
