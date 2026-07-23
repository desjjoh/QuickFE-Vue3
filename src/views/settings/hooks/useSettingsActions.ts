import { ref } from 'vue'

const settingsViewKey = ref(Date.now())

export function useSettings() {
  function refreshSettingsView(): void {
    settingsViewKey.value = Date.now()
  }

  return { settingsViewKey, refreshSettingsView }
}
