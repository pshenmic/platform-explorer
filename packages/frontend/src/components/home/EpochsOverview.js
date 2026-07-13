'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Identifier, BigNumber, TimeDelta, TimeRemaining } from '../data'
import { RateTooltip } from '../ui/Tooltips'
import { creditsToDash } from '../../util'
import { StatusCell } from './StatusCell'
import { Skeleton } from './Skeleton'
import { contestedHref, compact } from './utils'

// 4 epoch points spread across the wave (oldest left -> current right)
const X_POSITIONS = [10, 37, 63, 90]
const Y_HIGH = 22
const Y_LOW = 70

// compact epoch window: 1h on testnet, 9.1d on mainnet
function windowLabelOf (epoch) {
  if (!epoch?.startTime || !epoch?.endTime) return null
  const ms = epoch.endTime - epoch.startTime
  if (ms >= 86400000) return `${(ms / 86400000).toFixed(1)}d`
  if (ms >= 3600000) return `${Math.round(ms / 3600000)}h`
  return `${Math.round(ms / 60000)}m`
}

// neutral marker for finalized-only fields that are null while the epoch is in progress
function Pending () {
  return <span className={'EpochsOverview__Pending'}>pending</span>
}

function EpochPoint ({ epoch, metricLabel, x, y, active, selected, onSelect }) {
  const windowLabel = windowLabelOf(epoch)

  return (
    <button
      type={'button'}
      className={`HomeHero__WavePoint EpochsWave__Point${selected ? ' is-selected' : ''}${active ? ' is-active' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Epoch ${epoch?.number}`}
    >
      <span className={'HomeHero__WaveValue EpochsWave__Number'}>
        #{epoch?.number}{active && <span className={'EpochsWave__Live'}>live</span>}
      </span>
      <span className={'HomeHero__WaveDot'} aria-hidden={'true'}/>
      <span className={'EpochsWave__Meta'}>
        <span className={'HomeHero__WaveLabel'}>{metricLabel}</span>
        {epoch?.endTime &&
          <span className={'EpochsWave__When'}>
            {windowLabel && <>{windowLabel} · </>}
            {active
              ? <TimeRemaining startTime={epoch.startTime} endTime={epoch.endTime} displayProgress={false}/>
              : <>ended <TimeDelta endDate={new Date(epoch.endTime)}/></>}
          </span>}
      </span>
    </button>
  )
}

