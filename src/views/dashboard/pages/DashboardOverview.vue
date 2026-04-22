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
      <ActivityTimeline :items="recentActivity" />
    </template>

    <template #recommendations>
      <RecommendationItem
        v-for="recommendation in recommendations"
        :key="recommendation.id"
        v-bind="recommendation"
      />
    </template>

    <template #performers>
      <ClientMetricsRow v-for="performer in performers" :key="performer.id" v-bind="performer" />
    </template>
  </OverviewLayout>
</template>

<script setup lang="ts">
import OverviewLayout from '../layouts/OverviewLayout.vue'

import StatCard from '../widgets/StatCard.vue'
import DashboardAlert from '../widgets/DashboardAlert.vue'
import ActivityTimeline from '../widgets/ActivityTimeline.vue'
import RecommendationItem from '../widgets/RecommendationItem.vue'
import ClientMetricsRow from '../widgets/ClientMetricsRow.vue'

// DEMO DATA (TODO: REPLACE WITH ACTUAL DATA)
import { statsCards } from '../types/statscard'
import { recommendations } from '../types/recommendationitem'
import { performers } from '../types/clientmetrics'
import { dashboardAlerts } from '../types/alertitem'
import { recentActivity } from '../types/timelineitem'
</script>
