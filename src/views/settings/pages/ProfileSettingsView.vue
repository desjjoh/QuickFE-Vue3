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
          <AvatarItem
            radius="full"
            :src="authenticatedUser.profile.media.avatar?.url"
            :alt="
              authenticatedUser.profile.media.avatar?.alt_text ?? $t('accessibility.userAvatar')
            "
            :fallback="authenticatedUser.getInitials()"
          />
        </template>

        <template v-if="!authenticatedUser.profile.media.avatar">
          <IconButton :icon="Plus" :variant="$variant" tone="success" @click="updateAvatar" />
        </template>

        <template v-else>
          <IconButton :icon="Pen" :variant="$variant" tone="warning" @click="updateAvatar" />
          <IconButton :icon="Trash2" :variant="$variant" tone="danger" @click="deleteAvatar" />
        </template>
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
              {{ profileValues.fullName }}
            </BlockText>

            <BlockText size="sm" tone="secondary" truncate>
              {{ profileValues.personalDetails }}
            </BlockText>
          </FlexBox>
        </template>

        <BaseButton
          :variant="$variant"
          tone="neutral"
          @click="() => updateProfileDetails(authenticatedUser)"
        >
          {{ $t('common.edit') }}
        </BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection
      :title="$t('settings.profile.sections.regional.title')"
      :description="$t('settings.profile.sections.regional.description')"
    >
      <SettingsListItem
        :key="`${ref_id}-country`"
        :icon="MapPinned"
        :title="$t('settings.profile.items.country.title')"
        :description="$t('settings.profile.items.country.description')"
      >
        <template #value>
          <BlockText tone="primary" truncate>
            {{ profileValues.country }}
          </BlockText>
        </template>

        <BaseButton
          :variant="$variant"
          tone="neutral"
          @click="() => updateCountry(authenticatedUser)"
        >
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
            {{ profileValues.timezone }}
          </BlockText>
        </template>

        <BaseButton
          :variant="$variant"
          tone="neutral"
          @click="() => updateTimezone(authenticatedUser)"
        >
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
          <template v-if="contactValues.hasPhone">
            <FlexBox direction="column" :gap="1">
              <FlexBox align-items="center" :gap="2">
                <CircleCheck :size="18" class="check__success" stroke-width="2.5" />

                <BlockText tone="primary" truncate>
                  {{ contactValues.phone }}
                </BlockText>
              </FlexBox>

              <BlockText size="sm" tone="secondary" truncate>
                {{ contactValues.phoneChanged }}
              </BlockText>
            </FlexBox>
          </template>

          <template v-else>
            <BlockText size="sm" truncate>
              {{ $t('settings.profile.items.phone.empty') }}
            </BlockText>
          </template>
        </template>

        <template v-if="!authenticatedUser.profile.contact.phone">
          <IconButton
            :icon="Plus"
            :variant="$variant"
            tone="success"
            @click="() => updatePhone(authenticatedUser)"
          />
        </template>

        <template v-else>
          <IconButton
            :icon="Pen"
            :variant="$variant"
            tone="warning"
            @click="() => updatePhone(authenticatedUser)"
          />
          <IconButton :icon="Trash2" :variant="$variant" tone="danger" @click="deletePhone" />
        </template>
      </SettingsListItem>

      <SettingsListItem
        :key="`${ref_id}-address`"
        :icon="MapPinHouse"
        :title="$t('settings.profile.items.address.title')"
        :description="$t('settings.profile.items.address.description')"
      >
        <template #value>
          <template v-if="contactValues.hasAddress">
            <FlexBox direction="column" :gap="1">
              <BlockText tone="primary" truncate>
                {{ contactValues.addressLineOne }}
              </BlockText>

              <BlockText size="sm" tone="secondary" truncate>
                {{ contactValues.addressLineTwo }}
              </BlockText>
            </FlexBox>
          </template>

          <template v-else>
            <BlockText size="sm" truncate>
              {{ $t('settings.profile.items.address.empty') }}
            </BlockText>
          </template>
        </template>

        <template v-if="!contactValues.hasAddress">
          <IconButton
            :icon="Plus"
            :variant="$variant"
            tone="success"
            @click="() => updateAddress(authenticatedUser)"
          />
        </template>

        <template v-else>
          <IconButton
            :icon="Pen"
            :variant="$variant"
            tone="warning"
            @click="() => updateAddress(authenticatedUser)"
          />

          <IconButton
            v-if="contactValues.hasAddress"
            :icon="Trash2"
            :variant="$variant"
            tone="danger"
            @click="deleteAddress"
          />
        </template>
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
import { useLibraryStore, type LibraryStore } from '@/stores/library.ts'
import type { AddressDto, PhoneDto, UserDto } from '@/library/models/user.ts'
import { formatIsoDate, formatLocalizedDateTime } from '@/helpers/date.ts'
import { formatPostalCode } from '@/helpers/reference.ts'

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
import type { CountryDto } from '@/library/models/reference.ts'

