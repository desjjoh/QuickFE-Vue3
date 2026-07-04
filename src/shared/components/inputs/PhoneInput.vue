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
import { computed, ref, toRef, useId, watch } from 'vue'
import { useField } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import { Phone } from 'lucide-vue-next'

import type { CountryDto } from '@/library/models/reference'
import SelectInput from '@/shared/components/inputs/SelectInput.vue'
import { useLibraryStore } from '@/stores/library'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations'

const { countryLabel } = useReferenceTranslations()

export type PhoneInputValue = {
  phone_country_id: string
  phone_calling_code: string
  phone_national_number: string
  phone_e164: string
}

type PhoneFieldStyle = {
  '--prefix-width': string
}

type Props = {
  id?: string
  name: string
  value?: PhoneInputValue
  disabled?: boolean
  placeholder?: string
  defaultCountry?: string
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  autofocus: false,
})

const emit = defineEmits<{
  update: [value: PhoneInputValue | undefined]
}>()

const { t } = useI18n()
const libraryStore = useLibraryStore()
const name = toRef(props, 'name')
const generatedId = useId()

const countrySelectId = computed<string>(() => `${props.id ?? generatedId}-country`)

const { value, errorMessage, handleBlur, setValue } = useField<PhoneInputValue | undefined>(
  name.value,
  undefined,
  {
    initialValue: props.value,
    validateOnValueUpdate: false,
  },
)

const selectedCountryKey = ref<string>('')
const nationalNumber = ref<string>('')

const countryOptions = computed<CountryDto[]>(() => {
  return libraryStore.countries.filter((country) => !!getCallingCode(country))
})

const selectedCountry = computed<CountryDto | undefined>(() => {
  return countryOptions.value.find((country) => getCountryKey(country) === selectedCountryKey.value)
})

const selectedCallingCode = computed<string>(() => {
  return selectedCountry.value ? getCallingCode(selectedCountry.value) : '+'
})

const phoneFieldStyle = computed<PhoneFieldStyle>(() => {
  return {
    '--prefix-width': `calc(${selectedCallingCode.value.length}ch + 1.4rem)`,
  }
})

const showError = computed<boolean>(() => !!errorMessage.value)

const computedPlaceholder = computed<string>(() => {
  const placeholder = props.placeholder ?? selectedCountry.value?.phone_national_placeholder

  if (!placeholder) return t('common.phone.placeholder')

  if (!selectedCountry.value) return placeholder

  return formatPhoneDigits(
    extractPhoneDigits(placeholder),
    selectedCountry.value.phone_format_groups,
  )
})

const countryPlaceholder = computed<string>(() => {
  return countryOptions.value.length ? t('common.country') : t('common.loading')
})

const maxNationalDigits = computed<number>(() => {
  if (!selectedCountry.value) return 15

  return getMaxNationalDigits(selectedCountry.value)
})

const displayNationalNumber = computed<string>(() => {
  if (!selectedCountry.value) return nationalNumber.value

  return formatPhoneDigits(nationalNumber.value, selectedCountry.value.phone_format_groups)
})

const maxDisplayLength = computed<number>(() => {
  if (!selectedCountry.value) return 15

  return formatPhoneDigits(
    '9'.repeat(maxNationalDigits.value),
    selectedCountry.value.phone_format_groups,
  ).length
})

function extractPhoneDigits(value: string | undefined | null): string {
  return value?.replace(/\D/g, '') ?? ''
}

function formatPhoneDigits(digits: string, groups: number[]): string {
  if (!groups.length) return digits

  const parts: string[] = []
  let cursor = 0

  for (const groupSize of groups) {
    const part = digits.slice(cursor, cursor + groupSize)

    if (!part) break

    parts.push(part)
    cursor += groupSize
  }

  const remaining = digits.slice(cursor)

  if (remaining) {
    parts.push(remaining)
  }

  return parts.join('-')
}

function getCountryKey(country: CountryDto): string {
  return country.id
}

function getCallingCode(country: CountryDto): string {
  const callingCode = country.calling_code.trim()

  if (!callingCode) return ''

  return callingCode.startsWith('+') ? callingCode : `+${callingCode}`
}

function getCallingCodeDigits(country: CountryDto): string {
  return extractPhoneDigits(getCallingCode(country))
}

function getMaxNationalDigits(country: CountryDto): number {
  const formatGroupTotal = country.phone_format_groups.reduce((total, groupSize) => {
    return total + groupSize
  }, 0)

  const e164MaxDigits = Math.max(0, 15 - getCallingCodeDigits(country).length)

  return Math.min(formatGroupTotal, e164MaxDigits)
}

function countryMatchesDefault(country: CountryDto, defaultCountry: string): boolean {
  const normalizedDefault = defaultCountry.trim().toLowerCase()

  return [country.id, country.key, country.iso2, country.iso3]
    .filter(Boolean)
    .some((countryValue) => countryValue.toLowerCase() === normalizedDefault)
}

function findCountryById(countryId: string | undefined): CountryDto | undefined {
  if (!countryId) return undefined

  return countryOptions.value.find((country) => country.id === countryId)
}

