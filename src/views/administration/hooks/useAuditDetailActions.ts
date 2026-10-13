import { computed, onBeforeUnmount } from 'vue'
import { AuditPermissions } from '@/config/permissions'
import { useAuthStore } from '@/shared/stores/auth'
import { useModalStore } from '@/shared/stores/modal'
import AuditDetailModal from '../pages/overview/components/AuditDetailModal.vue'

export function useAuditDetailActions() {
  const auth = useAuthStore()
  const modal = useModalStore()
  const canReadDetail = computed(
    () => auth.isAuthenticated && auth.canActivate([AuditPermissions.READ_AUDIT_DETAIL]),
  )
  let ownedKey: string | undefined

  function openAuditDetail(auditId: string) {
    if (!canReadDetail.value) return

    ownedKey = crypto.randomUUID()
    modal.open({ view: AuditDetailModal, size: 'lg', key: ownedKey, props: { auditId } })
  }

  onBeforeUnmount(() => {
    if (ownedKey && modal.getOptions.key === ownedKey) modal.close()
  })

  return { canReadDetail, openAuditDetail }
}
