<template>
  <OverviewLayout>
    <template #stats>
      <template v-for="stats in statsCards" :key="stats.id">
        <StatCard v-bind="stats" />
      </template>
    </template>

    <template #errors>
      <template v-for="alert of dashboardAlerts" :key="alert.id">
        <DashboardAlert v-bind="alert" />
      </template>
    </template>

    <template #activity>
      <SectionCard title="Recent Client Activity" subtitle="Last 24 hours">
        <ActivityTimeline :items="recentActivity" />
      </SectionCard>
    </template>

    <template #recommendations>
      <SectionCard title="AI Recommendations" subtitle="Personalized intervention suggestions">
        <RecommendationItem
          v-for="recommendation in recommendations"
          :key="recommendation.id"
          v-bind="recommendation"
        />
      </SectionCard>
    </template>

    <template #performers>
      <SectionCard title="This Week's Top Performers">
        <FlexBox direction="column" :gap="2">
          <ClientMetricsCard
            v-for="performer in performers"
            :key="performer.id"
            v-bind="performer"
          />
        </FlexBox>
      </SectionCard>
    </template>
  </OverviewLayout>
</template>

<script setup lang="ts">
import OverviewLayout from './layouts/OverviewLayout.vue'

import ActivityTimeline from './widgets/ActivityTimeline.vue'
import RecommendationItem from './widgets/RecommendationItem.vue'

import FlexBox from '@/shared/components/flex/FlexBox.vue'

import StatCard from '@/views/dashboard/shared/widgets/StatCard.vue'
import DashboardAlert from '@/views/dashboard/shared/widgets/DashboardAlert.vue'
import ClientMetricsCard from '@/views/dashboard/shared/widgets/ClientMetricsCard.vue'

// DEMO DATA (TODO: REPLACE WITH ACTUAL DATA)
import {
  dashboardAlerts,
  performers,
  recentActivity,
  recommendations,
  statsCards,
} from './constants'
import SectionCard from '../../shared/layouts/SectionCard.vue'
</script>