const authStore: AuthStore = useAuthStore()
const localeStore: LocaleStore = useLocaleStore()
const libraryStore: LibraryStore = useLibraryStore()

const { t, locale } = useI18n()

const {
  updateTimezone,
  updateCountry,
  updateProfileDetails,
  updateAvatar,
  deleteAvatar,
  updatePhone,
  deletePhone,
  updateAddress,
  deleteAddress,
} = useSettingsActions(t)

const { countryLabel, timezoneLabel } = useReferenceTranslations()

const authenticatedUser = computed<UserDto>(() => authStore.user!)

type ProfileValues = {
  fullName: string
  personalDetails: string
  country: string
  timezone: string
}

type ContactValues = {
  hasPhone: boolean
  phone: string
  phoneChanged: string
  hasAddress: boolean
  addressLineOne: string
  addressLineTwo: string
}

const profileValues = computed<ProfileValues>(() => {
  const user = authenticatedUser.value

  return {
    fullName: user.getFullName(),
    personalDetails: formatPersonalDetails(user),
    country: countryLabel(user.profile.region.country),
    timezone: timezoneLabel(user.profile.region.timezone),
  }
})

const contactValues = computed<ContactValues>(() => {
  const contact = authenticatedUser.value.profile.contact

  return {
    hasPhone: !!contact.phone,
    phone: contact.phone ? formatPhoneNumber(contact.phone) : '',
    phoneChanged: getLastChangedLabel(contact.phone ? contact.phone.updatedAt : null),
    hasAddress: !!contact.address,
    addressLineOne: contact.address ? formatAddressLineOne(contact.address) : '',
    addressLineTwo: contact.address ? formatAddressLineTwo(contact.address) : '',
  }
})

const ref_id = useId()

function formatPersonalDetails(user: UserDto): string {
  return [
    t(`library.genders.${user.profile.personal.gender}`),
    formatIsoDate(user.profile.personal.dob, localeStore.locale),
  ].join(' • ')
}

function formatPhoneNumber(phone: PhoneDto): string {
  const country = findCountryById(phone.phone_country_id)
  const nationalNumber = formatGroupedValue(
    phone.phone_national_number,
    country?.phone_format_groups,
  )

  return [phone.phone_calling_code, nationalNumber].filter(Boolean).join(' ')
}

function formatAddressLineOne(address: AddressDto): string {
  return [address.address_line_1, address.address_line_2].filter(Boolean).join(', ')
}

function formatAddressLineTwo(address: AddressDto): string {
  const country = findCountryByCode(address.country)
  const postalCode = formatPostalCode(address.postal_code, country)

  return [address.city, address.region.code, postalCode].filter(Boolean).join(' ')
}

function formatGroupedValue(value: string, groups: number[] | undefined): string {
  const normalized = value.replace(/\D/g, '')

  if (!groups?.length) return normalized

  const parts: string[] = []
  let cursor = 0

  for (const groupSize of groups) {
    const part = normalized.slice(cursor, cursor + groupSize)

    if (!part) break

    parts.push(part)
    cursor += groupSize
  }

  const remaining = normalized.slice(cursor)

  if (remaining) parts.push(remaining)

  return parts.join(' ')
}

function findCountryById(countryId: string): CountryDto | undefined {
  return libraryStore.countries.find((country) => country.id === countryId)
}

function findCountryByCode(countryCode: string): CountryDto | undefined {
  return libraryStore.countries.find((country) => {
    return [country.id, country.key, country.iso2, country.iso3].includes(countryCode)
  })
}

function getLastChangedLabel(value: Date | null): string {
  const date = value
    ? formatLocalizedDateTime(value, String(locale.value))
    : t('common.notApplicable')

  return t('settings.security.lastChanged', { date })
}
</script>

<style lang="scss" scoped>
.check__success {
  flex: 0 0 auto;
  color: color(theme, success, theme-alpha, 11);
}
</style>
