<template>
  <SettingsLayout>
    <SettingsSection
      title="Profile media"
      description="Manage the image used to represent your account."
    >
      <SettingsListItem
        :key="`${ref_id}-profile-picture`"
        :icon="Camera"
        title="Profile picture"
        description="Upload or update the image used for your account profile."
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
      title="Personal information"
      description="Keep your name, personal details, and profile bio up to date."
    >
      <SettingsListItem
        :key="`${ref_id}-profile-details`"
        :icon="Contact"
        title="Profile details"
        description="Review and update the personal information shown on your account."
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

        <BaseButton :variant="$variant" tone="neutral">Edit</BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection
      title="Regional settings"
      description="Control the country and time zone used for dates, activity, and regional defaults."
    >
      <SettingsListItem
        :key="`${ref_id}-country`"
        :icon="MapPinned"
        title="Country"
        description="Used for regional defaults and country-specific account options."
      >
        <template #value>
          <BlockText tone="primary" truncate>
            {{ countryLabel(authenticatedUser.profile.region.country) }}
          </BlockText>
        </template>

        <BaseButton :variant="$variant" tone="neutral">Edit</BaseButton>
      </SettingsListItem>

      <SettingsListItem
        :key="`${ref_id}-time-zone`"
        :icon="Clock"
        title="Time zone"
        description="Used to display dates, times, and scheduled activity in your local time."
      >
        <template #value>
          <BlockText tone="primary" truncate>
            {{ timezoneLabel(authenticatedUser.profile.region.timezone) }}
          </BlockText>
        </template>

        <BaseButton :variant="$variant" tone="neutral">Edit</BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection
      title="Contact information"
      description="Manage the phone numbers and address associated with your account."
    >
      <SettingsListItem
        :key="`${ref_id}-phone`"
        :icon="Phone"
        title="Phone number"
        description="Primary phone number associated with your account."
      >
        <template #value>
          <FlexBox direction="column" :gap="1">
            <FlexBox align-items="center" :gap="2">
              <CircleCheck :size="18" class="check__success" />

              <BlockText tone="primary" truncate> +1 613 555 1234 </BlockText>
            </FlexBox>

            <BlockText size="sm" tone="secondary" truncate>
              Last changed: Feb 11, 2021 at 3:59PM
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
        title="Primary address"
        description="Used as your default billing and shipping address."
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

// import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import IconButton from '@/shared/components/buttons/IconButton.vue'

import { $variant } from '../config/settings.ts'

import SettingsLayout from '../layouts/SettingsLayout.vue'
import SettingsSection from '../layouts/SettingsSection.vue'
import SettingsListItem from '../widgets/SettingsListItem.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import { useAuthStore } from '@/stores/auth.ts'
import type { UserDto } from '@/library/models/user.ts'
import { formatIsoDate } from '@/helpers/date.ts'
import { type LocaleStore, useLocaleStore } from '@/stores/locale.ts'
import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations.ts'

const authStore = useAuthStore()
const localeStore: LocaleStore = useLocaleStore()

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
