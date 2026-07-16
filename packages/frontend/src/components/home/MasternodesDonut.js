'use client'

import { Box, Heading } from '@chakra-ui/react'
import { Skeleton } from './Skeleton'
import './MasternodesDonut.scss'

const SIZE = 200
const STROKE = 16
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

// exact pagination totals; total paints first, arcs fill as active/banned arrive
export default function MasternodesDonut ({ validators, validatorsActive, validatorsBanned }) {
  const total = validators?.data?.pagination?.total
  const active = validatorsActive?.data?.pagination?.total
  const banned = validatorsBanned?.data?.pagination?.total

  const hasTotal = typeof total === 'number' && total > 0
  const hasActive = typeof active === 'number'
  const hasBanned = typeof banned === 'number'
  const loadingTotal = Boolean(validators?.loading)
  const loadingRest = Boolean(validatorsActive?.loading || validatorsBanned?.loading)

  // skeleton only while we still don't know the set size
  const showSkeleton = !hasTotal && loadingTotal
  const showEmpty = !hasTotal && !loadingTotal
  const showChart = hasTotal

  const bannedCount = hasBanned ? banned : 0
  const activeCount = hasActive ? active : 0
  const inactive = hasActive ? Math.max(total - activeCount - bannedCount, 0) : null
  const activeFrac = hasActive ? Math.min(activeCount / total, 1) : 0
  // a sub-pixel slice reads as an artifact: clamp for display, the legend keeps the exact count
  const MIN_ARC_FRAC = 0.018
  const bannedFracRaw = hasBanned ? Math.min(bannedCount / total, 1 - activeFrac) : 0
  const bannedFrac = bannedFracRaw > 0 ? Math.max(bannedFracRaw, MIN_ARC_FRAC) : 0
  // gapped butt caps keep thin segments apart (round caps overhang); no notch on a full circle
  const GAP = (hasActive && (activeFrac < 1 || bannedFrac > 0)) ? 3 : 0
  const arcDash = frac => `${Math.max(frac * C - GAP, 0)} ${C}`

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder MasternodesDonut'} w={'100%'}>
      <div className={'MasternodesDonut__Head'}>
        <Heading className={'InfoBlock__Title'} as={'h2'}>Validator set</Heading>
      </div>

      <div className={'MasternodesDonut__Body'}>
        {showSkeleton &&
          <>
            <div className={'MasternodesDonut__Chart'}>
              <svg className={'MasternodesDonut__Svg'} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden={'true'}>
                <circle className={'MasternodesDonut__Track'} cx={SIZE / 2} cy={SIZE / 2} r={R} fill={'none'} strokeWidth={STROKE}/>
              </svg>
              <div className={'MasternodesDonut__ChartSkeleton'}>
                <Skeleton w={'48px'} h={'1.5em'}/>
                <Skeleton w={'64px'} h={'0.6em'}/>
              </div>
            </div>
            <div className={'MasternodesDonut__Legend'}>
              {Array.from({ length: 3 }).map((_, i) => <Skeleton w={'100%'} h={'0.75em'} key={i}/>)}
            </div>
          </>}
        {showEmpty &&
          <div className={'MasternodesDonut__Empty'}>No data</div>}
        {showChart &&
          <>
              <div className={'MasternodesDonut__Chart'}>
                <svg
                  className={'MasternodesDonut__Svg'}
                  viewBox={`0 0 ${SIZE} ${SIZE}`}
                  role={'img'}
                  aria-label={hasActive ? `${activeCount} of ${total} validators active` : `${total} masternodes`}
                >
                  <circle className={'MasternodesDonut__Track'} cx={SIZE / 2} cy={SIZE / 2} r={R} fill={'none'} strokeWidth={STROKE}/>
                  {hasActive &&
                    <circle
                      className={'MasternodesDonut__Arc'}
                      cx={SIZE / 2}
                      cy={SIZE / 2}
                      r={R}
                      fill={'none'}
                      strokeWidth={STROKE}
                      strokeDasharray={arcDash(activeFrac)}
                      transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                    />}
                  {hasBanned && bannedFrac > 0 &&
                    <circle
                      className={'MasternodesDonut__ArcBanned'}
                      cx={SIZE / 2}
                      cy={SIZE / 2}
                      r={R}
                      fill={'none'}
                      strokeWidth={STROKE}
                      strokeDasharray={arcDash(bannedFrac)}
                      strokeDashoffset={-activeFrac * C}
                      transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                    />}
                  <text className={'MasternodesDonut__Total'} x={'50%'} y={'45%'} textAnchor={'middle'} dominantBaseline={'middle'} fontSize={38}>{total}</text>
                  <text className={'MasternodesDonut__TotalLabel'} x={'50%'} y={'62%'} textAnchor={'middle'} dominantBaseline={'middle'} fontSize={12}>masternodes</text>
                </svg>
              </div>

              <div className={'MasternodesDonut__Legend'}>
                {[
                  { label: 'Active', count: hasActive ? activeCount : null, cls: 'active' },
                  { label: 'Inactive', count: inactive, cls: 'inactive' },
                  ...(hasBanned && bannedCount > 0 ? [{ label: 'Banned', count: bannedCount, cls: 'banned' }] : [])
                ].map(row => (
                  <span className={'MasternodesDonut__LegendItem'} key={row.label}>
                    <i className={`MasternodesDonut__Dot MasternodesDonut__Dot--${row.cls}`}/>
                    <span className={'MasternodesDonut__LegendLabel'}>{row.label}</span>
                    <span className={'MasternodesDonut__LegendBar'}>
                      {typeof row.count === 'number'
                        ? <i className={`MasternodesDonut__LegendFill MasternodesDonut__LegendFill--${row.cls}`} style={{ width: `${Math.max((row.count / total) * 100, 1.5)}%` }}/>
                        : null}
                    </span>
                    <span className={'MasternodesDonut__LegendCount'}>
                      {typeof row.count === 'number' ? row.count : (loadingRest ? '…' : '—')}
                    </span>
                    <span className={'MasternodesDonut__LegendPct'}>
                      {typeof row.count === 'number' ? `${Math.round((row.count / total) * 100)}%` : ''}
                    </span>
                  </span>
                ))}
              </div>
            </>
        }
      </div>
    </Box>
  )
}
