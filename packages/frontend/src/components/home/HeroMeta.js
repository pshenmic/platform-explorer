import { ArrowCornerIcon } from '../ui/icons'
import { isNetworkLive, isApiOperational } from './utils'

function VersionValue ({ version, href }) {
  if (version === undefined || version === null) return <span className={'HomeHero__MetaValue'}>-</span>
  return (
    <a
      className={'HomeHero__MetaValue HomeHero__MetaVer'}
      href={href}
      target={'_blank'}
      rel={'noopener noreferrer'}
      aria-label={`v${version} release notes, opens in a new tab`}
    >
      v{version}
      <ArrowCornerIcon w={'8px'} h={'8px'}/>
    </a>
  )
}

function DotValue ({ ok, children }) {
  return (
    <span className={'HomeHero__MetaValue'}>
      <i className={`HomeHero__DotMark ${ok ? 'is-ok' : 'is-down'}`} aria-hidden={'true'}/>
      {children}
    </span>
  )
}

function MetaItem ({ label, children }) {
  return (
    <div className={'HomeHero__MetaItem'}>
      <span className={'HomeHero__MetaLabel'}>{label}</span>
      {children}
    </div>
  )
}

// Network / API status + Drive / Tenderdash versions as label-over-value mini-cells
// (consistent with the status row), between the brand block and the live block height.
export function HeroMeta ({ status }) {
  const live = isNetworkLive(status)
  const apiOk = isApiOperational(status)
  const drive = status?.versions?.software?.drive
  const tenderdash = status?.versions?.software?.tenderdash

  return (
    <div className={'HomeHero__Meta'}>
      <MetaItem label={'Network'}>
        <DotValue ok={live}>{status?.network || 'n/a'}</DotValue>
      </MetaItem>
      <MetaItem label={'API'}>
        <DotValue ok={apiOk}>{apiOk ? 'operational' : 'disrupted'}</DotValue>
      </MetaItem>
      <MetaItem label={'Drive'}>
        <VersionValue version={drive} href={'https://github.com/dashpay/platform/releases'}/>
      </MetaItem>
      <MetaItem label={'Tenderdash'}>
        <VersionValue version={tenderdash} href={'https://github.com/dashpay/tenderdash/releases'}/>
      </MetaItem>
    </div>
  )
}
