export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse'
export type FlexAlign = 'normal' | 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline'
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
export type FlexJustify =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'

export type Overflow = 'auto' | 'hidden' | 'scroll' | 'visible'
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

export type Props = {
  direction?: FlexDirection
  gap?: number
  gapX?: number
  gapY?: number
  padding?: number
  justifyContent?: FlexJustify
  alignItems?: FlexAlign
  overflow?: Overflow
  overflowX?: Overflow
  overflowY?: Overflow
  alignSelf?: AlignSelf
  grow?: boolean
  shrink?: boolean
  wrap?: FlexWrap
  inline?: boolean
  fullWidth?: boolean
  fullHeight?: boolean
  justifySelf?: JustifySelf
}
