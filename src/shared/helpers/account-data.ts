import { useProfileStore } from '@/views/profile/stores/profile'
import { useSettingsStore } from '@/views/settings/stores/settings'
import { useAdministrationUsersStore } from '@/views/administration/stores/users'
import { useAdministrationActivityStore } from '@/views/administration/stores/activity'
import { useRouteDataStore } from '@/shared/stores/route-data'
import { useModalStore } from '@/shared/stores/modal'
import { useOffcanvas } from '@/shared/stores/offcanvas'
import { useToastStore } from '@/shared/stores/toasts'

/** Clear private data and invalidate requests even when their pages are not mounted. */
export function clearAccountData(): void {
  useRouteDataStore().invalidate()
  const profile = useProfileStore()

  profile.clearActivity('feedActivity')
  profile.clearActivity('tableActivity')
  useSettingsStore().reset()
  useAdministrationUsersStore().clear()
  useAdministrationActivityStore().clear()
  useModalStore().completeClose()
  useOffcanvas().completeClose()
  useToastStore().clearToasts()
}
