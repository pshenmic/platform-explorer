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
  return (
    <svg
      className="ValidatorSurface"
      viewBox="0 0 680 240"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={contours[kind]} />
    </svg>
  )
}
