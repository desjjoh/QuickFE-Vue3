<template>
  <RouterView>
    <template #loading>
      <FullContainer>
        <BlockText element="h4">
          {{ $t('common.authenticating') }}
        </BlockText>
      </FullContainer>
    </template>
  </RouterView>
</template>

<script setup lang="ts">
import RouterView from '@/router/components/RouterView.vue'
import FullContainer from './shared/components/container/FullContainer.vue'
import BlockText from './shared/components/text/BlockText.vue'
</script>
