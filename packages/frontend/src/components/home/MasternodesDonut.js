'use client'

import { useState, useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import { Skeleton } from './Skeleton'
import { StatusBar } from './StatusBar'
import './MasternodesDonut.scss'

const MAX_COUNTRIES = 12
const MAX_CELLS = 324

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
    cells: false
  },
  {
    key: 'active',
    label: 'In quorum',
    hint: 'Proposing and validating Platform blocks right now. Rotates each epoch.',
    cells: true
  },
  {
    key: 'inactive',
    label: 'Queued',
    hint: 'Registered but not in the current quorum — waiting to rotate in.',
    cells: true
  },
  {
    key: 'banned',
    label: 'Banned',
    hint: 'PoSe-banned for failed service. Never enters the active quorum.',
    cells: true
  }
]

/** Scale active/queued/banned into N cells; keep ≥1 cell for each non-zero group. */
function buildCells (active, queued, banned, total) {
  const n = Math.min(Math.max(0, total | 0), MAX_CELLS)
  if (n <= 0) return []

  const raw = [
    { type: 'active', n: Math.max(0, active | 0) },
    { type: 'inactive', n: Math.max(0, queued | 0) },
    { type: 'banned', n: Math.max(0, banned | 0) }
  ]
  const sum = raw.reduce((s, p) => s + p.n, 0)

  let alloc = raw.map(p => p.n)

  if (sum > n) {
    alloc = raw.map(p => (p.n > 0 ? Math.max(1, Math.floor((p.n / sum) * n)) : 0))
    let used = alloc.reduce((s, v) => s + v, 0)
    while (used > n) {
      let i = 0
      for (let j = 1; j < alloc.length; j++) {
        if (alloc[j] > alloc[i]) i = j
      }
      if (alloc[i] <= 1) break
      alloc[i]--
      used--
    }
    let rem = n - used
    const order = raw
      .map((p, i) => ({ i, n: p.n }))
      .filter(p => p.n > 0)
      .sort((a, b) => b.n - a.n)
    let k = 0
    while (rem > 0 && order.length) {
      alloc[order[k % order.length].i]++
      rem--
      k++
    }
  }

  const cells = []
  for (let i = 0; i < alloc[0]; i++) cells.push('active')
  for (let i = 0; i < alloc[1]; i++) cells.push('inactive')
  for (let i = 0; i < alloc[2]; i++) cells.push('banned')
  while (cells.length < n) cells.push('idle')
  return cells
}

function matrixCols (count) {
  if (count <= 0) return 1
  return Math.max(4, Math.ceil(Math.sqrt(count)))
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

  const cells = useMemo(
    () => (hasTotal ? buildCells(activeN, queuedN, bannedN, total) : []),
    [hasTotal, activeN, queuedN, bannedN, total]
  )
  const cols = useMemo(() => matrixCols(cells.length), [cells.length])
  const rows = useMemo(
    () => (cells.length ? Math.ceil(cells.length / cols) : 1),
    [cells.length, cols]
  )
  const capped = hasTotal && total > MAX_CELLS

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
        {geo.has &&
          <div
            className={'MasternodesDonut__Geo'}
            role={'list'}
            aria-label={`Validators by country${geo.sample ? `, ${geo.sample} with geo data` : ''}`}
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
          </div>}
      </header>

      <div className={'MasternodesDonut__Body'}>
        {showSkeleton &&
          <>
            <div className={'MasternodesDonut__Stage'}>
              <Skeleton className={'MasternodesDonut__MatrixSkel'} w={'100%'} h={'11rem'} radius={12}/>
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
              <div className={'MasternodesDonut__MatrixWrap'}>
                <div
                  className={'MasternodesDonut__Matrix'}
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
                  }}
                  role={'img'}
                  aria-label={
                    capped
                      ? `${activeN} in quorum of ${total} (matrix shows first ${MAX_CELLS})`
                      : `${activeN} of ${total} in quorum`
                  }
                >
                  {cells.map((type, i) => (
                    <button
                      key={i}
                      type={'button'}
                      data-type={type === 'idle' ? 'total' : type}
                      className={`MasternodesDonut__Cell MasternodesDonut__Cell--${type}`}
                      tabIndex={type === 'idle' ? -1 : 0}
                      aria-label={
                        type === 'idle'
                          ? 'Other validators'
                          : STATS.find(s => s.key === type)?.label
                      }
                      aria-pressed={pin === (type === 'idle' ? 'total' : type)}
                      onClick={() => togglePin(type === 'idle' ? 'total' : type)}
                    />
                  ))}
                </div>
              </div>
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
                    {s.cells && ready &&
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
