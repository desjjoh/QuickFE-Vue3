<template>
  <DropdownMenu :content-align="contentAlign">
    <template #trigger="{ toggle, triggerAttrs }">
      <IconButton
        :icon="Languages"
        tone="neutral"
        variant="ghost"
        :size="size"
        v-bind="triggerAttrs"
        @click="toggle"
      />
    </template>

    <template #default>
      <MenuViewport>
        <MenuButton
          v-for="locale in LOCALES"
          :key="locale.key"
          :active="locale.key === localeStore.locale"
          @click="(_: MouseEvent) => handleClick(locale.key)"
        >
          <InlineText>
            {{ locale.display }}
          </InlineText>

          <img
            class="menu__item"
            :src="locale.flag"
            :alt="locale.display"
            loading="eager"
            decoding="async"
          />
        </MenuButton>
      </MenuViewport>
    </template>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { Languages } from 'lucide-vue-next'

import { LOCALES, type AppLocales } from '@/shared/i18n'
import { useLocaleStore, type LocaleStore } from '@/shared/stores/locale'

import IconButton from '@/library/components/buttons/IconButton.vue'
import DropdownMenu from '@/library/components/dropdowns/BaseDropdown.vue'
import MenuViewport from '@/library/components/dropdowns/MenuViewport.vue'
import MenuButton from '@/library/components/dropdowns/MenuButton.vue'
import type { Align } from '@/library/components/dropdowns/dropdowns'
import type { Size } from '@/library/components/buttons/buttons'
import InlineText from '@/library/components/text/InlineText.vue'

type props = { contentAlign?: Align; size?: Size }

withDefaults(defineProps<props>(), { contentAlign: 'start' })

const localeStore: LocaleStore = useLocaleStore()

function handleClick(key: AppLocales) {
  localeStore.setLocale(key)
}
</script>

<style lang="scss" scoped>
img.menu__item {
  height: space(4);
  width: space(4);

  display: block;
  object-fit: cover;

  border-radius: border-radius(round);
}
</style>
