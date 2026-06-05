<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="examples">{{ $t('playground.header.tabs.examples') }}</Tab>
    </template>

    <!-- EXAMPLES -->
    <template #examples>
      <FlexBox :gap="2">
        <!-- DEMO DROPDOWN 1 -->
        <DropdownMenu>
          <template #trigger="{ toggle, triggerAttrs }">
            <BaseButton v-bind="triggerAttrs" variant="soft" @click="toggle" :icon="ChevronDown">
              {{ $t('common.options') }}
            </BaseButton>
          </template>

          <template #default>
            <MenuViewport>
              <MenuButton>
                {{ $t('playground.action.edit') }} <InlineText>⌘ E</InlineText>
              </MenuButton>
              <MenuButton>
                {{ $t('playground.action.share') }} <InlineText>⌘ D</InlineText>
              </MenuButton>

              <MenuSeperator />

              <MenuButton>
                {{ $t('playground.action.archive') }} <InlineText>⌘ N</InlineText>
              </MenuButton>

              <MenuSeperator />

              <MenuButton>{{ $t('playground.action.share') }}</MenuButton>
              <MenuButton>{{ $t('playground.action.addToFavorites') }}</MenuButton>

              <MenuSeperator />

              <MenuButton tone="danger">
                {{ $t('playground.action.delete') }} <InlineText>⌘ ⌫</InlineText>
              </MenuButton>
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
              <MenuButton>{{ $t('playground.action.viewProfile') }}</MenuButton>
              <MenuButton>{{ $t('playground.action.changeRole') }}</MenuButton>

              <MenuSeperator />

              <MenuButton tone="danger">{{ $t('playground.action.remove') }}</MenuButton>
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
