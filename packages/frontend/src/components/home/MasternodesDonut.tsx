'use client'

import { Box } from '@chakra-ui/react'
import { InfoIcon, RepeatIcon } from '@chakra-ui/icons'
import { CardHead } from '../cards'
import { Tooltip } from '../ui/Tooltips'
import { Skeleton } from './Skeleton'
import './MasternodesDonut.scss'

// tiny slices (e.g. banned 1%) would vanish from the bar; clamp the display width, keep exact counts
const MIN_SEG_FRAC = 0.02
// cap so a large network's country list can't blow the card height; the rest folds into "+N"
const MAX_COUNTRIES = 12

// ISO-2 -> English country name via the platform's Intl (no dependency); falls back to the code
const regionNames = (() => {
  try { return new Intl.DisplayNames(['en'], { type: 'region' }) } catch { return null }
})()
const countryName = (cc: string): string => {
  try { return regionNames?.of(cc) || cc } catch { return cc }
}

interface PaginationTotal {
  data?: { pagination?: { total?: number | null } | null } | null
  loading?: boolean
}

interface ValidatorGeo {
  geoIpInfo?: { countryCode?: string | null } | null
}

interface MasternodesDonutProps {
  validators?: PaginationTotal | null
  validatorsActive?: PaginationTotal | null
  validatorsBanned?: PaginationTotal | null
  validatorsInactive?: PaginationTotal | null
  validatorsList?: ValidatorGeo[] | null
}

