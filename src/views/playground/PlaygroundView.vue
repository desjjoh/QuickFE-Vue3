<template>
  <StackedLayout>
    <PlaygroundContent>
      <!-- AVATARS -->
      <PlaygroundSection title="Avatar">
        <template #body>
          <AvatarPlayground />
        </template>
      </PlaygroundSection>

      <!-- BADGES -->
      <PlaygroundSection title="Badge">
        <template #body>
          <BadgePlayground />
        </template>
      </PlaygroundSection>

      <!-- BLOCKQUOTES -->
      <PlaygroundSection title="Blockquote">
        <template #body>
          <BlockquotePlayground />
        </template>
      </PlaygroundSection>

      <!-- BUTTONS -->
      <PlaygroundSection title="Button">
        <template #body>
          <ButtonPlayground />
        </template>
      </PlaygroundSection>

      <!-- CALLOUTS -->
      <PlaygroundSection title="Callout">
        <template #body>
          <CalloutPlayground />
        </template>
      </PlaygroundSection>

      <!-- CARDS -->
      <PlaygroundSection title="Card">
        <template #body>
          <CardPlayground />
        </template>
      </PlaygroundSection>

      <!-- CHECKBOX -->
      <PlaygroundSection title="Checkbox">
        <template #body>
          <CheckboxPlayground />
        </template>
      </PlaygroundSection>

      <!-- COLORS -->
      <PlaygroundSection title="Color">
        <template #body>
          <ColorPlayground />
        </template>
      </PlaygroundSection>

      <!-- DROPDOWNS -->
      <PlaygroundSection title="Dropdown Menu">
        <template #body>
          <DropdownPlayground />
        </template>
      </PlaygroundSection>

      <!-- FORMS -->
      <PlaygroundSection title="Forms">
        <template #body>
          <FormsPlayground />
        </template>
      </PlaygroundSection>

      <!-- ICON BUTTON -->
      <PlaygroundSection title="Icon Button">
        <template #body>
          <IconButtonPlayground />
        </template>
      </PlaygroundSection>

      <!-- LINKS -->
      <PlaygroundSection title="Link">
        <template #body>
          <LinkPlayground />
        </template>
      </PlaygroundSection>

      <!-- TABS -->
      <PlaygroundSection title="Tabs">
        <template #body>
          <TabsPlayground />
        </template>
      </PlaygroundSection>

      <!-- TEXT FIELDS -->
      <PlaygroundSection title="Text Area">
        <template #body>
          <TextAreaPlayground />
        </template>
      </PlaygroundSection>

      <!-- TEXT FIELDS -->
      <PlaygroundSection title="Text Field">
        <template #body>
          <TextFieldPlayground />
        </template>
      </PlaygroundSection>

      <!-- TYPOGRAPHY -->
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
import ColorPlayground from './widgets/ColorPlayground.vue'
import TextFieldPlayground from './widgets/TextFieldPlayground.vue'
import FormsPlayground from './widgets/FormsPlayground.vue'
import CheckboxPlayground from './widgets/CheckboxPlayground.vue'
import TextAreaPlayground from './widgets/TextAreaPlayground.vue'
import DropdownPlayground from './widgets/DropdownPlayground.vue'
</script>
