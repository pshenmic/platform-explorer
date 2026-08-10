import type { ReactNode } from 'react'
import { ArrowCornerIcon } from '../ui/icons'
import { Skeleton } from './Skeleton'
import { isNetworkLive, isApiOperational } from './utils'
import type { Status } from '../../types'

interface VersionValueProps {
  version?: string | number | null
  href: string
  loading?: boolean
}

function VersionValue ({ version, href, loading }: VersionValueProps) {
  if (loading) {
    return (
      <span className={'HomeHero__MetaValue HomeHero__MetaChip HomeHero__MetaChip--Loading'}>
        <Skeleton w={'54px'} h={'0.8em'}/>
      </span>
    )
  }
  if (version === undefined || version === null) {
    return <span className={'HomeHero__MetaValue HomeHero__MetaChip'}>-</span>
  }
  return (
    <a
      className={'HomeHero__MetaValue HomeHero__MetaVer HomeHero__MetaChip'}
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

interface StatusValueProps {
  ok?: boolean
  loading?: boolean
  children?: ReactNode
}

function StatusValue ({ ok, loading, children }: StatusValueProps) {
  const state = loading ? 'is-loading' : (ok ? 'is-ok' : 'is-down')
  return (
    <span className={`HomeHero__MetaValue HomeHero__MetaChip HomeHero__MetaChip--Status ${state}`}>
      {loading ? <Skeleton w={'82px'} h={'0.8em'}/> : children}
    </span>
  )
}

interface MetaItemProps {
  label: ReactNode
  children?: ReactNode
}

function MetaItem ({ label, children }: MetaItemProps) {
  return (
    <div className={'HomeHero__MetaItem'}>
      <span className={'HomeHero__MetaLabel'}>{label}</span>
      {children}
    </div>
  )
}

interface HeroMetaProps {
  status?: Status | null
  loading?: boolean
}

// Network / API status + Drive / Tenderdash versions as label-over-value mini-cells
export function HeroMeta ({ status, loading }: HeroMetaProps) {
  // until status data arrives, render neutral placeholders (no red "down" flash)
  const ready = !loading && status && Object.keys(status).length > 0
  const live = isNetworkLive(status)
  const apiOk = isApiOperational(status)
  const drive = status?.versions?.software?.drive
  const tenderdash = status?.versions?.software?.tenderdash

  return (
    <div className={'HomeHero__Meta'}>
      <MetaItem label={'Network'}>
        <StatusValue ok={live} loading={!ready}>{status?.network || 'n/a'}</StatusValue>
      </MetaItem>
      <MetaItem label={'API'}>
        <StatusValue ok={apiOk} loading={!ready}>{apiOk ? 'operational' : 'disrupted'}</StatusValue>
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
