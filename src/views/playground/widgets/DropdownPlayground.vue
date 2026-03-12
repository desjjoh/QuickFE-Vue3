<template>
  <FlexBox :gap="3">
    <!-- DEMO DROPDOWN -->
    <DropdownMenu>
      <template #trigger="{ toggle, triggerAttrs }">
        <BaseButton v-bind="triggerAttrs" @click="toggle"> Options <ChevronDown /> </BaseButton>
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

    <!-- LANGUAGE SELECTOR -->
    <LanguageDropdown />
  </FlexBox>
</template>

<script setup lang="ts">
import LanguageDropdown from '@/shared/widgets/LanguageDropdown.vue'

import DropdownMenu from '@/shared/components/dropdowns/BaseDropdown.vue'

import MenuViewport from '@/shared/components/dropdowns/MenuViewport.vue'
import MenuSeperator from '@/shared/components/dropdowns/MenuSeperator.vue'
import MenuButton from '@/shared/components/dropdowns/MenuButton.vue'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import { ChevronDown } from 'lucide-vue-next'
import InlineText from '@/shared/components/text/InlineText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
</script>
