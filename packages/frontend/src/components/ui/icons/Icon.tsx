import type { CSSProperties, SVGProps } from 'react'

export type IconSize = string | number

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height' | 'color'> {
  className?: string
  w?: IconSize
  h?: IconSize
  boxSize?: IconSize
  width?: IconSize
  height?: IconSize
  mr?: IconSize
  ml?: IconSize
  mb?: IconSize
  mt?: IconSize
  color?: string
  bg?: string
  flexShrink?: number | string
}

function toCssSize(value: IconSize | undefined): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return `${value * 0.25}rem`
  const raw = String(value)
  if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}px`
  return raw
}

function toCssColor(value: string | undefined): string | undefined {
  if (!value) return undefined
  if (value.startsWith('var(') || value.startsWith('#') || value.startsWith('rgb')) return value
  const token: Record<string, string> = {
    'brand.normal': 'var(--pe-color-brand-normal)',
    'brand.light': 'var(--pe-color-brand-light)'
  }
  return token[value] ?? value
}

function Icon({
  className,
  w,
  h,
  boxSize,
  width: _width,
  height: _height,
  mr,
  ml,
  mb,
  mt,
  color,
  bg: _bg,
  flexShrink = 0,
  style,
  children,
  ...rest
}: IconProps) {
  const sizeW = toCssSize(w ?? boxSize)
  const sizeH = toCssSize(h ?? boxSize)
  const marginRight = toCssSize(mr)
  const marginLeft = toCssSize(ml)
  const marginBottom = toCssSize(mb)
  const marginTop = toCssSize(mt)

  const resolvedStyle: CSSProperties = {
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink,
    width: sizeW ?? '1em',
    height: sizeH ?? '1em',
    ...(toCssColor(color) ? { color: toCssColor(color) } : {}),
    ...(marginRight ? { marginRight } : {}),
    ...(marginLeft ? { marginLeft } : {}),
    ...(marginBottom ? { marginBottom } : {}),
    ...(marginTop ? { marginTop } : {}),
    ...style
  }

  return (
    <svg className={className} focusable="false" aria-hidden style={resolvedStyle} {...rest}>
      {children}
    </svg>
  )
}

export default Icon
export { Icon }
