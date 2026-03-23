<template>
  <DropdownMenu :content-align="contentAlign">
    <template #trigger="{ toggle, triggerAttrs }">
      <IconButton
        :icon="Languages"
        tone="neutral"
        variant="ghost"
        v-bind="triggerAttrs"
        @click="toggle"
      />
    </template>

    <template #default>
      <MenuViewport>
        <MenuButton
          v-for="locale in LOCALES"
          :key="locale.key"
          :active="locale.key == $i18n.locale"
          @click="() => handleClick(locale.key)"
        >
          {{ locale.display }}
          <img class="menu__item" :src="locale.flag" />
        </MenuButton>
      </MenuViewport>
    </template>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Languages } from 'lucide-vue-next'

import { STORAGE_KEY, LOCALES, type AppLocales } from '@/i18n'
import { useLocalStorageUtil } from '@/helpers/localstorage'

import IconButton from '@/shared/components/buttons/IconButton.vue'
import DropdownMenu from '@/shared/components/dropdowns/BaseDropdown.vue'
import MenuViewport from '@/shared/components/dropdowns/MenuViewport.vue'
import MenuButton from '@/shared/components/dropdowns/MenuButton.vue'
import type { Align } from '@/shared/components/dropdowns/types'

type props = { contentAlign?: Align }

withDefaults(defineProps<props>(), { contentAlign: 'start' })

const { locale } = useI18n()
const { saveItem } = useLocalStorageUtil<AppLocales>(STORAGE_KEY)

function handleClick(key: AppLocales) {
  locale.value = key
  saveItem(key)
}
</script>

<style lang="scss" scoped>
img.menu__item {
  height: space(4);
  width: space(4);

  display: block;
  object-fit: cover;

  border-radius: border-radius(sm);
}
</style>
