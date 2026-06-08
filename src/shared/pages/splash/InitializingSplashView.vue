<template>
  <section class="loading-layout" role="status" aria-live="polite">
    <FlexBox justify-content="center">
      <FlexBox :gap="2" align-items="center">
        <img
          :alt="$t('accessibility.logoAlt')"
          class="logo"
          src="/assets/logo.svg"
          width="32"
          height="32"
        />
        <BlockText no-wrap element="h3">{{ $t('app.brand.name') }}</BlockText>
      </FlexBox>
    </FlexBox>

    <main class="loading-layout__main">
      <FlexBox class="loading__section" direction="column" align-items="center" :gap="2">
        <LoaderBar class="loader" size="sm" />

        <FlexBox direction="column" align-items="center">
          <BlockText element="h2" text-align="center">{{ $t('app.loading.title') }}</BlockText>
          <BlockText element="p" text-align="center">{{ $t('app.loading.message') }}</BlockText>
        </FlexBox>
      </FlexBox>
    </main>

    <footer class="loading-layout__footer">
      <BlockText element="p" text-align="center">{{ $t('app.loading.footer') }}</BlockText>
    </footer>
  </section>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import LoaderBar from '@/shared/components/progress/LoaderBar.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
</script>

<style scoped lang="scss">
.loading-layout {
  display: grid;
  min-height: 100dvh;
  width: 100%;
  grid-template-rows: auto 1fr;
  padding: space(5);

  & .loading-layout__main {
    display: grid;
    place-items: center;

    & .loading__section {
      max-width: token($modal-sizes, md);
    }
  }

  & .loading-layout__footer {
    display: grid;
    justify-items: center;
    padding-block-start: space(5);
  }
}

.loader {
  max-width: space(52);
}
</style>
