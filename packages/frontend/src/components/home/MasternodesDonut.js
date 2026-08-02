'use client'

import { useState, useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import { Skeleton } from './Skeleton'
import { StatusBar } from './StatusBar'
import './MasternodesDonut.scss'

const MAX_COUNTRIES = 10
const R = 34
const C = 2 * Math.PI * R

const regionNames = (() => {
  try { return new Intl.DisplayNames(['en'], { type: 'region' }) } catch { return null }
})()

function countryName (cc) {
  try { return regionNames?.of(cc) || cc } catch { return cc }
}

const STATS = [
  {
    key: 'total',
    label: 'Total',
    hint: 'All Platform validators (evonodes) tracked on the network.',
    ring: false
  },
  {
    key: 'active',
    label: 'In quorum',
    hint: 'Proposing and validating Platform blocks right now. Rotates each epoch.',
    ring: true
  },
  {
    key: 'inactive',
    label: 'Queued',
    hint: 'Registered but not in the current quorum — waiting to rotate in.',
    ring: true
  },
  {
    key: 'banned',
    label: 'Banned',
    hint: 'PoSe-banned for failed service. Never enters the active quorum.',
    ring: true
  }
]

function ringArcs (active, queued, banned, total) {
  if (!total) return []
  const parts = [
    { key: 'active', n: active },
    { key: 'inactive', n: queued },
    { key: 'banned', n: banned }
  ].filter(p => p.n > 0)

  let offset = 0
  return parts.map(p => {
    const len = (p.n / total) * C
    const arc = { key: p.key, dash: `${len} ${C - len}`, offset }
    offset -= len
    return arc
  })
}

export default function MasternodesDonut ({
  validators,
  validatorsActive,
  validatorsBanned,
  validatorsInactive,
  validatorsList,
  contested,
  activeContested,
  latestContested,
  latestVotes,
  epochData
}) {
  const [pin, setPin] = useState(null)

  const total = validators?.data?.pagination?.total
  const active = validatorsActive?.data?.pagination?.total
  const banned = validatorsBanned?.data?.pagination?.total
  const inactive = validatorsInactive?.data?.pagination?.total

  const hasTotal = typeof total === 'number' && total > 0
  const loadingTotal = Boolean(validators?.loading)
  const showSkeleton = !hasTotal && loadingTotal
  const showEmpty = !hasTotal && !loadingTotal
  const showContent = hasTotal

  const activeN = typeof active === 'number' ? active : 0
  const bannedN = typeof banned === 'number' ? banned : 0
  const queuedN = typeof inactive === 'number' ? inactive : 0

  const counts = {
    total: hasTotal ? total : null,
    active: typeof active === 'number' ? active : null,
    inactive: typeof inactive === 'number' ? inactive : null,
    banned: typeof banned === 'number' ? banned : null
  }

  const arcs = useMemo(
    () => (hasTotal ? ringArcs(activeN, queuedN, bannedN, total) : []),
    [hasTotal, activeN, queuedN, bannedN, total]
  )

  const pct = (n) => (hasTotal && typeof n === 'number' ? Math.round((n / total) * 100) : null)

  const geo = useMemo(() => {
    const geoCounts = {}
    for (const v of Array.isArray(validatorsList) ? validatorsList : []) {
      const cc = v?.geoIpInfo?.countryCode
      if (cc) geoCounts[cc] = (geoCounts[cc] || 0) + 1
    }
    const countries = Object.entries(geoCounts).sort((a, b) => b[1] - a[1])
    const top = countries.slice(0, MAX_COUNTRIES)
    const sample = top.reduce((sum, [, n]) => sum + n, 0) || 1
    return {
      top: top.map(([cc, n]) => ({
        cc,
        n,
        name: countryName(cc),
        share: n / sample
      })),
      more: Math.max(0, countries.length - top.length),
      nations: countries.length,
      sample,
      has: countries.length > 0
    }
  }, [validatorsList])

  const pinned = pin ? STATS.find(s => s.key === pin) : null
  const pinCount = pinned ? counts[pinned.key] : null
  const pinPct = pinned && pinned.key !== 'total' ? pct(pinCount) : null

  const centerMain = pin && typeof pinCount === 'number'
    ? pinCount
    : activeN
  const centerLabel = pin
    ? pinned.label
    : 'In quorum'
  const centerSub = pin
    ? (pinPct != null ? `${pinPct}% of set` : 'validators')
    : (hasTotal ? `${pct(activeN)}% of ${total}` : '')

  const togglePin = (key) => setPin(p => (p === key ? null : key))

  return (
    <Box
      className={'InfoBlock InfoBlock--NoBorder MasternodesDonut'}
      w={'100%'}
      h={'100%'}
      as={'section'}
      aria-label={'Consensus'}
    >
      <div className={'MasternodesDonut__Glow'} aria-hidden={'true'}/>

      <header className={'MasternodesDonut__Head'}>
        <div className={'MasternodesDonut__HeadText'}>
          <span className={'MasternodesDonut__Eyebrow'}>Consensus</span>
          <h2 className={'MasternodesDonut__Title'}>Quorum &amp; votes</h2>
          <p className={'MasternodesDonut__Lede'}>
            Who is writing Platform blocks right now, who is waiting or banned,
            and how masternodes vote on contested names.
          </p>
        </div>
        {hasTotal &&
          <span className={'MasternodesDonut__HeadTotal'} title={'All tracked Platform evonodes'}>
            {total.toLocaleString('en-US')} <i>evonodes</i>
          </span>}
      </header>

      <div className={'MasternodesDonut__Body'}>
        {showSkeleton &&
          <>
            <div className={'MasternodesDonut__Stage'}>
              <Skeleton className={'MasternodesDonut__RingSkel'} w={'180px'} circle/>
              <div className={'MasternodesDonut__Rails'}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} w={'100%'} h={'4.25rem'} radius={12}/>
                ))}
              </div>
            </div>
            <Skeleton w={'100%'} h={'5rem'} radius={12}/>
          </>}

        {showEmpty && <div className={'MasternodesDonut__Empty'}>No data</div>}

        {showContent &&
          <div
            className={`MasternodesDonut__Stage${pin ? ' is-pinned' : ''}`}
            data-pin={pin || undefined}
          >
            <div className={'MasternodesDonut__Col'}>
              <div className={'MasternodesDonut__Core'}>
                <svg
                  className={'MasternodesDonut__Ring'}
                  viewBox={'0 0 100 100'}
                  role={'img'}
                  aria-label={`${activeN} of ${total} in quorum`}
                >
                  <circle className={'MasternodesDonut__RingTrack'} cx={'50'} cy={'50'} r={R}/>
                  <circle className={'MasternodesDonut__RingPulse'} cx={'50'} cy={'50'} r={R + 6}/>
                  {arcs.map(a => (
                    <circle
                      key={a.key}
                      data-type={a.key}
                      className={`MasternodesDonut__Arc MasternodesDonut__Arc--${a.key}`}
                      cx={'50'}
                      cy={'50'}
                      r={R}
                      strokeDasharray={a.dash}
                      strokeDashoffset={a.offset}
                      onClick={() => togglePin(a.key)}
                      role={'button'}
                      tabIndex={0}
                      aria-label={STATS.find(s => s.key === a.key)?.label}
                      aria-pressed={pin === a.key}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          togglePin(a.key)
                        }
                      }}
                    />
                  ))}
                </svg>
                <div className={'MasternodesDonut__Hub'}>
                  <span className={'MasternodesDonut__HubValue'}>
                    {centerMain.toLocaleString('en-US')}
                  </span>
                  <span className={'MasternodesDonut__HubLabel'}>{centerLabel}</span>
                  <span className={'MasternodesDonut__HubSub'}>{centerSub}</span>
                </div>
              </div>

              {geo.has &&
                <div className={'MasternodesDonut__Geo'}>
                  <div className={'MasternodesDonut__GeoHead'}>
                    <span className={'MasternodesDonut__GeoEyebrow'}>Geo</span>
                    <span className={'MasternodesDonut__GeoMeta'}>
                      {geo.nations}
                      {geo.more > 0 ? ` · +${geo.more}` : ''}
                    </span>
                  </div>
                  <div
                    className={'MasternodesDonut__GeoChips'}
                    role={'list'}
                    aria-label={`Validators by country, ${geo.sample} with geo data`}
                  >
                    {geo.top.map(g => (
                      <span
                        key={g.cc}
                        role={'listitem'}
                        className={'MasternodesDonut__GeoChip'}
                        title={`${g.name}: ${g.n}`}
                      >
                        <img
                          className={'MasternodesDonut__Flag'}
                          src={`/flags/circle/${g.cc.toLowerCase()}.svg`}
                          alt={''}
                          width={18}
                          height={18}
                          loading={'lazy'}
                          onError={e => { e.currentTarget.style.display = 'none' }}
                        />
                        <b>{g.cc}</b>
                        <span>{g.n}</span>
                      </span>
                    ))}
                  </div>
                </div>}
            </div>

            <div className={'MasternodesDonut__Rails'} role={'list'}>
              {STATS.map(s => {
                const n = counts[s.key]
                const ready = typeof n === 'number'
                const share = s.key !== 'total' ? pct(n) : null
                return (
                  <button
                    key={s.key}
                    type={'button'}
                    role={'listitem'}
                    data-type={s.key}
                    className={`MasternodesDonut__Rail MasternodesDonut__Rail--${s.key}`}
                    onClick={() => togglePin(s.key)}
                    aria-pressed={pin === s.key}
                    disabled={!ready}
                  >
                    <span className={'MasternodesDonut__RailTop'}>
                      <span className={'MasternodesDonut__RailId'}>
                        <i className={`MasternodesDonut__Dot MasternodesDonut__Dot--${s.key}`}/>
                        {s.label}
                      </span>
                      <span className={'MasternodesDonut__RailNums'}>
                        <b>{ready ? n.toLocaleString('en-US') : '—'}</b>
                        {share != null && <em>{share}%</em>}
                      </span>
                    </span>
                    <span className={'MasternodesDonut__RailHint'}>{s.hint}</span>
                    {s.ring && ready &&
                      <span className={'MasternodesDonut__RailMeter'} aria-hidden={'true'}>
                        <i style={{ width: `${Math.max(share || 0, 2)}%` }}/>
                      </span>}
                  </button>
                )
              })}
            </div>
          </div>}

        <div className={'MasternodesDonut__Gov'}>
          <StatusBar
            contested={contested}
            activeContested={activeContested}
            latestContested={latestContested}
            latestVotes={latestVotes}
            epochData={epochData}
          />
        </div>
      </div>
    </Box>
  )
}
