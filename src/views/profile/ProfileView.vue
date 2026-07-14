<template>
  <CenteredLayout>
    <GridBox :columns="GridColumns" :gap="4">
      <GridCell :span="GridColumns">
        <FlexBox direction="column" :gap="1">
          <BlockText element="h3">Account home</BlockText>
          <BlockText
            >Welcome back, {{ user.profile.name.preferred ?? user.profile.name.first }}. Here's
            what's happening with your account.</BlockText
          >
        </FlexBox>
      </GridCell>

      <!-- HEADER -->
      <GridCell :span="GridColumns">
        <ProfileHeader :user="user" />
      </GridCell>

      <!-- STATS -->
      <GridCell :span="statsGridColumns">
        <BaseCard size="lg">
          <CardBody>
            <FlexBox direction="column" :gap="3" grow>
              <FlexBox direction="column">
                <BlockText element="h5">Account timeline</BlockText>
                <BlockText>Key milestones and account access history.</BlockText>
              </FlexBox>

              <CompactDataList>
                <DataListItem
                  small
                  label="Member since"
                  :value="getLastChangedLabel(user.createdAt)"
                />
                <DataListItem
                  small
                  label="Last sign-in"
                  :value="getLastChangedLabel(user.metadata.lastSignIn)"
                />
                <DataListItem
                  small
                  label="Last updated"
                  :value="getLastChangedLabel(user.metadata.lastUpdatedAt)"
                />
              </CompactDataList>
            </FlexBox>
          </CardBody>
        </BaseCard>
      </GridCell>

      <GridCell :span="statsGridColumns">
        <BaseCard size="lg">
          <CardBody>
            <FlexBox direction="column" :gap="3" grow>
              <FlexBox direction="column">
                <BlockText element="h5">Active session</BlockText>
                <BlockText>Details about your current sing-in session.</BlockText>
              </FlexBox>

              <CompactDataList>
                <DataListItem
                  small
                  label="Browser"
                  :value="`${user.session.browser} ${user.session.browserVersion}`"
                />
                <DataListItem
                  small
                  label="OS"
                  :value="`${user.session.os} ${user.session.osVersion}`"
                />
                <DataListItem small label="IP address" :value="user.session.ipAddress" />
              </CompactDataList>
            </FlexBox>
          </CardBody>
        </BaseCard>
      </GridCell>

      <GridCell :span="statsGridColumns">
        <BaseCard size="lg">
          <CardBody>
            <FlexBox direction="column" :gap="3" grow>
              <FlexBox direction="column">
                <BlockText element="h5">Security summary</BlockText>
                <BlockText>A quick look at your account access settings.</BlockText>
              </FlexBox>

              <CompactDataList>
                <DataListItem small label="Status" :value="user.status.label" />
                <DataListItem small label="2FA" value="Not enabled" />
                <DataListItem
                  small
                  label="Password"
                  :value="`Last changed ${formatLocalizedDateTime(user.metadata.lastChangedPassword, locale, 'compact')}`"
                />
              </CompactDataList>
            </FlexBox>
          </CardBody>
        </BaseCard>
      </GridCell>

      <!-- OVERVIEW -->
      <GridCell :span="overviewGridColumns">
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

      <GridCell :span="overviewGridColumns">
        <CardSection
          title="Recent activity"
          subtitle="Review recent sign-ins, profile updates, and security changes on your account."
          :icon="History"
        >
          <div class="wip">
            <BlockText text-align="center">
              Sign-ins, profile changes, and security updates will appear here when activity is
              available.
            </BlockText>
          </div>
        </CardSection>
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
import { formatIsoDate, formatLocalizedDateTime } from '@/helpers/date.ts'
import { useI18n } from 'vue-i18n'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations.ts'
import { Contact, History } from 'lucide-vue-next'
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import CompactDataList from '@/shared/components/datalist/CompactDataList.vue'

const { locale } = useI18n()
const { isDesktop } = useViewport()

const { genderLabel, countryLabel, timezoneLabel } = useReferenceTranslations()

const authStore: AuthStore = useAuthStore()
const user = computed<UserDto>(() => authStore.user!)

const GridColumns = computed<number>(() => {
  if (isDesktop.value) return 6

  return 1
})

const statsGridColumns = computed<number>(() => {
  if (isDesktop.value) return 2

  return 1
})

const overviewGridColumns = computed<number>(() => {
  if (isDesktop.value) return 3

  return 1
})

function getLastChangedLabel(value: Date | null): string {
  return formatLocalizedDateTime(value, String(locale.value))
}
</script>

<style scoped lang="scss">
.wip {
  display: grid;
  padding: space(10) space(8);
  flex: 1;

  align-items: center;
  justify-content: center;

  color: color(text, secondary);
  background: palette(white, 1);
  border-radius: border-radius(md);
  border: 0.2rem dashed color(theme, neutral, theme-alpha, 7);
}
</style>
