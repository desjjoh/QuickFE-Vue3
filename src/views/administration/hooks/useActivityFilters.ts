import { onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOffcanvas } from '@/shared/stores/offcanvas'
import { useAuthStore } from '@/shared/stores/auth'
import { createOverlayWorkflow } from '@/shared/helpers/overlay-workflow'
import ActivityFiltersPanel from '../pages/overview/components/ActivityFiltersPanel.vue'
import {
  activityFilterDraft,
  activityFilterQuery,
  type ActivityFilterDraft,
} from '../helpers/activity-filters'

export function useActivityFilters() {
  const route = useRoute()
  const router = useRouter()
  const offcanvas = useOffcanvas()
  const auth = useAuthStore()
  let ownedKey: string | undefined

  function openActivityFilters() {
    ownedKey = crypto.randomUUID()

    const key = ownedKey

    async function update(draft?: ActivityFilterDraft) {
      if (
        route.name !== 'administration-activity' ||
        offcanvas.$options.key !== key ||
        !workflow.isCurrent()
      )
        return
      await workflow.request(() =>
        router.replace({ query: activityFilterQuery(route.query, draft) }),
      )
      workflow.complete()
    }

    offcanvas.open({
      view: ActivityFiltersPanel,
      side: 'right',
      size: 'sm',
      key,
      props: {
        initialFilters: activityFilterDraft(route.query),
        onApply: (draft: ActivityFilterDraft) => update(draft),
        onClear: () => update(),
      },
    })
    const workflow = createOverlayWorkflow(auth, offcanvas)
  }

  onBeforeUnmount(() => {
    if (ownedKey && offcanvas.$options.key === ownedKey) offcanvas.close()
  })

  return { openActivityFilters }
}
