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
      <TopPerformer v-for="performer in performers" :key="performer.id" v-bind="performer" />
    </template>
  </OverviewLayout>
</template>

<script setup lang="ts">
import OverviewLayout from '../layouts/OverviewLayout.vue'

import StatCard from '../components/StatCard.vue'
import DashboardAlert from '../components/DashboardAlert.vue'
import ActivityTimeline from '../components/ActivityTimeline.vue'
import RecommendationItem from '../components/RecommendationItem.vue'
import TopPerformer from '../components/TopPerformer.vue'

// DEMO DATA (TODO: REPLACE WITH ACTUAL DATA)
import { statsCards } from '../types/statscard'
import { recommendations } from '../types/recommendationitem'
import { performers } from '../types/topperformer'
import { dashboardAlerts } from '../types/alertitem'
import { recentActivity } from '../types/timelineitem'
</script>
