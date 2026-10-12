import type { Tone } from '@/library/components/badges/badges'
import { RoleKey } from '@/config/permissions'

const rolePriority: Record<string, number> = {
  [RoleKey.SYSTEM_ADMINISTRATOR]: 4,
  [RoleKey.ADMINISTRATOR]: 3,
  [RoleKey.CREATOR]: 2,
  [RoleKey.USER]: 1,
}

export function useUserPresentation() {
  function sortedRoles<T extends { key: string }>(roles: readonly T[]): T[] {
    return [...roles].sort((a, b) => (rolePriority[b.key] ?? 0) - (rolePriority[a.key] ?? 0))
  }

  function primaryRole<T extends { key: string }>(roles: readonly T[]): T | undefined {
    return sortedRoles(roles)[0]
  }

  function roleTone(key: string): Tone {
    switch (key) {
      case RoleKey.SYSTEM_ADMINISTRATOR:
      case RoleKey.ADMINISTRATOR:
        return 'primary'
      case RoleKey.CREATOR:
        return 'info'
      default:
        return 'neutral'
    }
  }

  function statusTone(key: string): Tone {
    switch (key) {
      case 'active':
        return 'success'
      case 'locked':
        return 'warning'
      case 'disabled':
      case 'deleted':
        return 'danger'
      default:
        return 'neutral'
    }
  }

  return { sortedRoles, primaryRole, roleTone, statusTone }
}