export function EpochsOverview ({ epochs, rate, loading }) {
  const list = Array.isArray(epochs) ? epochs.filter(e => e?.epoch) : []
  const lastIdx = list.length - 1
  const [selected, setSelected] = useState(lastIdx)

  // keep selection pinned to the newest epoch as data streams in
  useEffect(() => { setSelected(lastIdx) }, [lastIdx])

  // skeleton keeps the wave height + cells row so layout doesn't jump on swap
  if (loading && !list.length) {
    return (
      <div className={'EpochsOverview'}>
        <div className={'HomeHero__Wave EpochsWave EpochsWave--Skeleton'}>
          <Skeleton w={'100%'} h={'120px'} radius={8}/>
        </div>
        <div className={'EpochsOverview__Detail'}>
          <div className={'EpochsOverview__Cells HomeHero__StatusBar'}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div className={'HomeHero__StatusCell'} key={i}>
                <Skeleton w={'48px'} h={'0.6em'}/>
                <Skeleton w={'64px'} h={'1.1em'} className={'EpochsOverview__SkelGap'}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!list.length) {
    return <div className={'HomeHero__Wave EpochsWave EpochsWave--Empty'}>No epoch data</div>
  }

  // wave height is driven by tx count — the one metric available for every epoch incl. current
  const txCounts = list.map(e => Number(e.totalTxCount) || 0)
  const tMin = Math.min(...txCounts)
  const tMax = Math.max(...txCounts)
  const yOf = (v) => {
    if (tMax === tMin) return (Y_HIGH + Y_LOW) / 2
    return Y_LOW - ((v - tMin) / (tMax - tMin)) * (Y_LOW - Y_HIGH)
  }

  const points = list.map((e, i) => ({ x: X_POSITIONS[i] ?? (i / Math.max(1, lastIdx)) * 100, y: yOf(txCounts[i]) }))
  // anchor the line to the block edges for the full-bleed look
  const linePts = [{ x: 0, y: points[0].y }, ...points, { x: 100, y: points[lastIdx].y }]
  const lineD = `M ${linePts.map(p => `${p.x} ${p.y}`).join(' L ')}`
  const areaD = `M 0 100 L ${linePts.map(p => `${p.x} ${p.y}`).join(' L ')} L 100 100 Z`

  const selIdx = Math.min(selected, lastIdx)
  const sel = list[selIdx] || list[lastIdx]
  const selEpoch = sel.epoch

  const txCount = Number(sel.totalTxCount) || 0
  const blocks = selEpoch?.totalBlocksInEpoch // finalized-only (null for current)
  const rewards = selEpoch?.coreBlockRewards // finalized-only (credits, null for current)
  const feesCredits = Number(sel.totalCollectedFees) || 0
  const topResource = sel.topVotedResource?.resourceValue

  return (
    <div className={'EpochsOverview'}>
      <div className={'HomeHero__Wave EpochsWave'}>
        <svg className={'HomeHero__WaveSvg'} viewBox={'0 0 100 100'} preserveAspectRatio={'none'} aria-hidden={'true'}>
          <defs>
            <linearGradient id={'homeEpochFill'} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
              <stop offset={'0%'} stopColor={'rgba(0, 141, 228, 0.28)'}/>
              <stop offset={'100%'} stopColor={'rgba(0, 141, 228, 0)'}/>
            </linearGradient>
          </defs>
          <path d={areaD} fill={'url(#homeEpochFill)'} stroke={'none'}/>
          <path className={'HomeHero__WaveLine'} d={lineD} fill={'none'} vectorEffect={'non-scaling-stroke'}/>
          <path className={'HomeHero__WaveScan'} d={lineD} fill={'none'} pathLength={'100'} vectorEffect={'non-scaling-stroke'}/>
        </svg>

        {list.map((e, i) => (
          <EpochPoint
            key={e.epoch.number}
            epoch={e.epoch}
            metricLabel={`${compact(txCounts[i])} tx`}
            x={points[i].x}
            y={points[i].y}
            active={i === lastIdx}
            selected={i === selIdx}
            onSelect={() => setSelected(i)}
          />
        ))}
      </div>

      <div className={'EpochsOverview__Detail'}>
        <div className={'EpochsOverview__Cells HomeHero__StatusBar'}>
          <StatusCell label={'Transactions'} hint={'State transitions processed during this epoch.'}>
            <span className={'EpochsOverview__Stat'}><BigNumber>{txCount}</BigNumber></span>
          </StatusCell>

          <StatusCell label={'Blocks'} hint={'Blocks produced in the epoch (finalized after it ends).'}>
            {typeof blocks === 'number'
              ? <span className={'EpochsOverview__Stat'}><BigNumber>{blocks}</BigNumber></span>
              : <Pending/>}
          </StatusCell>

          <StatusCell label={'Fees'} hint={'Total fees (credits) collected from state transitions this epoch. Hover for the exact DASH / USD value.'}>
            <RateTooltip credits={feesCredits} rate={rate?.data} placement={'top'}>
              <span className={'EpochsOverview__Stat'}>
                {compact(feesCredits) ?? 0}
                <span className={'EpochsOverview__Unit'}>credits</span>
              </span>
            </RateTooltip>
          </StatusCell>

          <StatusCell label={'Rewards'} hint={'Core block rewards (credits) added to the evonode pool for the epoch (finalized after it ends). Hover for the exact DASH / USD value.'}>
            {rewards != null
              ? <RateTooltip dash={creditsToDash(Number(rewards))} rate={rate?.data} placement={'top'}>
                  <span className={'EpochsOverview__Stat'}>
                    {creditsToDash(Number(rewards)).toFixed(2)}
                    <span className={'EpochsOverview__Unit'}>DASH</span>
                  </span>
                </RateTooltip>
              : <Pending/>}
          </StatusCell>

          <StatusCell label={'Votes'} hint={'Masternode votes cast this epoch and the most-voted contested resource.'}>
            <span className={'EpochsOverview__Stat'}>{Number(sel.totalVotesCount) || 0}</span>
            {topResource &&
              <Link href={contestedHref(topResource)} className={'EpochsOverview__Sub EpochsOverview__SubLink'}>
                {String(topResource)}
              </Link>}
          </StatusCell>

          <StatusCell label={'Top proposer'} hint={'Validator that proposed the most blocks this epoch.'}>
            {sel.bestValidator
              ? <Link href={`/validator/${sel.bestValidator}`} className={'EpochsOverview__Proposer'}>
                  <Identifier ellipsis={false} middleEllipsis={true}>{sel.bestValidator}</Identifier>
                </Link>
              : <span className={'EpochsOverview__Stat'}>-</span>}
          </StatusCell>
        </div>
      </div>
    </div>
  )
}
