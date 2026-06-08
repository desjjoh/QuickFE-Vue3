<template>
  <FullContainer>
    <FlexBox direction="column" :gap="2" role="alert" class="error-splash">
      <BlockText class="error__text" size="sm" weight="semibold">{{ eyebrow }}</BlockText>

      <BlockText element="h3">
        {{ title }}
      </BlockText>

      <BlockText>
        {{ msg }}
      </BlockText>

      <FlexBox justify-content="flex-end" :gap="5" wrap="wrap">
        <AppLink :href="{ name: 'root' }">Back to home</AppLink>
      </FlexBox>
    </FlexBox>
  </FullContainer>
</template>

<script setup lang="ts">
import FullContainer from '@/shared/components/container/FullContainer.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import AppLink from '@/shared/components/links/AppLink.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

const { title, msg, eyebrow } = defineProps<{ title: string; msg: string; eyebrow: string }>()
</script>

<style scoped lang="scss">
.error-splash {
  min-width: 0;
  max-width: token($modal-sizes, md);

  & .error__text {
    color: color(theme, warning, dark-alpha, 11);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}
</style>
