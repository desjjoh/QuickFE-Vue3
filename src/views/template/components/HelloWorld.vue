<template>
  <div
    class="greetings"
    :class="{
      'is-desktop': isDesktop,
    }"
  >
    <BlockText element="h1">{{ msg }}</BlockText>

    <BlockText element="h5" tone="inherit" weight="normal">
      <i18n-t keypath="template.header.subtitle" tag="span" scope="global">
        <BaseLink href="https://vite.dev/" external>
          {{ $t('template.header.0') }}
        </BaseLink>

        <BaseLink href="https://vuejs.org/" external>
          {{ $t('template.header.1') }}
        </BaseLink>
      </i18n-t>
    </BlockText>
  </div>
</template>

<script setup lang="ts">
import { useViewport } from '@/shared/hooks/useViewport'

import BaseLink from '@/shared/components/links/BaseLink.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

type Props = {
  msg: string
}

defineProps<Props>()

const { isDesktop } = useViewport()
</script>

<style scoped lang="scss">
.greetings {
  h1 {
    margin-bottom: space(2);
  }

  h1,
  h5 {
    text-align: center;
  }
}

.greetings.is-desktop {
  h1,
  h5 {
    text-align: left;
  }
}
</style>
