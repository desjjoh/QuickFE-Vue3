<template>
  <PlaygroundContent>
    <PlaygroundSection>
      <template #header>
        <BlockText element="h3">Buttons</BlockText>
      </template>

      <template #body>
        <ButtonPlayground />
      </template>
    </PlaygroundSection>

    <PlaygroundSection>
      <template #header>
        <BlockText element="h3">Links</BlockText>
      </template>

      <template #body>
        <LinkPlayground />
      </template>
    </PlaygroundSection>

    <PlaygroundSection>
      <template #header>
        <BlockText element="h3">Typography</BlockText>
      </template>

      <template #body>
        <TypographyPlayground />
      </template>
    </PlaygroundSection>
  </PlaygroundContent>
</template>

<script setup lang="ts">
import PlaygroundSection from './layouts/PlaygroundSection.vue'
import PlaygroundContent from './layouts/PlaygroundContent.vue'

import ButtonPlayground from './widgets/ButtonPlayground.vue'
import TypographyPlayground from './widgets/TypographyPlayground.vue'
import LinkPlayground from './widgets/LinkPlayground.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
</script>
