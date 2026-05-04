<template>
  <RouterComponent>
    <template #loading>
      <FullContainer>
        <BlockText element="h4">
          {{ $t('common.authenticating') }}
        </BlockText>
      </FullContainer>
    </template>
  </RouterComponent>
</template>

<script setup lang="ts">
import RouterComponent from '@/router/components/RouterComponent.vue'

import FullContainer from '@/shared/components/container/FullContainer.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

import { useDynamicPageTitle } from '@/shared/hooks/useDynamicTitle'

useDynamicPageTitle()
</script>
