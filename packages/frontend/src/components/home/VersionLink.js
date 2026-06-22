import { ArrowCornerIcon } from '../ui/icons'

// Drive / Tenderdash version as a release-tag pill linking to GitHub releases.
export function VersionLink ({ label, version, href }) {
  if (version === undefined || version === null) return null

  const [base, ...rest] = String(version).split('-')
  const pre = rest.join('-')

  return (
    <a
      className={'HomeHero__VersionTag'}
      href={href}
      target={'_blank'}
      rel={'noopener noreferrer'}
      aria-label={`${label} v${version} release notes, opens in a new tab`}
      title={`${label} v${version} — view release notes`}
    >
      <svg className={'HomeHero__VersionGlyph'} viewBox={'0 0 12 12'} aria-hidden={'true'}>
        <path d={'M6.1 1.2H1.7c-.3 0-.5.2-.5.5v4.4c0 .1.1.3.2.4l4.6 4.6c.2.2.5.2.7 0l4.4-4.4c.2-.2.2-.5 0-.7L6.5 1.4a.6.6 0 0 0-.4-.2Z'}/>
        <circle cx={'3.5'} cy={'3.5'} r={'1'}/>
      </svg>
      <span className={'HomeHero__VersionName'}>{label}</span>
      <span className={'HomeHero__VersionNum'}>v{base}</span>
      {pre && <span className={'HomeHero__VersionPre'}>{pre}</span>}
      <ArrowCornerIcon className={'HomeHero__VersionArrow'} w={'7px'} h={'7px'}/>
    </a>
  )
}
