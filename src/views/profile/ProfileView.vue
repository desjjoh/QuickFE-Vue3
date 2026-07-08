<template>
  <CenteredLayout>
    <GridBox :columns="activityGridColumns" :gap="4">
      <GridCell :span="activityGridColumns">
        <ProfileHeader :user="user" />
      </GridCell>
      <GridCell>
        <CardSection
          title="Profile overview"
          subtitle="Review the personal and regional details associated with your profile."
          :icon="Contact"
        >
          <DataList>
            <DataListItem label="Full name" :value="user.getFullName()" />
            <DataListItem label="Preferred name" :value="user.profile.name.preferred" />
            <DataListItem
              label="Date of birth"
              :value="formatIsoDate(user.profile.personal.dob, locale)"
            />
            <DataListItem label="Gender" :value="genderLabel(user.profile.personal.gender)" />
            <DataListItem label="Country" :value="countryLabel(user.profile.region.country)" />
            <DataListItem label="Timezone" :value="timezoneLabel(user.profile.region.timezone)" />
          </DataList>
        </CardSection>
      </GridCell>
      <GridCell>
        <CardSection title="Recent activity" :icon="History"></CardSection>
      </GridCell>
    </GridBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { UserDto } from '@/library/models/user'
import { useAuthStore, type AuthStore } from '@/stores/auth'
import { useViewport } from '@/shared/hooks/useViewport'

import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import ProfileHeader from './widgets/ProfileHeader.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'
import CardSection from './components/CardSection.vue'
import DataListItem from '@/shared/components/datalist/DataListItem.vue'
import DataList from '@/shared/components/datalist/DataList.vue'
import { formatIsoDate } from '@/helpers/date.ts'
import { useI18n } from 'vue-i18n'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations.ts'
import { Contact, History } from 'lucide-vue-next'

const { locale } = useI18n()
const { isDesktop } = useViewport()

const { genderLabel, countryLabel, timezoneLabel } = useReferenceTranslations()

const authStore: AuthStore = useAuthStore()
const user = computed<UserDto>(() => authStore.user!)

const activityGridColumns = computed<number>(() => {
  if (isDesktop.value) return 2

  return 1
})
</script>
