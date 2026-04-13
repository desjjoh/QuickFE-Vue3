<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="examples">Examples</Tab>
    </template>

    <!-- EXAMPLES -->
    <template #examples>
      <FlexBox :gap="2">
        <!-- DEMO DROPDOWN 1 -->
        <DropdownMenu>
          <template #trigger="{ toggle, triggerAttrs }">
            <BaseButton v-bind="triggerAttrs" variant="soft" @click="toggle">
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

        <!-- DEMO DROPDOWN 2 -->
        <DropdownMenu>
          <template #trigger="{ toggle, triggerAttrs }">
            <IconButton
              v-bind="triggerAttrs"
              :icon="EllipsisVertical"
              tone="neutral"
              variant="soft"
              @click="toggle"
            />
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
      </FlexBox>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import { ChevronDown, EllipsisVertical } from 'lucide-vue-next'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import DropdownMenu from '@/shared/components/dropdowns/BaseDropdown.vue'
import MenuViewport from '@/shared/components/dropdowns/MenuViewport.vue'
import MenuSeperator from '@/shared/components/dropdowns/MenuSeperator.vue'
import MenuButton from '@/shared/components/dropdowns/MenuButton.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import InlineText from '@/shared/components/text/InlineText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import IconButton from '@/shared/components/buttons/IconButton.vue'
</script>
