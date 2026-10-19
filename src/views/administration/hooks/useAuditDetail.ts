import { onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { storeToRefs } from 'pinia'
import { AuditPermissions } from '@/config/permissions'
import { useAuthStore } from '@/shared/stores/auth'
import { useAdministrationActivityStore } from '../stores/activity'

export function useAuditDetail(
  id: MaybeRefOrGetter<string>,
  active: MaybeRefOrGetter<boolean> = true,
) {
  const store = useAdministrationActivityStore()
  const auth = useAuthStore()
  const owner = crypto.randomUUID()
  const { detail: record, detailError: error } = storeToRefs(store)

  function clear(): void {
    store.clearDetail(owner)
  }

  async function reload(): Promise<void> {
    if (!toValue(active)) {
      clear()
      return
    }
    await store.loadDetail(toValue(id), owner)
  }

  // Register before the modal's top-level await, including pending setup cleanup.
  watch(
    [() => toValue(id), () => toValue(active)],
    () => {
      void reload()
    },
    { flush: 'sync' },
  )
  watch(
    [
      () => auth.isAuthenticated,
      () => auth.user?.id,
      () => auth.canActivate([AuditPermissions.READ_AUDIT_DETAIL]),
    ],
    clear,
    { flush: 'sync' },
  )
  onScopeDispose(clear)
  return { record, error, reload, clear }
}
