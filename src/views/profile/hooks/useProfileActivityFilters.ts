import { onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOffcanvasSubmit } from '@/shared/hooks/useOffcanvasSubmit'
import { useOffcanvas } from '@/shared/stores/offcanvas'
import ActivityFiltersPanel from '@/views/administration/pages/audit-log/components/ActivityFiltersPanel.vue'
import {
  activityFilterDraft,
  activityFilterQuery,
  type ActivityFilterDraft,
} from '@/views/administration/helpers/activity-filters'
import { profileActivityFilterKeys, profileActivityFilters } from '../helpers/activity-query'
import { PROFILE_ACTIVITY_DEFAULT_TAKE } from '../stores/profile'

export function useProfileActivityFilters() {
  const route = useRoute()
  const router = useRouter()
  const offcanvas = useOffcanvas()
  const { createWorkflow } = useOffcanvasSubmit()
  let ownedKey: string | undefined

  function openActivityFilters(): void {
    const key = crypto.randomUUID()

    ownedKey = key

    async function update(draft?: ActivityFilterDraft): Promise<void> {
      if (route.name !== 'profile-activity' || !workflow.isCurrent()) return

      await workflow.request(() =>
        router.replace({
          query: activityFilterQuery(route.query, draft, {
            keys: profileActivityFilterKeys,
            defaultTake: PROFILE_ACTIVITY_DEFAULT_TAKE,
          }),
        }),
      )
      workflow.complete()
    }

    offcanvas.open({
      view: ActivityFiltersPanel,
      side: 'right',
      size: 'sm',
      key,
      props: {
        accountOnly: true,
        initialFilters: activityFilterDraft(profileActivityFilters(route.query)),
        onApply: update,
        onClear: () => update(),
      },
    })
    const workflow = createWorkflow()
  }

  onBeforeUnmount(() => {
    if (ownedKey && offcanvas.$options.key === ownedKey) offcanvas.close()
  })

  return { openActivityFilters }
}
