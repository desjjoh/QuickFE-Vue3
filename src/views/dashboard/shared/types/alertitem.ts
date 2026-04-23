import type { Variant } from '@/shared/types/components/text'
import type { Component } from 'vue'

export type AlertItem = {
  id: string
  icon: Component
  title: string
  message: string
  variant: Variant
}
