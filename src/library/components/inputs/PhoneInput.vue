<template>
  <div class="phone-field">
    <div class="phone-field__country">
      <SelectInput
        :id="countrySelectId"
        :name="`${name}-country`"
        :value="selectedCountry"
        :options="countryOptions"
        :placeholder="countryPlaceholder"
        :disabled="disabled || !countryOptions.length"
        :get-label="countryLabel"
        :get-key="getCountryKey"
        @update="onCountryUpdate"
      />
    </div>

    <div class="phone-field__number" :style="phoneFieldStyle">
      <span class="phone-field__prefix" aria-hidden="true">
        {{ selectedCallingCode }}
      </span>

      <input
        :id="id"
        class="phone-field__input"
        :class="[showError && 'has-error', (disabled || !selectedCountry) && 'is-disabled']"
        type="tel"
        inputmode="numeric"
        autocomplete="tel-national"
        :name="name"
        :placeholder="computedPlaceholder"
        :maxlength="maxDisplayLength"
        :disabled="disabled || !selectedCountry"
        :aria-invalid="showError ? 'true' : 'false'"
        :aria-describedby="countrySelectId"
        :value="displayNationalNumber"
        :data-autofocus="autofocus ?? undefined"
        @input="onNumberInput"
        @blur="handleBlur"
      />

      <span class="phone-field__icon" aria-hidden="true">
        <Phone :size="14" :stroke-width="3" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef, useId } from 'vue'
import { useField } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import { Phone } from 'lucide-vue-next'

import SelectInput from '@/library/components/inputs/SelectInput.vue'
import { useLibraryStore } from '@/shared/stores/library'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations'
import { formatPhoneDigitGroups } from '@/shared/helpers/phone'
import { usePhoneInput } from './hooks/usePhoneInput'
import {
  extractPhoneDigits,
  getCallingCode,
  getCountryKey,
  type PhoneInputValue,
} from './hooks/phoneInputUtils'

export type { PhoneInputValue } from './hooks/phoneInputUtils'

type PhoneFieldStyle = { '--prefix-width': string }
type Props = {
  id?: string
  name: string
  value?: PhoneInputValue
  disabled?: boolean
  placeholder?: string
  defaultCountry?: string
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), { disabled: false, autofocus: false })
const emit = defineEmits<{ update: [value: PhoneInputValue | undefined] }>()

const { t } = useI18n()
const { countryLabel } = useReferenceTranslations()
const libraryStore = useLibraryStore()
const name = toRef(props, 'name')
const generatedId = useId()
const countrySelectId = computed(() => `${props.id ?? generatedId}-country`)

const { value, errorMessage, handleBlur, setValue } = useField<PhoneInputValue | undefined>(
  name.value,
  undefined,
  { initialValue: props.value, validateOnValueUpdate: false },
)

const countryOptions = computed(() =>
  libraryStore.countries.filter((country) => !!getCallingCode(country)),
)

const {
  selectedCountry,
  nationalNumber,
  maxNationalDigits,
  onCountryUpdate,
  onNumberInput: handleNumberInput,
} = usePhoneInput({
  countries: countryOptions,
  externalValue: () => props.value,
  defaultCountry: () => props.defaultCountry,
  fieldValue: value,
  setValue,
  emitUpdate: (nextValue) => emit('update', nextValue),
})

const selectedCallingCode = computed(() =>
  selectedCountry.value ? getCallingCode(selectedCountry.value) : '+',
)

const phoneFieldStyle = computed<PhoneFieldStyle>(() => ({
  '--prefix-width': `calc(${selectedCallingCode.value.length}ch + 1.4rem)`,
}))

const showError = computed(() => !!errorMessage.value)
const computedPlaceholder = computed(() => {
  const placeholder = props.placeholder ?? selectedCountry.value?.phone_national_placeholder
  if (!placeholder) return t('common.phone.placeholder')
  if (!selectedCountry.value) return placeholder
  return formatPhoneDigitGroups(
    extractPhoneDigits(placeholder),
    selectedCountry.value.phone_format_groups,
    '-',
  )
})
const countryPlaceholder = computed(() =>
  countryOptions.value.length ? t('common.country') : t('common.loading'),
)
const displayNationalNumber = computed(() =>
  selectedCountry.value
    ? formatPhoneDigitGroups(nationalNumber.value, selectedCountry.value.phone_format_groups, '-')
    : nationalNumber.value,
)
const maxDisplayLength = computed(() =>
  selectedCountry.value
    ? formatPhoneDigitGroups(
        '9'.repeat(maxNationalDigits.value),
        selectedCountry.value.phone_format_groups,
        '-',
      ).length
    : 15,
)
function onNumberInput(event: Event): void {
  handleNumberInput(event)
  ;(event.target as HTMLInputElement).value = displayNationalNumber.value
}
</script>

<style scoped lang="scss">
.phone-field {
  display: grid;
  grid-template-columns: minmax(10rem, 16rem) minmax(0, 1fr);
  align-items: start;
  gap: space(2);
  width: 100%;
}

.phone-field__country {
  min-width: 0;

  :deep(.select-field__input) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.phone-field__number {
  --prefix-width: 4rem;

  position: relative;
  min-width: 0;
  width: 100%;
}

.phone-field__input {
  --input-text: #{color(text, primary)};
  --input-bg: #{color(control, input-bg)};

  --input-border: #{color(theme, neutral, theme-alpha, 7)};
  --input-border-hover: #{color(theme, neutral, theme-alpha, 8)};
  --input-border-focus: #{color(theme, primary, theme-alpha, 8)};
  --input-ring: #{color(theme, primary, theme-alpha, 4)};

  display: block;

  width: 100%;
  height: space(8);
  padding-block: space(2);
  padding-inline: calc(var(--prefix-width) + #{space(1)}) space(8);

  color: var(--input-text);
  background-color: var(--input-bg);

  border: 0.1rem solid var(--input-border);
  border-radius: border-radius(sm);

  font: inherit;
  line-height: 1;
  outline: none;

  @media (hover: hover) {
    &:hover {
      border-color: var(--input-border-hover);
    }
  }

  &:focus {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 0.4rem var(--input-ring);
  }

  &.has-error {
    --input-border: #{color(theme, danger, theme-alpha, 7)};
    --input-border-hover: #{color(theme, danger, theme-alpha, 8)};
    --input-border-focus: #{color(theme, danger, theme-alpha, 8)};
    --input-ring: #{color(theme, danger, theme-alpha, 4)};
  }

  &.is-disabled {
    pointer-events: none;
    opacity: 0.75;
  }

  &::placeholder {
    color: color(text, tertiary);
  }
}

.phone-field__prefix {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;

  pointer-events: none;
  user-select: none;

  display: inline-flex;
  align-items: center;
  justify-content: flex-start;

  width: var(--prefix-width);
  height: 100%;
  padding-inline-start: space(3);
  padding-inline-end: space(1);
  padding-top: space(2);
  padding-bottom: space(2);

  color: color(text, secondary);
  font: inherit;
  line-height: 1;
  white-space: nowrap;
}

.phone-field__icon {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;

  pointer-events: none;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: space(8);
  height: 100%;

  color: color(text, secondary);
}
</style>
