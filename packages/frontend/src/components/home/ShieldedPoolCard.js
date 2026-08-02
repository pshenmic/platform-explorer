'use client'

import { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { Presets } from '../cards'
import { RateTooltip, Tooltip } from '../ui/Tooltips'
import { creditsToDash } from '../../util'
import { Skeleton } from './Skeleton'
import { PRESETS, presetRange } from './MetricChart'
import './ShieldedPoolCard.scss'

const SPARK_W = 100
const SPARK_H = 64
const BASELINE = SPARK_H / 2
const DEFAULT_PRESET = 2
const SPARK_INTERVALS = { '24h': 24, '1W': 28, '1M': 30, '6M': 36, '1Y': 48, All: 48 }

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })

const TYPE_INFO = {
  SHIELD: { label: 'Shield', dir: 'in' },
  SHIELD_FROM_ASSET_LOCK: { label: 'Asset lock', dir: 'in' },
  UNSHIELD: { label: 'Unshield', dir: 'out' },
  SHIELDED_WITHDRAWAL: { label: 'Withdrawal', dir: 'out' },
  IDENTITY_CREATE_FROM_SHIELDED_POOL: { label: 'Identity create', dir: 'out' },
  SHIELDED_TRANSFER: { label: 'Private transfers', dir: 'inside' }
}

function barH (amount, max) {
  if (!amount || max <= 0) return 0
  return Math.max((amount / max) * (BASELINE - 3), 1.5)
}

function fmtDash (dash) {
  if (!dash) return '0'
  return Math.abs(dash) >= 0.01 ? dash.toFixed(2) : Number(dash.toPrecision(2)).toString()
}

function TypeChips ({ types, dir }) {
  const rows = (types || [])
    .map(t => ({ ...TYPE_INFO[t.transactionType], count: t.count }))
    .filter(t => t.dir === dir && t.count > 0)
  if (!rows.length) return null
  return (
    <div className={'ShieldedPool__Chips'}>
      {rows.map(t => (
        <span key={t.label} className={`ShieldedPool__Chip ShieldedPool__Chip--${dir}`}>
          {t.label} <b>{t.count.toLocaleString('en-US')}</b>
        </span>
      ))}
    </div>
  )
}

