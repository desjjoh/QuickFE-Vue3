<template>
  <PlaygroundShowcase>
    <FlexBox :gap="2">
      <BaseButton variant="soft" tone="info" @click="openLeft">Open left</BaseButton>
      <BaseButton variant="soft" tone="danger" @click="openRight">Open right</BaseButton>
      <BaseButton variant="soft" tone="warning" @click="openTop">Open top</BaseButton>
      <BaseButton variant="soft" tone="success" @click="openBottom">Open bottom</BaseButton>
    </FlexBox>
  </PlaygroundShowcase>
</template>

<script setup lang="ts">
import OffcanvasExamplePanel from '../components/OffcanvasExamplePanel.vue'
import { useOffcanvas } from '@/stores/offcanvas'
import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'

const offcanvas = useOffcanvas()

function openRight(): void {
  offcanvas.open({
    view: OffcanvasExamplePanel,
    side: 'right',
    size: 'md',
    persistent: false,
    key: 'offcanvas-right',
  })
}

function openLeft(): void {
  offcanvas.open({
    view: OffcanvasExamplePanel,
    side: 'left',
    size: 'md',
    persistent: false,
    key: 'offcanvas-left',
  })
}

function openTop(): void {
  offcanvas.open({
    view: OffcanvasExamplePanel,
    side: 'top',
    size: 'md',
    persistent: false,
    key: 'offcanvas-top',
  })
}

function openBottom(): void {
  offcanvas.open({
    view: OffcanvasExamplePanel,
    side: 'bottom',
    size: 'md',
    persistent: false,
    key: 'offcanvas-bottom',
  })
}
</script>
