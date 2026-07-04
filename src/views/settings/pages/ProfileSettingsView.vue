<template>
  <SettingsLayout>
    <SettingsSection
      :title="$t('settings.profile.sections.media.title')"
      :description="$t('settings.profile.sections.media.description')"
    >
      <SettingsListItem
        :key="`${ref_id}-profile-picture`"
        :icon="Camera"
        :title="$t('settings.profile.items.picture.title')"
        :description="$t('settings.profile.items.picture.description')"
      >
        <template #value>
          <AvatarItem radius="full" :fallback="authenticatedUser.getInitials()" />
        </template>
        <!-- <BaseButton :variant="$variant" tone="primary">Upload a photo</BaseButton> -->
        <IconButton :icon="Plus" :variant="$variant" tone="success" />
        <IconButton :icon="Pen" :variant="$variant" tone="warning" />
        <IconButton :icon="Trash2" :variant="$variant" tone="danger" />
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection
      :title="$t('settings.profile.sections.personal.title')"
      :description="$t('settings.profile.sections.personal.description')"
    >
      <SettingsListItem
        :key="`${ref_id}-profile-details`"
        :icon="Contact"
        :title="$t('settings.profile.items.details.title')"
        :description="$t('settings.profile.items.details.description')"
      >
        <template #value>
          <FlexBox direction="column" :gap="1">
            <BlockText tone="primary" truncate>
              {{ authenticatedUser.getFullName() }}
            </BlockText>
            <BlockText size="sm" tone="secondary" truncate>
              {{
                `${$t(`library.genders.${authenticatedUser.profile.personal.gender}`)} • ${formatIsoDate(authenticatedUser.profile.personal.dob, localeStore.locale)}`
              }}
            </BlockText>
          </FlexBox>
        </template>

        <BaseButton :variant="$variant" tone="neutral">
          {{ $t('common.edit') }}
        </BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection
      :title="$t('settings.profile.items.country.title')"
      :description="$t('settings.profile.items.country.description')"
    >
      <SettingsListItem
        :key="`${ref_id}-country`"
        :icon="MapPinned"
        :title="$t('settings.profile.items.country.title')"
        :description="$t('settings.profile.items.country.description')"
      >
        <template #value>
          <BlockText tone="primary" truncate>
            {{ countryLabel(authenticatedUser.profile.region.country) }}
          </BlockText>
        </template>

        <BaseButton :variant="$variant" tone="neutral">
          {{ $t('common.edit') }}
        </BaseButton>
      </SettingsListItem>

      <SettingsListItem
        :key="`${ref_id}-time-zone`"
        :icon="Clock"
        :title="$t('settings.profile.items.timezone.title')"
        :description="$t('settings.profile.items.timezone.description')"
      >
        <template #value>
          <BlockText tone="primary" truncate>
            {{ timezoneLabel(authenticatedUser.profile.region.timezone) }}
          </BlockText>
        </template>

        <BaseButton :variant="$variant" tone="neutral" @click="updateTimezone">
          {{ $t('common.edit') }}
        </BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection
      :title="$t('settings.profile.sections.contact.title')"
      :description="$t('settings.profile.sections.contact.description')"
    >
      <SettingsListItem
        :key="`${ref_id}-phone`"
        :icon="Phone"
        :title="$t('settings.profile.items.phone.title')"
        :description="$t('settings.profile.items.phone.description')"
      >
        <template #value>
          <FlexBox direction="column" :gap="1">
            <FlexBox align-items="center" :gap="2">
              <CircleCheck :size="18" class="check__success" stroke-width="2.5" />

              <BlockText tone="primary" truncate> +1 613 555 1234 </BlockText>
            </FlexBox>

            <BlockText size="sm" tone="secondary" truncate>
              {{
                $t('settings.profile.items.phone.lastChanged', { date: 'Feb 11, 2021 at 3:59PM' })
              }}
            </BlockText>
          </FlexBox>
        </template>

        <IconButton :icon="Plus" :variant="$variant" tone="success" />
        <IconButton :icon="Pen" :variant="$variant" tone="warning" />
        <IconButton :icon="Trash2" :variant="$variant" tone="danger" />
      </SettingsListItem>

      <SettingsListItem
        :key="`${ref_id}-address`"
        :icon="MapPinHouse"
        :title="$t('settings.profile.items.address.title')"
        :description="$t('settings.profile.items.address.description')"
      >
        <template #value>
          <FlexBox direction="column" :gap="1">
            <BlockText tone="primary" truncate>810-1356 Meadowlands Dr. E</BlockText>

            <BlockText size="sm" tone="secondary" truncate> Ottawa ON K2E 6K6 </BlockText>
          </FlexBox>
        </template>

        <IconButton :icon="Plus" :variant="$variant" tone="success" />
        <IconButton :icon="Pen" :variant="$variant" tone="warning" />
        <IconButton :icon="Trash2" :variant="$variant" tone="danger" />
      </SettingsListItem>
    </SettingsSection>
  </SettingsLayout>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import {
  Trash2,
  Camera,
  Contact,
  Phone,
  MapPinHouse,
  Plus,
  MapPinned,
  Clock,
  Pen,
  CircleCheck,
} from 'lucide-vue-next'

import { type LocaleStore, useLocaleStore } from '@/stores/locale.ts'
import { useAuthStore, type AuthStore } from '@/stores/auth.ts'
import type { UserDto } from '@/library/models/user.ts'
import { formatIsoDate } from '@/helpers/date.ts'

import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations.ts'

import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'
import IconButton from '@/shared/components/buttons/IconButton.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import { $variant } from '../config/settings.ts'

import SettingsLayout from '../layouts/SettingsLayout.vue'
import SettingsSection from '../layouts/SettingsSection.vue'
import SettingsListItem from '../widgets/SettingsListItem.vue'
import { useSettingsActions } from '../hooks/useSettingsActions.ts'
import { useI18n } from 'vue-i18n'

const authStore: AuthStore = useAuthStore()
const localeStore: LocaleStore = useLocaleStore()

const { t } = useI18n()

const { updateTimezone } = useSettingsActions(t)

const { countryLabel, timezoneLabel } = useReferenceTranslations()

const authenticatedUser = computed<UserDto>(() => authStore.user!)

const ref_id = useId()
</script>

<style lang="scss" scoped>
.check__success {
  flex: 0 0 auto;
  color: color(theme, success, theme-alpha, 11);
}
</style>