export default function ShieldedPoolCard ({ rate, enabled = true }) {
  const [pool, setPool] = useState({ loading: true, error: false, balance: null, notes: null })
  const [period, setPeriod] = useState({ loading: true, in: 0, out: 0, transitions: 0, types: [] })
  const [flows, setFlows] = useState({ loading: true, buckets: [] })
  const [presetIdx, setPresetIdx] = useState(DEFAULT_PRESET)
  const [hover, setHover] = useState(null)

  useEffect(() => {
    if (!enabled) { setPool(s => ({ ...s, loading: true, error: false })); return }
    Api.getShieldedPool()
      .then(res => setPool({ loading: false, error: false, balance: res?.poolBalance ?? null, notes: res?.notesCount ?? null }))
      .catch(() => setPool({ loading: false, error: true, balance: null, notes: null }))
  }, [enabled])

  useEffect(() => {
    if (!enabled) { setPeriod(s => ({ ...s, loading: true })); return }
    const { start, end } = presetRange(PRESETS[presetIdx])
    setPeriod(s => ({ ...s, loading: true }))
    Api.getShieldedStatistic(start, end)
      .then(res => setPeriod({
        loading: false,
        in: Number(res?.totalShieldedIn) || 0,
        out: Number(res?.totalShieldedOut) || 0,
        transitions: Number(res?.transitionsCount) || 0,
        types: res?.types ?? []
      }))
      .catch(() => setPeriod({ loading: false, in: 0, out: 0, transitions: 0, types: [] }))
  }, [presetIdx, enabled])

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
      let s = 0
      while (s < buckets.length - 1 && !buckets[s].inAmt && !buckets[s].outAmt) s++
      setFlows({ loading: false, buckets: buckets.slice(s) })
    })
  }, [presetIdx, enabled])

  const balanceDash = creditsToDash(Number(pool.balance) || 0)
  const inDash = creditsToDash(period.in)
  const outDash = creditsToDash(period.out)
  const transfersInside = (period.types || [])
    .filter(t => TYPE_INFO[t.transactionType]?.dir === 'inside')
    .reduce((sum, t) => sum + t.count, 0)
  const windowLabel = PRESETS[presetIdx].label

  const buckets = flows.buckets
  const flowMax = buckets.reduce((max, b) => Math.max(max, b.inAmt, b.outAmt), 0)
  const barStep = buckets.length ? SPARK_W / buckets.length : SPARK_W
  const barW = barStep * 0.62
  const tipFmt = windowLabel === '24h' ? timeFmt : dateFmt

  const handleMove = (e) => {
    if (!buckets.length || flows.loading) return
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = (e.clientX - rect.left) / rect.width
    const idx = Math.min(buckets.length - 1, Math.max(0, Math.floor(frac * buckets.length)))
    setHover({ idx, xPct: (idx * barStep + barStep / 2) / SPARK_W * 100 })
  }

  const hovered = hover != null ? buckets[hover.idx] : null

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder ShieldedPool'} w={'100%'} as={'section'} aria-label={'Shielded pool'}>
      <div className={'ShieldedPool__Scan'} aria-hidden={'true'}/>

      <header className={'ShieldedPool__Head'}>
        <div className={'ShieldedPool__HeadText'}>
          <span className={'ShieldedPool__Eyebrow'}>Privacy layer</span>
          <h2 className={'ShieldedPool__Title'}>Shielded pool</h2>
          <p className={'ShieldedPool__Lede'}>
            DASH entering the pool disappears from public view; leaving makes it visible again.
            <Tooltip
              title={'How it works'}
              content={'Shield converts public DASH into private notes inside the pool. Private transfers move value between owners without revealing amounts or parties. Unshield converts notes back to public DASH.'}
              placement={'top'}
            >
              <span className={'ShieldedPool__LedeMore'}>How it works</span>
            </Tooltip>
          </p>
        </div>
        <Presets options={PRESETS} value={presetIdx} onChange={setPresetIdx}/>
      </header>

      {pool.error
        ? <div className={'ShieldedPool__Empty'}>No data</div>
        : <div className={'ShieldedPool__Airlock'}>
            <div className={'ShieldedPool__Gate ShieldedPool__Gate--in'}>
              <span className={'ShieldedPool__GateLabel'}>Shielded in · {windowLabel}</span>
              {period.loading
                ? <Skeleton w={'7ch'} h={'1.4em'}/>
                : <RateTooltip dash={inDash} rate={rate?.data} placement={'top'}>
                    <span className={'ShieldedPool__GateValue'}>
                      +{fmtDash(inDash)} <i>DASH</i>
                    </span>
                  </RateTooltip>}
              <TypeChips types={period.types} dir={'in'}/>
              <span className={'ShieldedPool__GateFlow'} aria-hidden={'true'}/>
            </div>

            <div className={'ShieldedPool__Vault'}>
              <div className={'ShieldedPool__VaultRing'} aria-hidden={'true'}/>
              <span className={'ShieldedPool__VaultLabel'}>Locked in pool</span>
              {pool.loading
                ? <Skeleton w={'9ch'} h={'1.6em'}/>
                : <RateTooltip dash={balanceDash} rate={rate?.data} placement={'top'}>
                    <span className={'ShieldedPool__VaultValue'}>
                      {fmtDash(balanceDash)} <i>DASH</i>
                    </span>
                  </RateTooltip>}
              <span className={'ShieldedPool__VaultMeta'}>
                {pool.notes != null && <>{Number(pool.notes).toLocaleString('en-US')} notes</>}
                {pool.notes != null && transfersInside > 0 && ' · '}
                {transfersInside > 0 && <>{transfersInside.toLocaleString('en-US')} private transfers · {windowLabel}</>}
              </span>
            </div>

            <div className={'ShieldedPool__Gate ShieldedPool__Gate--out'}>
              <span className={'ShieldedPool__GateLabel'}>Shielded out · {windowLabel}</span>
              {period.loading
                ? <Skeleton w={'7ch'} h={'1.4em'}/>
                : <RateTooltip dash={outDash} rate={rate?.data} placement={'top'}>
                    <span className={'ShieldedPool__GateValue'}>
                      &minus;{fmtDash(outDash)} <i>DASH</i>
                    </span>
                  </RateTooltip>}
              <TypeChips types={period.types} dir={'out'}/>
              <span className={'ShieldedPool__GateFlow'} aria-hidden={'true'}/>
            </div>
          </div>}

      <div className={'ShieldedPool__Spark'}>
        {flows.loading && !buckets.length
          ? <Skeleton w={'100%'} h={`${SPARK_H}px`} radius={6}/>
          : <div
              className={'ShieldedPool__SparkWrap'}
              onMouseMove={handleMove}
              onMouseLeave={() => setHover(null)}
            >
              <svg
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
                  <span className={'ShieldedPool__TipRow ShieldedPool__TipRow--in'}>In {fmtDash(creditsToDash(hovered.inAmt))} DASH</span>
                  <span className={'ShieldedPool__TipRow ShieldedPool__TipRow--out'}>Out {fmtDash(creditsToDash(hovered.outAmt))} DASH</span>
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
        </div>
      </div>
    </Box>
  )
}
