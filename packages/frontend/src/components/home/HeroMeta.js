import { ArrowCornerIcon } from '../ui/icons'
import { Skeleton } from './Skeleton'
import { isNetworkLive, isApiOperational } from './utils'

function VersionValue ({ version, href, loading }) {
  if (loading) return <span className={'HomeHero__MetaValue'}><Skeleton w={'54px'} h={'0.8em'}/></span>
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

function DotValue ({ ok, loading, children }) {
  const state = loading ? 'is-loading' : (ok ? 'is-ok' : 'is-down')
  return (
    <span className={'HomeHero__MetaValue'}>
      <i className={`HomeHero__DotMark ${state}`} aria-hidden={'true'}/>
      {loading ? <Skeleton w={'82px'} h={'0.8em'}/> : children}
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
export function HeroMeta ({ status, loading }) {
  // until status data arrives, render neutral placeholders (no red "down" flash)
  const ready = !loading && status && Object.keys(status).length > 0
  const live = isNetworkLive(status)
  const apiOk = isApiOperational(status)
  const drive = status?.versions?.software?.drive
  const tenderdash = status?.versions?.software?.tenderdash

  return (
    <div className={'HomeHero__Meta'}>
      <MetaItem label={'Network'}>
        <DotValue ok={live} loading={!ready}>{status?.network || 'n/a'}</DotValue>
      </MetaItem>
      <MetaItem label={'API'}>
        <DotValue ok={apiOk} loading={!ready}>{apiOk ? 'operational' : 'disrupted'}</DotValue>
      </MetaItem>
      <MetaItem label={'Drive'}>
        <VersionValue version={drive} href={'https://github.com/dashpay/platform/releases'} loading={!ready}/>
      </MetaItem>
      <MetaItem label={'Tenderdash'}>
        <VersionValue version={tenderdash} href={'https://github.com/dashpay/tenderdash/releases'} loading={!ready}/>
      </MetaItem>
    </div>
  )
}
