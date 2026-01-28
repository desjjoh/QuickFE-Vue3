<template>
  <WelcomeItem>
    <template #icon>
      <BookOpen />
    </template>
    <template #heading>Documentation</template>

    <BlockText>
      Vue’s
      <BaseLink href="https://vuejs.org/" external>official documentation</BaseLink>
      provides you with all information you need to get started.
    </BlockText>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <Toolbox />
    </template>
    <template #heading>Tooling</template>

    <BlockText>
      This project is served and bundled with
      <BaseLink href="https://vite.dev/guide/features.html" external>Vite</BaseLink>. The
      recommended IDE setup is
      <BaseLink href="https://code.visualstudio.com/" external>VSCode</BaseLink>
      +
      <BaseLink href="https://github.com/vuejs/language-tools" external>Vue - Official</BaseLink>.
      If you need to test your components and web pages, check out
      <BaseLink href="https://vitest.dev/" external>Vitest</BaseLink>
      and
      <BaseLink href="https://www.cypress.io/" external>Cypress</BaseLink>
      /
      <BaseLink href="https://playwright.dev/" external>Playwright</BaseLink>.

      <br />

      More instructions are available in
      <BaseLink href="javascript:void(0)" @click="openReadmeInEditor">
        <code>README.md</code> </BaseLink
      >.
    </BlockText>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <Sprout />
    </template>
    <template #heading>Ecosystem</template>

    <BlockText>
      Get official tools and libraries for your project:
      <BaseLink href="https://pinia.vuejs.org/" external>Pinia</BaseLink>,
      <BaseLink href="https://router.vuejs.org/" external>Vue Router</BaseLink>,
      <BaseLink href="https://test-utils.vuejs.org/" external>Vue Test Utils</BaseLink>, and
      <BaseLink href="https://github.com/vuejs/devtools" external>Vue Dev Tools</BaseLink>. If you
      need more resources, we suggest paying
      <BaseLink href="https://github.com/vuejs/awesome-vue" external>Awesome Vue</BaseLink>
      a visit.
    </BlockText>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <MessagesSquare />
    </template>
    <template #heading>Community</template>

    <BlockText>
      Got stuck? Ask your question on
      <BaseLink href="https://chat.vuejs.org" external>Vue Land</BaseLink>
      (our official Discord server), or
      <BaseLink href="https://stackoverflow.com/questions/tagged/vue.js" external
        >StackOverflow</BaseLink
      >. You should also follow the official
      <BaseLink href="https://bsky.app/profile/vuejs.org" external>@vuejs.org</BaseLink>
      Bluesky account or the
      <BaseLink href="https://x.com/vuejs" external>@vuejs</BaseLink>
      X account for latest news in the Vue world.
    </BlockText>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <Heart />
    </template>
    <template #heading>Support Vue</template>

    <BlockText>
      As an independent project, Vue relies on community backing for its sustainability. You can
      help us by
      <BaseLink href="https://vuejs.org/sponsor/" external>becoming a sponsor</BaseLink>.
    </BlockText>
  </WelcomeItem>
</template>

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
import WelcomeItem from './WelcomeItem.vue'

import { BookOpen, Toolbox, MessagesSquare, Sprout, Heart } from 'lucide-vue-next'
import BaseLink from '@/shared/components/links/BaseLink.vue'

const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')
</script>
