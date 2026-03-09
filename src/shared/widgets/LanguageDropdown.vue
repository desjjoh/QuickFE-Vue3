<template>
  <DropdownMenu>
    <template #trigger="{ toggle }">
      <IconButton :icon="Languages" tone="neutral" variant="soft" @click="toggle" />
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
          <img :src="locale.flag" />
        </MenuButton>
      </MenuViewport>
    </template>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { Languages } from 'lucide-vue-next'

import { STORAGE_KEY, LOCALES, type AppLocales } from '@/i18n'

import DropdownMenu from '../components/dropdowns/BaseDropdown.vue'
import MenuViewport from '../components/dropdowns/MenuViewport.vue'
import IconButton from '../components/buttons/IconButton.vue'
import MenuButton from '../components/dropdowns/MenuButton.vue'
import { useI18n } from 'vue-i18n'
import { useLocalStorageUtil } from '@/helpers/localstorage'

const { locale } = useI18n()
const { saveItem } = useLocalStorageUtil<AppLocales>(STORAGE_KEY)

function handleClick(key: AppLocales) {
  locale.value = key
  saveItem(key)
}
</script>

<style lang="scss" scoped>
img {
  height: space(4);
  width: space(4);

  display: block;
  object-fit: cover;

  border-radius: border-radius(sm);
}
</style>
