'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Identifier, BigNumber, TimeDelta } from '../data'
import EpochProgress from '../networkStatus/EpochProgress'
import { creditsToDash, roundUsd } from '../../util'
import { StatusCell } from './StatusCell'
import { Skeleton } from './Skeleton'
import { contestedHref, compact } from './utils'

// 4 epoch points spread across the wave (oldest left -> current right), mirrors the old KPI wave.
const X_POSITIONS = [10, 37, 63, 90]
const Y_HIGH = 22
const Y_LOW = 70

// blocks mined in an epoch = next epoch first height - this epoch first height
// (current epoch uses the live chain height).
function blocksFor (epochs, i, currentHeight) {
  const cur = Number(epochs[i]?.epoch?.firstBlockHeight)
  const next = i + 1 < epochs.length
    ? Number(epochs[i + 1]?.epoch?.firstBlockHeight)
    : Number(currentHeight)
  if (!Number.isFinite(cur) || !Number.isFinite(next)) return null
  return Math.max(0, next - cur)
}

function EpochPoint ({ epoch, metricLabel, x, y, active, selected, onSelect }) {
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
      <span className={'HomeHero__WaveLabel'}>{metricLabel}</span>
    </button>
  )
}

export function EpochsOverview ({ epochs, currentHeight, rate, loading }) {
  const list = Array.isArray(epochs) ? epochs.filter(e => e?.epoch) : []
  const lastIdx = list.length - 1
  const [selected, setSelected] = useState(lastIdx)

  // keep selection pinned to the newest epoch as data streams in
  useEffect(() => { setSelected(lastIdx) }, [lastIdx])

  // skeleton shell while loading — same wave height + detail row so layout doesn't jump on swap
  if (loading && !list.length) {
    return (
      <div className={'EpochsOverview'}>
        <div className={'HomeHero__Wave EpochsWave EpochsWave--Skeleton'}>
          <Skeleton w={'100%'} h={'120px'} radius={8}/>
        </div>
        <div className={'EpochsOverview__Detail'}>
          <div className={'EpochsOverview__DetailHead'}><Skeleton w={'150px'} h={'1.1em'}/></div>
          <div className={'EpochsOverview__Cells HomeHero__StatusBar'}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div className={'HomeHero__StatusCell'} key={i}>
                <Skeleton w={'48px'} h={'0.6em'}/>
                <Skeleton w={'72px'} h={'1.1em'} className={'EpochsOverview__SkelGap'}/>
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

  const blocks = list.map((_, i) => blocksFor(list, i, currentHeight))
  // wave height is driven by fees collected per epoch (flat midline if all equal/zero)
  const fees = list.map(e => Number(e.totalCollectedFees) || 0)
  const fMin = Math.min(...fees)
  const fMax = Math.max(...fees)
  const yOf = (v) => {
    if (fMax === fMin) return (Y_HIGH + Y_LOW) / 2
    return Y_LOW - ((v - fMin) / (fMax - fMin)) * (Y_LOW - Y_HIGH)
  }

  const points = list.map((e, i) => ({ x: X_POSITIONS[i] ?? (i / Math.max(1, lastIdx)) * 100, y: yOf(fees[i]) }))
  // anchor the line to the block edges for the full-bleed look
  const linePts = [{ x: 0, y: points[0].y }, ...points, { x: 100, y: points[lastIdx].y }]
  const lineD = `M ${linePts.map(p => `${p.x} ${p.y}`).join(' L ')}`
  const areaD = `M 0 100 L ${linePts.map(p => `${p.x} ${p.y}`).join(' L ')} L 100 100 Z`

  const sel = list[Math.min(selected, lastIdx)] || list[lastIdx]
  const selEpoch = sel.epoch
  const selBlocks = blocks[Math.min(selected, lastIdx)]
  const isActive = Math.min(selected, lastIdx) === lastIdx
  const windowLabel = (() => {
    if (!selEpoch?.startTime || !selEpoch?.endTime) return null
    const ms = selEpoch.endTime - selEpoch.startTime
    if (ms >= 86400000) return `${(ms / 86400000).toFixed(1)}d window`
    if (ms >= 3600000) return `${Math.round(ms / 3600000)}h window`
    return `${Math.round(ms / 60000)}m window`
  })()
  const feesDash = sel.totalCollectedFees ? creditsToDash(Number(sel.totalCollectedFees)) : 0
  const feesUsd = feesDash && rate?.data?.usd ? roundUsd(feesDash * rate.data.usd) : null
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
            metricLabel={fees[i] > 0 ? `${compact(fees[i])} cr` : 'no fees'}
            x={points[i].x}
            y={points[i].y}
            active={i === lastIdx}
            selected={i === Math.min(selected, lastIdx)}
            onSelect={() => setSelected(i)}
          />
        ))}
      </div>

      <div className={'EpochsOverview__Detail'}>
        <div className={'EpochsOverview__DetailHead'}>
          <span className={'EpochsOverview__DetailEpoch'}>Epoch #{selEpoch?.number}</span>
          {windowLabel && <span className={'EpochsOverview__DetailMeta'}>{windowLabel}</span>}
          {isActive && selEpoch?.startTime && selEpoch?.endTime
            ? <EpochProgress className={'EpochsOverview__Progress'} epoch={selEpoch}/>
            : selEpoch?.endTime &&
              <span className={'EpochsOverview__DetailMeta'}>ended <TimeDelta endDate={new Date(selEpoch.endTime)}/></span>}
        </div>

        <div className={'EpochsOverview__Cells HomeHero__StatusBar'}>
          <StatusCell label={'Blocks'} hint={'Blocks proposed during this epoch.'}>
            <span className={'EpochsOverview__Stat'}>
              {typeof selBlocks === 'number' ? <BigNumber>{selBlocks}</BigNumber> : '-'}
            </span>
          </StatusCell>

          <StatusCell label={'Fees'} hint={'Total fees (credits) collected from state transitions this epoch.'}>
            <span className={'EpochsOverview__Stat'}>
              <BigNumber>{Number(sel.totalCollectedFees) || 0}</BigNumber>
              <span className={'EpochsOverview__Unit'}>credits</span>
            </span>
            {feesUsd && <span className={'EpochsOverview__Sub'}>≈ {feesUsd}$</span>}
          </StatusCell>

          <StatusCell label={'TPS'} hint={'Average transactions per second across the epoch.'}>
            <span className={'EpochsOverview__Stat'}>{(Number(sel.tps) || 0).toFixed(4)}</span>
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
