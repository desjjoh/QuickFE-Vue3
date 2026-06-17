<template>
  <BaseCard size="lg">
    <CardBody>
      <FlexBox
        :direction="rowDirection"
        align-items="flex-start"
        justify-content="space-between"
        :gap="4"
      >
        <FlexBox :gap="3">
          <AvatarItem v-if="isTabletUp" fallback="JL" variant="soft" size="xxl" radius="lg" />

          <FlexBox direction="column" align-items="flex-start" :gap="2">
            <FlexBox direction="column" align-items="flex-start">
              <BlockText element="h3">Jamie Lopez, 14</BlockText>
              <BlockText> Patient ID: #C2401 • Physical Therapy </BlockText>
            </FlexBox>

            <FlexBox :gap="2" wrap="wrap">
              <BaseBadge tone="success" variant="soft">active</BaseBadge>
              <BaseBadge tone="info" variant="soft">insurance: verified</BaseBadge>
              <BaseBadge tone="info" variant="soft">parent consent: on file</BaseBadge>
            </FlexBox>
          </FlexBox>
        </FlexBox>

        <FlexBox :gap="3" :wrap="wrapButtons">
          <BaseButton tone="neutral" variant="soft">Edit profile</BaseButton>
        </FlexBox>
      </FlexBox>
    </CardBody>
  </BaseCard>
</template>

<script setup lang="ts">
import { useViewport } from '@/shared/hooks/useViewport'

import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import { computed } from 'vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import type { FlexWrap } from '@/shared/types/components/flex'

const { isTabletUp, isDesktop } = useViewport()

const rowDirection = computed<'row' | 'column'>(() => {
  return isDesktop.value ? 'row' : 'column'
})

const wrapButtons = computed<FlexWrap>(() => {
  return isDesktop.value ? 'nowrap' : 'wrap'
})
</script>
