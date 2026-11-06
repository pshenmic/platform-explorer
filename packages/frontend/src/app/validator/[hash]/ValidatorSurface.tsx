import { useId } from 'react'
import './ValidatorSurface.css'

const contours = {
  earnings:
    'M19 1H502C520 1 520 9 538 9H661Q679 9 679 27V221Q679 239 661 239H178C160 239 160 231 142 231H19Q1 231 1 213V19Q1 1 19 1Z',
  profile:
    'M19 1H516C534 1 534 13 552 13H661Q679 13 679 31V221Q679 239 661 239H19Q1 239 1 221V19Q1 1 19 1Z',
  participation:
    'M19 1H661Q679 1 679 19V207Q679 225 661 225H646C628 225 630 239 612 239H19Q1 239 1 221V19Q1 1 19 1Z',
  ownership: 'M19 1H661Q679 1 679 19V219L659 239H19Q1 239 1 221V19Q1 1 19 1Z'
}

export default function ValidatorSurface({ kind }: { kind: keyof typeof contours }) {
  const accentId = useId()
  const accented = kind === 'earnings'
  return (
    <svg
      className="ValidatorSurface"
      viewBox="0 0 680 240"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {accented && (
        <defs>
          <radialGradient
            id={`${accentId}-top`}
            cx="0"
            cy="0"
            r="1"
            gradientTransform="scale(.34 .45)"
          >
            <stop stopColor="var(--earnings-core-color)" stopOpacity="0.9" />
            <stop offset="0.4" stopColor="var(--earnings-core-color)" stopOpacity="0.6" />
            <stop offset="1" stopColor="var(--earnings-core-color)" stopOpacity="0" />
          </radialGradient>
          <radialGradient
            id={`${accentId}-bottom`}
            cx="0"
            cy="0"
            r="1"
            gradientTransform="translate(1 1) scale(.34 .45)"
          >
            <stop stopColor="var(--earnings-platform-color)" stopOpacity="0.9" />
            <stop offset="0.4" stopColor="var(--earnings-platform-color)" stopOpacity="0.6" />
            <stop offset="1" stopColor="var(--earnings-platform-color)" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      <path d={contours[kind]} />
      {accented && (
        <>
          <path
            className="ValidatorSurface__Accent"
            d={contours[kind]}
            style={{ stroke: `url(#${accentId}-top)` }}
          />
          <path
            className="ValidatorSurface__Accent"
            d={contours[kind]}
            style={{ stroke: `url(#${accentId}-bottom)` }}
          />
        </>
      )}
    </svg>
  )
}
