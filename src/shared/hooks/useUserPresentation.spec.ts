import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createI18n } from 'vue-i18n'
import en from '@/shared/i18n/locales/en'
import fr from '@/shared/i18n/locales/fr'
import es from '@/shared/i18n/locales/es'
import { useUserPresentation } from './useUserPresentation'
import { useReferenceTranslations } from './useReferenceTranslations'
import { useAuditPresentation } from './useAuditPresentation'

const presentation = useUserPresentation()

describe('user presentation', () => {
  it('selects the highest role without mutating server order', () => {
    const roles = ['user', 'creator', 'administrator', 'system-administrator'].map((key) => ({
      key,
    }))
    expect(presentation.primaryRole(roles)?.key).toBe('system-administrator')
    expect(presentation.sortedRoles(roles).map((role) => role.key)).toEqual([
      'system-administrator',
      'administrator',
      'creator',
      'user',
    ])
    expect(roles[0]?.key).toBe('user')
    expect(presentation.primaryRole([])).toBeUndefined()
    expect(presentation.primaryRole([{ key: 'future' }, { key: 'creator' }])?.key).toBe('creator')
  })

  it.each([
    ['active', 'success'],
    ['disabled', 'danger'],
    ['locked', 'warning'],
    ['deleted', 'danger'],
    ['future', 'neutral'],
  ])('presents %s status as %s', (key, tone) => {
    expect(presentation.statusTone(key)).toBe(tone)
  })

  it('gives creators a distinct tone and unknown roles a neutral fallback', () => {
    expect(presentation.roleTone('creator')).toBe('info')
    expect(presentation.roleTone('administrator')).toBe('primary')
    expect(presentation.roleTone('future')).toBe('neutral')
  })
})

describe('localized activity and account references', () => {
  it.each([
    ['en', 'Identity', 'Creator', 'Deleted'],
    ['fr', 'Identité', 'Créateur', 'Supprimé'],
    ['es', 'Identidad', 'Creador', 'Eliminado'],
  ])(
    'translates domains, roles and statuses in %s with future value fallbacks',
    (locale, identity, creator, deleted) => {
      let references!: ReturnType<typeof useReferenceTranslations>
      let audit!: ReturnType<typeof useAuditPresentation>
      const wrapper = mount(
        defineComponent({
          setup() {
            references = useReferenceTranslations()
            audit = useAuditPresentation()
            return () => null
          },
        }),
        { global: { plugins: [createI18n({ legacy: false, locale, messages: { en, fr, es } })] } },
      )
      expect(references.activityDomainLabel('identity')).toBe(identity)
      expect(references.activityDomainLabel('future')).toBe('future')
      expect(
        references.roleLabel({ key: 'creator', label: 'Server creator' } as Parameters<
          typeof references.roleLabel
        >[0]),
      ).toBe(creator)
      expect(
        references.roleLabel({ key: 'future', label: 'Future role' } as Parameters<
          typeof references.roleLabel
        >[0]),
      ).toBe('Future role')
      expect(
        references.statusLabel({ key: 'deleted', label: 'Server deleted' } as Parameters<
          typeof references.statusLabel
        >[0]),
      ).toBe(deleted)
      expect(
        references.statusLabel({ key: 'future', label: 'Future status' } as Parameters<
          typeof references.statusLabel
        >[0]),
      ).toBe('Future status')
      expect(audit.domainTone('identity')).toBe('primary')
      expect(audit.domainTone('articles')).toBe('info')
      expect(audit.domainTone('future')).toBe('neutral')
      wrapper.unmount()
    },
  )
})
