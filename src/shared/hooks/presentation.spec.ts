import { describe, expect, it, vi } from 'vitest'
import { computed, ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { createTestPlugins, mountLibrary } from '@test/support/mount'
import { defineComponent } from 'vue'
import { useReferenceTranslations } from './useReferenceTranslations'
import { useAuditPresentation } from './useAuditPresentation'
import { useJsonViewer } from './useJsonViewer'
import { useErrorMessage, getFallbackMessage, getStack } from './useErrorMessage'
import { RoleDto } from '@/library/models/reference'
import { buildUser, buildAudit } from '@test/support/fixtures'
import { AuditDto } from '@/library/models/audit'

describe('reactive presentation and fallbacks', () => {
  it('uses translated roles/status/domains, preserves unknown labels and reacts to locale changes', async () => {
    let labels!: ReturnType<typeof useReferenceTranslations>
    let locale!: import('vue').Ref<string>
    const wrapper = mountLibrary(
      defineComponent({
        setup() {
          labels = useReferenceTranslations()
          locale = useI18n().locale
          return () => null
        },
      }),
    )
    const role = new RoleDto({
      ...buildUser().status,
      permissions: [],
      key: 'creator',
      label: 'Backend label',
    })
    expect(labels.roleLabel(role)).toBe('Creator')
    expect(labels.statusLabel({ key: 'active', label: 'Backend' })).toBe('Active')
    expect(labels.activityDomainLabel('identity')).toBe('Identity')
    expect(labels.activityDomainLabel('future.domain')).toBe('future.domain')
    expect(labels.statusLabel({ key: 'unknown', label: 'Unknown fallback' })).toBe(
      'Unknown fallback',
    )
    locale.value = 'fr'
    await nextTick()
    expect(labels.roleLabel(role)).not.toBe('Creator')
    wrapper.unmount()
  })
  it('translates audit events and falls back safely for unknown events and missing context', () => {
    let presentation!: ReturnType<typeof useAuditPresentation>
    mountLibrary(
      defineComponent({
        setup() {
          presentation = useAuditPresentation({
            eventKeyNamespace: 'library.activityDomains',
            unavailableKey: 'library.table.empty',
            dateFallbackKey: 'library.table.empty',
          })
          return () => null
        },
      }),
    )
    expect(presentation.eventLabel('identity')).toBe('Identity')
    expect(presentation.eventLabel('future.event')).toBe('future.event')
    expect(presentation.domainTone('identity')).toBe('primary')
    expect(presentation.domainTone('articles')).toBe('info')
    expect(presentation.domainTone('other')).toBe('neutral')
    expect(presentation.locationDescription('Toronto', 'Ontario')).toBe('Toronto, Ontario')
    expect(presentation.locationDescription(null, null)).toBeTruthy()
    expect(presentation.deviceDescription(null, 'Windows')).toBe('Windows')
    expect(presentation.deviceDescription(null, null)).toBeNull()
    expect(presentation.formatDateTime(new Date(NaN))).toBeTruthy()
    expect(
      presentation.activityDescription(new AuditDto(buildAudit({ browser: null, os: null }))),
    ).toBeTruthy()
    for (const [event, tone] of [
      ['identity.session.revoked', 'danger'],
      ['identity.avatar.assigned', 'success'],
      ['identity.profile.changed', 'warning'],
      ['identity.sign_in.succeeded', 'primary'],
      ['future.event', 'neutral'],
    ])
      expect(presentation.activityTone(event!)).toBe(tone)
  })
  it('updates serialized JSON when the item or options change without mutating input', () => {
    const item = ref<unknown>({ value: '<script>long text</script>' })
    const options = ref({ maxStringLength: 4 })
    const { html } = useJsonViewer(
      () => item.value,
      computed(() => options.value),
    )
    expect(html.value).toContain('&lt;scr')
    expect(html.value).not.toContain('<script>')
    options.value.maxStringLength = 2
    expect(html.value).toContain('&lt;s')
    item.value = null
    expect(html.value).toContain('null')
  })
  it.each([null, undefined, 42, { response: null }, { response: { data: { message: 42 } } }])(
    'handles malformed error %j',
    (error) => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      expect(useErrorMessage().getErrorMessage(error)).toBe('An unexpected error occurred.')
      expect(getStack(error)).toBeUndefined()
    },
  )
  it('prefers backend messages, handles empty validation arrays and retains stack evidence', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(
      useErrorMessage().getErrorMessage({
        message: 'fallback',
        response: { data: { message: ['first', 'second'] } },
      }),
    ).toBe('first')
    expect(
      useErrorMessage().getErrorMessage({
        message: 'fallback',
        response: { data: { message: [] } },
      }),
    ).toBe('fallback')
    expect(getFallbackMessage(new Error('failure'))).toBe('failure')
    expect(getStack({ stack: 'trace' })).toBe('trace')
    expect(createTestPlugins('es')).toHaveLength(2)
  })
  it('ignores non-string entries in malformed validation messages', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(
      useErrorMessage().getErrorMessage({
        message: 'fallback',
        response: { data: { message: [null, 42, { error: true }] } },
      }),
    ).toBe('fallback')
    expect(
      useErrorMessage().getErrorMessage({ response: { data: { message: [42, 'valid'] } } }),
    ).toBe('valid')
  })
})
