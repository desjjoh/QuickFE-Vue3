declare module 'apca-w3' {
  export function sRGBtoY(rgb: number[]): number
  export function APCAcontrast(textY: number, backgroundY: number): number
  export function fontLookupAPCA(contrast: number): [string, ...number[]]
}
