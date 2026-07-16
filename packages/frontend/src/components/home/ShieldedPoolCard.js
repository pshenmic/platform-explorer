'use client'

import { useState, useEffect } from 'react'
import { Box, Heading } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { RateTooltip } from '../ui/Tooltips'
import { creditsToDash } from '../../util'
import { Skeleton } from './Skeleton'
import { compact } from './utils'
import { PRESETS, presetRange } from './MetricChart'
import './ShieldedPoolCard.scss'

const SPARK_W = 100
const SPARK_H = 56
const BASELINE = SPARK_H / 2
const DEFAULT_PRESET = 2 // 1M
// fewer buckets than the big charts: bars need visible width in a 100-unit mini strip
const SPARK_INTERVALS = { '24h': 24, '1W': 28, '1M': 30, '6M': 36, '1Y': 48, All: 48 }

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })

// bar height from the baseline, scaled to the window maximum (min 1.5 units when non-zero)
function barH (amount, max) {
  if (!amount || max <= 0) return 0
  return Math.max((amount / max) * (BASELINE - 3), 1.5)
}

// shielded pool overview: balance + in/out totals over diverging in/out flow bars
export default function ShieldedPoolCard ({ rate, enabled = true }) {
  const [stats, setStats] = useState({ loading: true, error: false, data: null })
  const [flows, setFlows] = useState({ loading: true, buckets: [] })
  const [presetIdx, setPresetIdx] = useState(DEFAULT_PRESET)
  const [hover, setHover] = useState(null)

  // pool balance and totals are all-time by nature: fetched once, unaffected by the preset
  useEffect(() => {
    if (!enabled) {
      setStats(s => ({ ...s, loading: true, error: false }))
      return
    }
    Api.getShieldedStatistic()
      .then(res => setStats({ loading: false, error: false, data: res }))
      .catch(() => setStats({ loading: false, error: true, data: null }))
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setFlows(s => ({ ...s, loading: true }))
      return
    }
    const preset = PRESETS[presetIdx]
    const { start, end } = presetRange(preset)
    const intervals = SPARK_INTERVALS[preset.label] ?? 30
    setFlows(s => ({ ...s, loading: true }))
    setHover(null)
    Promise.all([
      Api.getShieldHistory(start, end, intervals).catch(() => []),
      Api.getUnshieldHistory(start, end, intervals).catch(() => [])
    ]).then(([shieldRes, unshieldRes]) => {
      const count = Math.max(shieldRes?.length || 0, unshieldRes?.length || 0)
      const buckets = Array.from({ length: count }, (_, i) => ({
        ts: shieldRes?.[i]?.timestamp ?? unshieldRes?.[i]?.timestamp ?? null,
        inAmt: Number(shieldRes?.[i]?.data?.amount) || 0,
        outAmt: Number(unshieldRes?.[i]?.data?.amount) || 0
      }))
      // drop leading empty buckets (before the first shielded activity) so the range isn't compressed
      let s = 0
      while (s < buckets.length - 1 && !buckets[s].inAmt && !buckets[s].outAmt) s++
      setFlows({ loading: false, buckets: buckets.slice(s) })
    })
  }, [presetIdx, enabled])

  const data = stats.data
  const balanceCredits = Number(data?.poolBalance) || 0
  const inCredits = Number(data?.totalShieldedIn) || 0
  const outCredits = Number(data?.totalShieldedOut) || 0

  const buckets = flows.buckets
  const flowMax = buckets.reduce((max, b) => Math.max(max, b.inAmt, b.outAmt), 0)
  const barStep = buckets.length ? SPARK_W / buckets.length : SPARK_W
  const barW = barStep * 0.62
  const tipFmt = PRESETS[presetIdx].label === '24h' ? timeFmt : dateFmt

  // nearest bucket under the cursor (the whole strip is hoverable, not just the bars)
  const handleMove = (e) => {
    if (!buckets.length || flows.loading) return
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = (e.clientX - rect.left) / rect.width
    const idx = Math.min(buckets.length - 1, Math.max(0, Math.round(frac * (buckets.length - 1))))
    setHover({ idx, xPct: (idx * barStep + barStep / 2) / SPARK_W * 100 })
  }

  const hovered = hover != null ? buckets[hover.idx] : null

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder ShieldedPool'} w={'100%'}>
      <div className={'ShieldedPool__Head'}>
        <Heading className={'InfoBlock__Title'} as={'h2'}>Shielded pool</Heading>
        <div className={'MetricChart__Presets'}>
          {PRESETS.map((pr, i) => (
            <button
              key={pr.label}
              type={'button'}
              className={`MetricChart__Chip ${i === presetIdx ? 'is-active' : ''}`}
              aria-pressed={i === presetIdx}
              onClick={() => setPresetIdx(i)}
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      <div className={'ShieldedPool__Body'}>
        {stats.loading
          ? <>
              <Skeleton w={'140px'} h={'1.6em'}/>
              <div className={'ShieldedPool__Rows'}>
                {Array.from({ length: 3 }).map((_, i) => <Skeleton w={'100%'} h={'0.75em'} key={i}/>)}
              </div>
              <Skeleton w={'100%'} h={`${SPARK_H}px`} radius={6}/>
            </>
          : stats.error || !data
            ? <div className={'ShieldedPool__Empty'}>No data</div>
            : <>
                <RateTooltip dash={creditsToDash(balanceCredits)} rate={rate?.data} placement={'top'}>
                  <div className={'ShieldedPool__Balance'}>
                    {creditsToDash(balanceCredits).toFixed(2)}
                    <span className={'ShieldedPool__BalanceUnit'}>DASH</span>
                  </div>
                </RateTooltip>

                <div className={'ShieldedPool__Rows'}>
                  <div className={'ShieldedPool__RowItem'}>
                    <span>Shielded in</span>
                    <span>{creditsToDash(inCredits).toFixed(2)} DASH</span>
                  </div>
                  <div className={'ShieldedPool__RowItem'}>
                    <span>Shielded out</span>
                    <span>{creditsToDash(outCredits).toFixed(2)} DASH</span>
                  </div>
                  <div className={'ShieldedPool__RowItem'}>
                    <span>Transitions</span>
                    <span>{compact(Number(data.transitionsCount) || 0)}</span>
                  </div>
                </div>

                <div className={'ShieldedPool__Spark'}>
                  {flows.loading && !buckets.length
                    ? <Skeleton w={'100%'} h={`${SPARK_H}px`} radius={6}/>
                    : <div
                        className={'ShieldedPool__SparkWrap'}
                        onMouseMove={handleMove}
                        onMouseLeave={() => setHover(null)}
                      >
                        <svg
                          // preset switch dims the stale bars until fresh buckets land
                          className={`ShieldedPool__SparkSvg${flows.loading ? ' is-loading' : ''}`}
                          viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
                          preserveAspectRatio={'none'}
                          aria-hidden={'true'}
                        >
                          <line className={'ShieldedPool__Baseline'} x1={0} x2={SPARK_W} y1={BASELINE} y2={BASELINE} vectorEffect={'non-scaling-stroke'}/>
                          {buckets.map((b, i) => {
                            const x = i * barStep + (barStep - barW) / 2
                            const dim = hover != null && hover.idx !== i
                            const inH = barH(b.inAmt, flowMax)
                            const outH = barH(b.outAmt, flowMax)
                            return (
                              <g key={i} className={dim ? 'is-dim' : undefined}>
                                {inH > 0 && <rect className={'ShieldedPool__Bar ShieldedPool__Bar--in'} x={x} y={BASELINE - inH} width={barW} height={inH}/>}
                                {outH > 0 && <rect className={'ShieldedPool__Bar ShieldedPool__Bar--out'} x={x} y={BASELINE} width={barW} height={outH}/>}
                              </g>
                            )
                          })}
                        </svg>

                        {hovered &&
                          <div className={'ShieldedPool__Tip'} style={{ left: `${hover.xPct}%` }}>
                            <span className={'ShieldedPool__TipDate'}>{hovered.ts ? tipFmt.format(new Date(hovered.ts)) : '—'}</span>
                            <span className={'ShieldedPool__TipRow ShieldedPool__TipRow--in'}>In {creditsToDash(hovered.inAmt).toFixed(2)} DASH</span>
                            <span className={'ShieldedPool__TipRow ShieldedPool__TipRow--out'}>Out {creditsToDash(hovered.outAmt).toFixed(2)} DASH</span>
                          </div>}
                      </div>}

                  {!flows.loading && buckets.length >= 2 &&
                    <div className={'ShieldedPool__Axis'}>
                      <span>{buckets[0].ts ? tipFmt.format(new Date(buckets[0].ts)) : ''}</span>
                      {buckets.length >= 5 &&
                        <span>{buckets[Math.floor(buckets.length / 2)].ts ? tipFmt.format(new Date(buckets[Math.floor(buckets.length / 2)].ts)) : ''}</span>}
                      <span>{buckets[buckets.length - 1].ts ? tipFmt.format(new Date(buckets[buckets.length - 1].ts)) : ''}</span>
                    </div>}

                  <div className={'ShieldedPool__SparkLegend'}>
                    <span><i className={'ShieldedPool__Dot ShieldedPool__Dot--in'}/> shield</span>
                    <span><i className={'ShieldedPool__Dot ShieldedPool__Dot--out'}/> unshield</span>
                    <span className={'ShieldedPool__SparkWindow'}>{PRESETS[presetIdx].label.toLowerCase()}</span>
                  </div>
                </div>
              </>}
      </div>
    </Box>
  )
}
