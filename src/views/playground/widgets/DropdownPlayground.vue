<template>
  <FlexBox :gap="3">
    <!-- DEMO DROPDOWN 1 -->
    <DropdownMenu>
      <template #trigger="{ toggle, triggerAttrs }">
        <BaseButton v-bind="triggerAttrs" tone="neutral" variant="soft" @click="toggle">
          Options <ChevronDown />
        </BaseButton>
      </template>

      <template #default>
        <MenuViewport>
          <MenuButton>Edit <InlineText>⌘ E</InlineText> </MenuButton>
          <MenuButton>Share <InlineText>⌘ D</InlineText> </MenuButton>

          <MenuSeperator />

          <MenuButton>Archive <InlineText>⌘ N</InlineText> </MenuButton>

          <MenuSeperator />

          <MenuButton>Share</MenuButton>
          <MenuButton>Add to favorites</MenuButton>

          <MenuSeperator />

          <MenuButton tone="danger">Delete <InlineText>⌘ ⌫</InlineText></MenuButton>
        </MenuViewport>
      </template>
    </DropdownMenu>

    <!-- DEMO DROPDOWN -->
    <DropdownMenu>
      <template #trigger="{ toggle, triggerAttrs }">
        <IconButton v-bind="triggerAttrs" :icon="EllipsisVertical" @click="toggle" />
      </template>

      <template #default>
        <MenuViewport>
          <MenuButton>View profile</MenuButton>
          <MenuButton>Change role</MenuButton>

          <MenuSeperator />

          <MenuButton tone="danger">Remove</MenuButton>
        </MenuViewport>
      </template>
    </DropdownMenu>

    <!-- LANGUAGES -->
    <LanguageDropdown />
  </FlexBox>
</template>

<script setup lang="ts">
import { ChevronDown, EllipsisVertical } from 'lucide-vue-next'

import DropdownMenu from '@/shared/components/dropdowns/BaseDropdown.vue'
import MenuViewport from '@/shared/components/dropdowns/MenuViewport.vue'
import MenuSeperator from '@/shared/components/dropdowns/MenuSeperator.vue'
import MenuButton from '@/shared/components/dropdowns/MenuButton.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import InlineText from '@/shared/components/text/InlineText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import LanguageDropdown from '@/shared/widgets/LanguageDropdown.vue'
import IconButton from '@/shared/components/buttons/IconButton.vue'
</script>
