<template>
  <section>
    <!-- DOCUMENTATION -->
    <WelcomeItem>
      <template #icon>
        <BookOpen />
      </template>
      <template #heading>
        {{ $t('template.home.documentation.title') }}
      </template>

      <BlockText>
        <i18n-t keypath="template.home.documentation.body" tag="span" scope="global">
          <BaseLink href="https://vuejs.org/" external>
            {{ $t('template.home.documentation.0') }}
          </BaseLink>
        </i18n-t>
      </BlockText>
    </WelcomeItem>

    <!-- TOOLING -->
    <WelcomeItem>
      <template #icon>
        <Toolbox />
      </template>
      <template #heading>
        {{ $t('template.home.tooling.title') }}
      </template>

      <BlockText white-space="pre-line">
        <i18n-t keypath="template.home.tooling.body" tag="span" scope="global">
          <BaseLink href="https://vite.dev/guide/features.html" external>
            {{ $t('template.home.tooling.0') }}
          </BaseLink>
          <BaseLink href="https://code.visualstudio.com/" external>
            {{ $t('template.home.tooling.1') }}
          </BaseLink>
          <BaseLink href="https://github.com/vuejs/language-tools" external>
            {{ $t('template.home.tooling.2') }}
          </BaseLink>
          <BaseLink href="https://vitest.dev/" external>
            {{ $t('template.home.tooling.3') }}
          </BaseLink>
          <BaseLink href="https://www.cypress.io/" external>
            {{ $t('template.home.tooling.4') }}
          </BaseLink>
          <BaseLink href="https://playwright.dev/" external>
            {{ $t('template.home.tooling.5') }}
          </BaseLink>
          <BaseLink href="javascript:void(0)" @click="openReadmeInEditor">
            <code>{{ $t('template.home.tooling.6') }}</code>
          </BaseLink>
        </i18n-t>
      </BlockText>
    </WelcomeItem>

    <!-- ECOSYSTEM -->
    <WelcomeItem>
      <template #icon>
        <Sprout />
      </template>
      <template #heading>
        {{ $t('template.home.ecosystem.title') }}
      </template>

      <BlockText>
        <i18n-t keypath="template.home.ecosystem.body" tag="span" scope="global">
          <BaseLink href="https://pinia.vuejs.org/" external>
            {{ $t('template.home.ecosystem.0') }}
          </BaseLink>
          <BaseLink href="https://router.vuejs.org/" external>
            {{ $t('template.home.ecosystem.1') }}
          </BaseLink>
          <BaseLink href="https://test-utils.vuejs.org/" external>
            {{ $t('template.home.ecosystem.2') }}
          </BaseLink>
          <BaseLink href="https://github.com/vuejs/devtools" external>
            {{ $t('template.home.ecosystem.3') }}
          </BaseLink>
          <BaseLink href="https://github.com/vuejs/awesome-vue" external>
            {{ $t('template.home.ecosystem.4') }}
          </BaseLink>
        </i18n-t>
      </BlockText>
    </WelcomeItem>

    <!-- COMMUNITY -->
    <WelcomeItem>
      <template #icon>
        <MessagesSquare />
      </template>
      <template #heading>
        {{ $t('template.home.community.title') }}
      </template>

      <BlockText>
        <i18n-t keypath="template.home.community.body" tag="span" scope="global">
          <BaseLink href="https://chat.vuejs.org" external>
            {{ $t('template.home.community.0') }}
          </BaseLink>
          <BaseLink href="https://stackoverflow.com/questions/tagged/vue.js" external>
            {{ $t('template.home.community.1') }}
          </BaseLink>
          <BaseLink href="https://bsky.app/profile/vuejs.org" external>
            {{ $t('template.home.community.2') }}
          </BaseLink>
          <BaseLink href="https://x.com/vuejs" external>
            {{ $t('template.home.community.3') }}
          </BaseLink>
        </i18n-t>
      </BlockText>
    </WelcomeItem>

    <!-- SUPPORT US -->
    <WelcomeItem>
      <template #icon>
        <Heart />
      </template>
      <template #heading>
        {{ $t('template.home.support.title') }}
      </template>

      <BlockText>
        <i18n-t keypath="template.home.support.body" tag="span" scope="global">
          <BaseLink href="https://vuejs.org/sponsor/" external>
            {{ $t('template.home.support.0') }}
          </BaseLink>
        </i18n-t>
      </BlockText>
    </WelcomeItem>
  </section>
</template>

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
import WelcomeItem from '../components/WelcomeItem.vue'

import { BookOpen, Toolbox, MessagesSquare, Sprout, Heart } from 'lucide-vue-next'
import BaseLink from '@/shared/components/links/BaseLink.vue'

const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')
</script>
