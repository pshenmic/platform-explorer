import type { ReactNode } from 'react'
import { ArrowCornerIcon } from '../ui/icons'
import { Skeleton } from './Skeleton'
import { isNetworkLive, isApiOperational, formatNetworkLabel } from './utils'

function VersionValue({
  version,
  href,
  loading
}: {
  version?: string | number | null
  href: string
  loading: boolean
}) {
  if (loading) {
    return (
      <span className={'HomeHero__MetaValue HomeHero__MetaChip HomeHero__MetaChip--Loading'}>
        <Skeleton w={'54px'} h={'0.8em'} />
      </span>
    )
  }
  if (version === undefined || version === null || version === '') {
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
      <ArrowCornerIcon w={'8px'} h={'8px'} />
    </a>
  )
}

function StatusValue({
  ok,
  loading,
  children
}: {
  ok: boolean
  loading: boolean
  children: ReactNode
}) {
  const state = loading ? 'is-loading' : ok ? 'is-ok' : 'is-down'
  return (
    <span className={`HomeHero__MetaValue HomeHero__MetaChip HomeHero__MetaChip--Status ${state}`}>
      {loading ? <Skeleton w={'82px'} h={'0.8em'} /> : children}
    </span>
  )
}

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={'HomeHero__MetaItem'}>
      <span className={'HomeHero__MetaLabel'}>{label}</span>
      {children}
    </div>
  )
}

export function HeroMeta({ status, loading }: { status?: any; loading?: boolean }) {
  const ready = !loading && status && Object.keys(status).length > 0
  const live = isNetworkLive(status)
  const apiOk = isApiOperational(status)
  const drive = status?.versions?.software?.drive
  const tenderdash = status?.versions?.software?.tenderdash
  const networkLabel = formatNetworkLabel(status?.network) || status?.network || 'n/a'

  return (
    <div className={'HomeHero__Meta'}>
      <MetaItem label={'Network'}>
        <StatusValue ok={live} loading={!ready}>
          {networkLabel}
        </StatusValue>
      </MetaItem>
      <MetaItem label={'API'}>
        <StatusValue ok={apiOk} loading={!ready}>
          {apiOk ? 'online' : 'offline'}
        </StatusValue>
      </MetaItem>
      <MetaItem label={'Drive'}>
        <VersionValue
          version={drive}
          href={'https://github.com/dashpay/platform/releases'}
          loading={!ready}
        />
      </MetaItem>
      <MetaItem label={'Tenderdash'}>
        <VersionValue
          version={tenderdash}
          href={'https://github.com/dashpay/tenderdash/releases'}
          loading={!ready}
        />
      </MetaItem>
    </div>
  )
}
