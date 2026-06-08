<template>
  <FullContainer>
    <FlexBox direction="column" :gap="2" class="error-splash" role="alert">
      <BlockText class="error__text" size="sm" weight="semibold">
        {{ error }}
      </BlockText>

      <BlockText element="h3">
        {{ $t('app.error.title') }}
      </BlockText>

      <i18n-t keypath="app.error.message" tag="p" scope="global">
        <InlineText element="q">{{ $t('common.reload') }}</InlineText>
      </i18n-t>

      <FlexBox justify-content="flex-end">
        <BaseButton type="button" @click="reset">{{ $t('common.reload') }}</BaseButton>
      </FlexBox>
    </FlexBox>
  </FullContainer>
</template>

<script setup lang="ts">
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FullContainer from '@/shared/components/container/FullContainer.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

const { error, reset } = defineProps<{ error: Error | undefined; reset: () => void }>()
</script>

<style scoped lang="scss">
.error-splash {
  min-width: 0;
  max-width: token($modal-sizes, md);

  & .error__text {
    color: color(theme, danger, dark-alpha, 11);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}
</style>
