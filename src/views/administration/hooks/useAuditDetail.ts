import { onBeforeUnmount, ref, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { isAxiosError } from 'axios'
import type { AuditDto } from '@/library/models/audit'
import { AuditPermissions } from '@/config/permissions'
import { useAuthStore } from '@/shared/stores/auth'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'

export type AuditDetailError = 'unavailable' | 'forbidden' | 'unauthorized' | 'failed'

export function useAuditDetail(
  id: MaybeRefOrGetter<string>,
  active: MaybeRefOrGetter<boolean> = true,
) {
  const record = shallowRef<AuditDto | null>(null)
  const loading = ref(false)
  const error = ref<AuditDetailError | null>(null)
  const auth = useAuthStore()
  let requestId = crypto.randomUUID()

  function clear() {
    requestId = crypto.randomUUID()
    record.value = null
    loading.value = false
    error.value = null
  }

  async function reload(): Promise<void> {
    clear()
    if (!toValue(active)) return
    if (!auth.isAuthenticated) {
      error.value = 'unauthorized'
      return
    }
    if (!auth.canActivate([AuditPermissions.READ_AUDIT_DETAIL])) {
      error.value = 'forbidden'
      return
    }
    const currentRequest = requestId
    const auditId = toValue(id)
    loading.value = true
    try {
      const token = await auth.getValidAccessToken()
      if (requestId !== currentRequest) return
      const result = await useLocalHostAPI().administration.audits.detail(token, auditId)
      if (requestId !== currentRequest) return
      record.value = result
    } catch (cause) {
      if (requestId !== currentRequest) return
      const status = isAxiosError(cause) ? cause.response?.status : undefined
      error.value =
        status === 404
          ? 'unavailable'
          : status === 403
            ? 'forbidden'
            : status === 401
              ? 'unauthorized'
              : 'failed'
    } finally {
      if (requestId === currentRequest) loading.value = false
    }
  }

  watch(
    () => [toValue(id), toValue(active)],
    () => {
      void reload()
    },
    { immediate: true, flush: 'sync' },
  )
  onBeforeUnmount(clear)
  return { record, loading, error, reload, clear }
}
