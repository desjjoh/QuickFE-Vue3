import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { prettyJsonToHtml, toSafeJson, type JsonViewerOptions } from '@/shared/helpers/json-viewer'

export function useJsonViewer(
  item: MaybeRefOrGetter<unknown>,
  options: MaybeRefOrGetter<JsonViewerOptions> = {},
) {
  const html = computed(() => prettyJsonToHtml(toSafeJson(toValue(item)), toValue(options)))

  return { html }
}