function findCountryByDefault(): CountryDto | undefined {
  if (!props.defaultCountry) return undefined

  return countryOptions.value.find((country) =>
    countryMatchesDefault(country, props.defaultCountry!),
  )
}

function findCountryByE164(e164Value: string | undefined): CountryDto | undefined {
  if (!e164Value) return undefined

  const digits = extractPhoneDigits(e164Value)

  const matches = countryOptions.value
    .filter((country) => digits.startsWith(getCallingCodeDigits(country)))
    .sort((a, b) => getCallingCodeDigits(b).length - getCallingCodeDigits(a).length)

  if (!matches.length) return undefined

  const defaultCountry = findCountryByDefault()

  if (
    defaultCountry &&
    matches.some((country) => getCountryKey(country) === getCountryKey(defaultCountry))
  ) {
    return defaultCountry
  }

  return matches[0]
}

function resolveCountryFromValue(phoneValue: PhoneInputValue | undefined): CountryDto | undefined {
  const countryFromId = findCountryById(phoneValue?.phone_country_id)

  if (countryFromId) return countryFromId

  const countryFromE164 = findCountryByE164(phoneValue?.phone_e164)

  if (countryFromE164) return countryFromE164

  const defaultCountry = findCountryByDefault()

  if (defaultCountry) return defaultCountry

  return countryOptions.value[0]
}

function resolveNationalNumber(
  phoneValue: PhoneInputValue | undefined,
  country: CountryDto | undefined,
): string {
  if (!phoneValue) return ''
  if (!country) return extractPhoneDigits(phoneValue.phone_national_number).slice(0, 15)

  const maxDigits = getMaxNationalDigits(country)

  if (phoneValue.phone_national_number) {
    return extractPhoneDigits(phoneValue.phone_national_number).slice(0, maxDigits)
  }

  const e164Digits = extractPhoneDigits(phoneValue.phone_e164)
  const callingCodeDigits = getCallingCodeDigits(country)

  if (e164Digits.startsWith(callingCodeDigits)) {
    return e164Digits.slice(callingCodeDigits.length, callingCodeDigits.length + maxDigits)
  }

  return e164Digits.slice(0, maxDigits)
}

function buildPhoneValue(
  country: CountryDto | undefined,
  rawNationalNumber: string,
): PhoneInputValue | undefined {
  if (!country) return undefined

  const callingCode = getCallingCode(country)
  const nationalDigits = extractPhoneDigits(rawNationalNumber).slice(
    0,
    getMaxNationalDigits(country),
  )

  if (!nationalDigits) return undefined

  return {
    phone_country_id: country.id,
    phone_calling_code: callingCode,
    phone_national_number: nationalDigits,
    phone_e164: `${callingCode}${nationalDigits}`,
  }
}

function phoneValuesEqual(
  left: PhoneInputValue | undefined,
  right: PhoneInputValue | undefined,
): boolean {
  if (!left && !right) return true
  if (!left || !right) return false

  return (
    left.phone_country_id === right.phone_country_id &&
    left.phone_calling_code === right.phone_calling_code &&
    left.phone_national_number === right.phone_national_number &&
    left.phone_e164 === right.phone_e164
  )
}

function selectCountry(country: CountryDto | undefined): void {
  selectedCountryKey.value = country ? getCountryKey(country) : ''
}

function syncPhoneValue(): void {
  const nextValue = buildPhoneValue(selectedCountry.value, nationalNumber.value)

  setValue(nextValue, false)
  emit('update', nextValue)
}

function syncFromValue(phoneValue: PhoneInputValue | undefined): void {
  const country = resolveCountryFromValue(phoneValue)

  selectCountry(country)

  nationalNumber.value = resolveNationalNumber(phoneValue, country)
  setValue(phoneValue, false)
}

function onCountryUpdate(country: CountryDto | undefined): void {
  selectCountry(country)

  if (country) nationalNumber.value = nationalNumber.value.slice(0, getMaxNationalDigits(country))

  if (!nationalNumber.value) {
    setValue(undefined, false)
    return
  }

  syncPhoneValue()
}

function onNumberInput(event: Event): void {
  const target = event.target as HTMLInputElement
  const rawValue = target.value
  const isInternationalInput = rawValue.trim().startsWith('+')

  if (isInternationalInput) {
    const pastedCountry = findCountryByE164(rawValue)

    if (pastedCountry) {
      selectCountry(pastedCountry)
    }
  }

  const country = selectedCountry.value
  const rawDigits = extractPhoneDigits(rawValue)

  const digits =
    isInternationalInput && country
      ? resolveNationalNumber(
          {
            phone_country_id: country.id,
            phone_calling_code: getCallingCode(country),
            phone_national_number: '',
            phone_e164: rawValue,
          },
          country,
        )
      : rawDigits.slice(0, maxNationalDigits.value)

  nationalNumber.value = digits

  target.value = selectedCountry.value
    ? formatPhoneDigits(digits, selectedCountry.value.phone_format_groups)
    : digits

  syncPhoneValue()
}

watch(
  countryOptions,
  () => {
    syncFromValue(props.value)
  },
  { immediate: true },
)

watch(
  () => props.value,
  (phoneValue) => {
    if (phoneValuesEqual(phoneValue, value.value)) return

    syncFromValue(phoneValue)
  },
)
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
