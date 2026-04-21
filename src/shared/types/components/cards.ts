import type { InjectionKey } from 'vue'

export type CardSize = 'sm' | 'md' | 'lg'

export type AlignSelf =
  | 'auto'
  | 'normal'
  | 'stretch'
  | 'flex-start'
  | 'flex-end'
  | 'start'
  | 'end'
  | 'center'
  | 'self-start'
  | 'self-end'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'safe start'
  | 'safe end'
  | 'safe center'
  | 'unsafe start'
  | 'unsafe end'
  | 'unsafe center'

export type JustifySelf =
  | 'auto'
  | 'normal'
  | 'stretch'
  | 'start'
  | 'end'
  | 'center'
  | 'self-start'
  | 'self-end'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'safe start'
  | 'safe end'
  | 'safe center'
  | 'unsafe start'
  | 'unsafe end'
  | 'unsafe center'

export type CardDirection = 'row' | 'column'

export type Props = {
  size?: CardSize
  alignSelf?: AlignSelf
  justifySelf?: JustifySelf
  direction?: CardDirection
}

export type CardContext = {
  isCard: boolean
}

export const CARD_CONTEXT: InjectionKey<CardContext> = Symbol('CardContext')