// composite "Validator set": status tiles over a stacked status bar;
// every count is a backend /validators pagination total, no client-side arithmetic
export default function MasternodesDonut ({ validators, validatorsActive, validatorsBanned, validatorsInactive, validatorsList }: MasternodesDonutProps) {
  const total = validators?.data?.pagination?.total
  const active = validatorsActive?.data?.pagination?.total
  const banned = validatorsBanned?.data?.pagination?.total
  const inactive = validatorsInactive?.data?.pagination?.total

  const hasTotal = typeof total === 'number' && total > 0
  const hasActive = typeof active === 'number'
  const hasBanned = typeof banned === 'number'
  const hasInactive = typeof inactive === 'number'
  const loadingTotal = Boolean(validators?.loading)

  const showSkeleton = !hasTotal && loadingTotal
  const showEmpty = !hasTotal && !loadingTotal
  const showContent = hasTotal

  const activeCount = hasActive ? active : 0
  const bannedCount = hasBanned ? banned : 0

  const pct = (n: number) => Math.round((n / Number(total || 1)) * 100)

  // display fractions for the bar: clamp banned so a 1% slice still shows; inactive soaks the rest
  const activeFrac = hasActive ? Math.min(activeCount / Number(total), 1) : 0
  const bannedRaw = hasBanned ? bannedCount / Number(total) : 0
  const bannedFrac = bannedRaw > 0 ? Math.max(bannedRaw, MIN_SEG_FRAC) : 0
  const inactiveFrac = Math.max(1 - activeFrac - bannedFrac, 0)

  const inactiveCount = hasInactive ? inactive : 0

  const tiles = [
    { key: 'total', label: 'Total', count: total, noPct: true, hint: 'All Platform validators (evonodes) tracked on the network.' },
    { key: 'active', label: 'In Quorum', count: hasActive ? activeCount : null, hint: 'Evonodes in the current validator quorum — proposing and validating Platform blocks right now. The quorum rotates.' },
    { key: 'inactive', label: 'Queued', count: hasInactive ? inactiveCount : null, rotate: true, hint: 'Registered evonode not in the current quorum — waiting to rotate in.' },
    { key: 'banned', label: 'Banned', count: hasBanned ? bannedCount : null, hint: 'PoSe-banned (failed to provide service). Never in the active quorum.' }
  ]

  const segs = [
    { key: 'active', label: 'In Quorum', count: activeCount, frac: activeFrac },
    { key: 'inactive', label: 'Queued', count: inactiveCount, frac: inactiveFrac },
    { key: 'banned', label: 'Banned', count: bannedCount, frac: bannedFrac }
  ].filter(s => s.frac > 0)

  // "by country" from geoIpInfo (#822); aggregated on the client (no backend geo endpoint yet).
  // empty on networks that don't ship geoIpInfo yet → the row hides itself
  const geoCounts: Record<string, number> = {}
  for (const v of Array.isArray(validatorsList) ? validatorsList : []) {
    const cc = v?.geoIpInfo?.countryCode
    if (cc) geoCounts[cc] = (geoCounts[cc] || 0) + 1
  }
  const countries = Object.entries(geoCounts).sort((a, b) => b[1] - a[1])
  const topCountries = countries.slice(0, MAX_COUNTRIES)
  const moreCountries = countries.length - topCountries.length
  const hasGeo = countries.length > 0

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder MasternodesDonut'} w={'100%'}>
      <CardHead title={'Validator set'}/>

      <div className={'MasternodesDonut__Body'}>
        {showSkeleton &&
          <>
            <div className={'MasternodesDonut__Tiles'}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div className={'MasternodesDonut__Tile'} key={i}>
                  <Skeleton w={'52px'} h={'0.6em'}/>
                  <Skeleton w={'56px'} h={'1.4em'} className={'MasternodesDonut__SkelGap'}/>
                </div>
              ))}
            </div>
            <Skeleton w={'100%'} h={'10px'} radius={5}/>
          </>}

        {showEmpty && <div className={'MasternodesDonut__Empty'}>No data</div>}

        {showContent &&
          <>
            <div className={'MasternodesDonut__Tiles'}>
              {tiles.map(t => (
                <div className={`MasternodesDonut__Tile MasternodesDonut__Tile--${t.key}`} key={t.key}>
                  <span className={'MasternodesDonut__TileLabel'}>
                    <i className={`MasternodesDonut__Dot MasternodesDonut__Dot--${t.key}`}/>
                    {t.label}
                    {t.rotate && <RepeatIcon className={'MasternodesDonut__Rotate'} aria-hidden={'true'}/>}
                    {t.hint &&
                      <Tooltip content={t.hint} placement={'top'}>
                        <span className={'MasternodesDonut__TileInfo'} aria-label={`About ${t.label}`}>
                          <InfoIcon boxSize={2.5}/>
                        </span>
                      </Tooltip>}
                  </span>
                  <span className={'MasternodesDonut__TileValue'}>
                    {typeof t.count === 'number' ? t.count : '—'}
                  </span>
                  {/* always render the % row (nbsp when absent) so all tiles stay 3 lines tall */}
                  <span className={'MasternodesDonut__TilePct'}>
                    {t.noPct || typeof t.count !== 'number' ? ' ' : `${pct(t.count)}%`}
                  </span>
                </div>
              ))}
            </div>

            <div className={'MasternodesDonut__Bottom'}>
              <div className={'MasternodesDonut__Bar'} role={'img'} aria-label={hasActive ? `${activeCount} of ${total} evonodes in quorum` : `${total} validators`}>
                {segs.map(s => (
                  <Tooltip key={s.key} content={`${s.label} · ${s.count.toLocaleString('en-US')} · ${pct(s.count)}%`} placement={'top'}>
                    <span
                      className={`MasternodesDonut__Seg MasternodesDonut__Seg--${s.key}`}
                      style={{ width: `${s.frac * 100}%` }}
                    />
                  </Tooltip>
                ))}
              </div>

              {hasGeo &&
                <div className={'MasternodesDonut__Geo'}>
                  <span className={'MasternodesDonut__GeoLabel'}>By country</span>
                  <span className={'MasternodesDonut__GeoList'}>
                    {topCountries.map(([cc, n]) => (
                      <Tooltip key={cc} content={countryName(cc)} placement={'top'}>
                        <span className={'MasternodesDonut__GeoItem'}>
                          <img
                            className={'MasternodesDonut__Flag'}
                            src={`/flags/circle/${cc.toLowerCase()}.svg`}
                            alt={''}
                            width={16}
                            height={16}
                            loading={'lazy'}
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                          <b>{cc}</b> {n}
                        </span>
                      </Tooltip>
                    ))}
                    {moreCountries > 0 && <span className={'MasternodesDonut__GeoMore'}>+{moreCountries}</span>}
                  </span>
                </div>}
            </div>
          </>}
      </div>
    </Box>
  )
}
