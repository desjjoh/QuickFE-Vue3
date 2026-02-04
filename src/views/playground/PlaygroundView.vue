<template>
  <StackedLayout>
    <PlaygroundContent>
      <PlaygroundSection title="Avatar">
        <template #body>
          <AvatarPlayground />
        </template>
      </PlaygroundSection>

      <PlaygroundSection title="Badge">
        <template #body>
          <BadgePlayground />
        </template>
      </PlaygroundSection>

      <PlaygroundSection title="Blockquote">
        <template #body>
          <BlockquotePlayground />
        </template>
      </PlaygroundSection>

      <PlaygroundSection title="Button">
        <template #body>
          <ButtonPlayground />
        </template>
      </PlaygroundSection>

      <PlaygroundSection title="Card">
        <template #body>
          <CardPlayground />
        </template>
      </PlaygroundSection>

      <PlaygroundSection title="Callout">
        <template #body>
          <CalloutPlayground />
        </template>
      </PlaygroundSection>

      <PlaygroundSection title="Icon Button">
        <template #body>
          <IconButtonPlayground />
        </template>
      </PlaygroundSection>

      <PlaygroundSection title="Link">
        <template #body>
          <LinkPlayground />
        </template>
      </PlaygroundSection>

      <PlaygroundSection title="Tabs">
        <template #body>
          <TabsPlayground />
        </template>
      </PlaygroundSection>

      <PlaygroundSection title="Typography">
        <template #body>
          <TypographyPlayground />
        </template>
      </PlaygroundSection>
    </PlaygroundContent>
  </StackedLayout>
</template>

<script setup lang="ts">
import StackedLayout from '@/shared/layouts/StackedLayout.vue'

import PlaygroundSection from './layouts/PlaygroundSection.vue'
import PlaygroundContent from './layouts/PlaygroundContent.vue'

import ButtonPlayground from './widgets/ButtonPlayground.vue'
import TypographyPlayground from './widgets/TypographyPlayground.vue'
import LinkPlayground from './widgets/LinkPlayground.vue'
import BadgePlayground from './widgets/BadgePlayground.vue'
import BlockquotePlayground from './widgets/BlockquotePlayground.vue'
import AvatarPlayground from './widgets/AvatarPlayground.vue'
import CalloutPlayground from './widgets/CalloutPlayground.vue'
import IconButtonPlayground from './widgets/IconButtonPlayground.vue'
import CardPlayground from './widgets/CardPlayground.vue'
import TabsPlayground from './widgets/TabsPlayground.vue'
</script>
