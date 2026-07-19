<template>
  <FullContainer>
    <FlexBox direction="column" :gap="6" class="error-splash" role="alert">
      <FlexBox direction="column" :gap="2">
        <BlockText class="error-splash__eyebrow" size="sm" weight="semibold">
          {{ error?.name }}
        </BlockText>

        <FlexBox direction="column" :gap="3">
          <FlexBox direction="column" :gap="1">
            <BlockText element="h3">
              {{ $t('app.error.title') }}
            </BlockText>

            <i18n-t
              class="error-splash__message"
              keypath="app.error.message"
              tag="p"
              scope="global"
            >
              <InlineText element="q">{{ $t('common.reload') }}</InlineText>
            </i18n-t>
          </FlexBox>

          <BlockQuote variant="danger">
            <BlockText class="error-splash_error-msg" size="sm">{{ error?.message }}</BlockText>
          </BlockQuote>
        </FlexBox>
      </FlexBox>

      <FlexBox justify-content="flex-end" :gap="2" wrap="wrap">
        <BaseButton type="button" @click="reset">
          {{ $t('common.reload') }}
        </BaseButton>
      </FlexBox>
    </FlexBox>
  </FullContainer>
</template>

<script setup lang="ts">
// import { computed } from 'vue'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FullContainer from '@/shared/components/container/FullContainer.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'
import BlockQuote from '../text/BlockQuote.vue'

const { error, reset } = defineProps<{
  error: Error | undefined
  reset?: () => void
}>()
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

  & .error-splash_error-msg {
    color: color(theme, danger, theme-alpha, 12);
  }
}
</style>
