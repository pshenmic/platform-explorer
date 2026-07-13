'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Heading } from '@chakra-ui/react'
import { BigNumber, TimeDelta, TimeRemaining } from '../data'
import { RateTooltip, Tooltip } from '../ui/Tooltips'
import { creditsToDash, removeTrailingZeros, roundUsd } from '../../util'
import { useCountUp, useScramble } from './hooks'
import { StatusCell } from './StatusCell'
import { Skeleton } from './Skeleton'
import { contestedHref, compact, shortId } from './utils'

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

// section badge with the live (in-progress) epoch summary inside it
function SectionHead ({ title, currentEpoch }) {
  const data = currentEpoch?.data
  const epoch = data?.epoch

  return (
    <Heading className={'InfoBlock__Title EpochsOverview__Title'} as={'h2'}>
      {title}
      {epoch?.number != null &&
        <span className={'EpochsOverview__Now'} aria-label={`Current epoch ${epoch.number}, in progress`}>
          <span className={'EpochsOverview__NowNumber'}>#{epoch.number}</span>
          {epoch?.startTime && epoch?.endTime &&
            <span className={'EpochsOverview__NowMeta'}>
              <TimeRemaining startTime={epoch.startTime} endTime={epoch.endTime} displayProgress={false}/>
            </span>}
        </span>}
    </Heading>
  )
}

function EpochPoint ({ epoch, metricLabel, x, y, selected, hovered, onSelect }) {
  const windowLabel = windowLabelOf(epoch)

  return (
    <button
      type={'button'}
      className={`HomeHero__WavePoint EpochsWave__Point${selected ? ' is-selected' : ''}${hovered ? ' is-hovered' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Epoch ${epoch?.number}`}
    >
      <span className={'HomeHero__WaveValue EpochsWave__Number'}>#{epoch?.number}</span>
      <span className={'HomeHero__WaveDot'} aria-hidden={'true'}/>
      <span className={'EpochsWave__Meta'}>
        <span className={'HomeHero__WaveLabel'}>{metricLabel}</span>
        {epoch?.endTime &&
          <span className={'EpochsWave__When'}>
            {windowLabel && <>{windowLabel} · </>}
            ended <TimeDelta endDate={new Date(epoch.endTime)}/>
          </span>}
      </span>
    </button>
  )
}

// Fees value tooltip: exact DASH/USD plus the epoch fee economics masternode owners care about
function FeesTooltip ({ data, rate, children }) {
  const feesCredits = Number(data.totalCollectedFees) || 0
  const dash = creditsToDash(feesCredits)
  const usd = typeof rate?.data?.usd === 'number' ? dash * rate.data.usd : null
  const epoch = data.epoch
  const rows = [
    ['Processing', epoch?.totalProcessingFees],
    ['Storage paid out', epoch?.totalDistributedStorageFees],
    ['Storage created', epoch?.totalCreatedStorageFees]
  ].filter(([, v]) => v != null)

  return (
    <Tooltip
      title={'Fees'}
      content={(
        <div className={'EpochsOverview__Tip'}>
          <div className={'EpochsOverview__TipMain'}>
            {removeTrailingZeros(dash.toFixed(8))} Dash
            {typeof usd === 'number' && <span className={'EpochsOverview__TipUsd'}> · ~{roundUsd(usd)}$</span>}
          </div>
          {rows.map(([label, v]) => (
            <div className={'EpochsOverview__TipRow'} key={label}>
              <span>{label}</span>
              <span>{compact(Number(v))} credits</span>
            </div>
          ))}
          {epoch?.feeMultiplier != null &&
            <div className={'EpochsOverview__TipRow'}>
              <span>Fee multiplier</span>
              <span>×{epoch.feeMultiplier}</span>
            </div>}
        </div>
      )}
      placement={'top'}
    >
      {children}
    </Tooltip>
  )
}

// Votes value tooltip: governance activity that doesn't fit the single-line cell
function VotesTooltip ({ data, children }) {
  const resource = data.topVotedResource
  const voter = data.bestVoter?.identifier

  return (
    <Tooltip
      title={'Votes'}
      content={(
        <div className={'EpochsOverview__Tip'}>
          <div className={'EpochsOverview__TipMain'}>{Number(data.totalVotesCount) || 0} masternode votes</div>
          <div className={'EpochsOverview__TipRow'}>
            <span>Gas used</span>
            <span>{compact(Number(data.totalVotesGasUsed) || 0)} credits</span>
          </div>
          {voter != null &&
            <div className={'EpochsOverview__TipRow'}>
              <span>Top voter</span>
              <span>{shortId(voter)}</span>
            </div>}
          {resource?.resourceValue != null &&
            <div className={'EpochsOverview__TipRow'}>
              <span>Top resource</span>
              <span>
                {String(resource.resourceValue)} · {resource.totalCountTowardsIdentity ?? 0}/{resource.totalCountAbstain ?? 0}/{resource.totalCountLock ?? 0}
              </span>
            </div>}
        </div>
      )}
      placement={'top'}
    >
      {children}
    </Tooltip>
  )
}

// Blocks value tooltip: where the epoch started on both chains
function BlocksTooltip ({ epoch, children }) {
  return (
    <Tooltip
      title={'Blocks'}
      content={(
        <div className={'EpochsOverview__Tip'}>
          <div className={'EpochsOverview__TipRow'}>
            <span>First block</span>
            <span>#{epoch.firstBlockHeight}</span>
          </div>
          {epoch.firstCoreBlockHeight != null &&
            <div className={'EpochsOverview__TipRow'}>
              <span>Core height</span>
              <span>{epoch.firstCoreBlockHeight}</span>
            </div>}
        </div>
      )}
      placement={'top'}
    >
      {children}
    </Tooltip>
  )
}

// stat row for the shown (hovered or pinned) epoch; every number eases from its previous value
function EpochCells ({ data, rate }) {
  const epoch = data.epoch
  const blocks = epoch?.totalBlocksInEpoch // finalized-only (null for current)
  const rewards = epoch?.coreBlockRewards // finalized-only (credits, null for current)
  const feesCredits = Number(data.totalCollectedFees) || 0
  const topResource = data.topVotedResource?.resourceValue

  const txAnim = useCountUp(Number(data.totalTxCount) || 0)
  const blocksAnim = useCountUp(typeof blocks === 'number' ? blocks : null)
  const feesAnim = useCountUp(feesCredits)
  const rewardsAnim = useCountUp(rewards != null ? Number(rewards) : null)
  const votesAnim = useCountUp(Number(data.totalVotesCount) || 0)
  const proposerAnim = useScramble(data.bestValidator ? shortId(data.bestValidator) : null)

  return (
    <div className={'EpochsOverview__Cells HomeHero__StatusBar'}>
      <StatusCell label={'Transactions'} hint={'State transitions processed during this epoch.'}>
        <span className={'EpochsOverview__Stat'}><BigNumber>{txAnim}</BigNumber></span>
      </StatusCell>

      <StatusCell label={'Blocks'} hint={'Blocks produced in the epoch (finalized after it ends). Hover the value for the starting heights.'}>
        {typeof blocksAnim === 'number' && epoch?.firstBlockHeight != null
          ? <BlocksTooltip epoch={epoch}>
              <span className={'EpochsOverview__Stat EpochsOverview__Stat--Tip'}><BigNumber>{blocksAnim}</BigNumber></span>
            </BlocksTooltip>
          : typeof blocksAnim === 'number'
            ? <span className={'EpochsOverview__Stat'}><BigNumber>{blocksAnim}</BigNumber></span>
            : <Pending/>}
      </StatusCell>

      <StatusCell label={'Fees'} hint={'Total fees (credits) collected from state transitions this epoch. Hover the value for DASH / USD and the processing/storage breakdown.'}>
        <FeesTooltip data={data} rate={rate}>
          <span className={'EpochsOverview__Stat EpochsOverview__Stat--Tip'}>
            {compact(typeof feesAnim === 'number' ? feesAnim : feesCredits) ?? 0}
            <span className={'EpochsOverview__Unit'}>credits</span>
          </span>
        </FeesTooltip>
      </StatusCell>

      <StatusCell label={'Rewards'} hint={'Core block rewards (credits) added to the evonode pool for the epoch (finalized after it ends). Hover for the exact DASH / USD value.'}>
        {typeof rewardsAnim === 'number'
          ? <RateTooltip dash={creditsToDash(Number(rewards))} rate={rate?.data} placement={'top'}>
              <span className={'EpochsOverview__Stat EpochsOverview__Stat--Tip'}>
                {creditsToDash(rewardsAnim).toFixed(2)}
                <span className={'EpochsOverview__Unit'}>DASH</span>
              </span>
            </RateTooltip>
          : <Pending/>}
      </StatusCell>

      <StatusCell label={'Proposer'} hint={'Validator that proposed the most blocks this epoch.'}>
        {data.bestValidator
          ? <Link href={`/validator/${data.bestValidator}`} className={'EpochsOverview__Proposer'}>
              <span className={'EpochsOverview__Stat EpochsOverview__ProposerVal'}>{proposerAnim}</span>
            </Link>
          : <span className={'EpochsOverview__Stat'}>-</span>}
      </StatusCell>

      <StatusCell label={'Votes'} hint={'Masternode votes cast this epoch. Hover the value for gas, the top voter and the most-voted resource.'}>
        <VotesTooltip data={data}>
          <span className={'EpochsOverview__Stat EpochsOverview__Stat--Tip'}>{votesAnim}</span>
        </VotesTooltip>
        {topResource &&
          <Link href={contestedHref(topResource)} className={'EpochsOverview__Sub EpochsOverview__SubLink'}>
            {String(topResource)}
          </Link>}
      </StatusCell>

      <StatusCell label={'Protocol'} hint={'Platform protocol version the epoch ran on (from its first block). Upgrades activate on epoch boundaries, so a version bump means node operators had to update.'}>
        <span className={'EpochsOverview__Stat'}>
          {typeof data.protocolVersion === 'number' ? `v${data.protocolVersion}` : '-'}
        </span>
      </StatusCell>
    </div>
  )
}

export function EpochsOverview ({ title, epochs, currentEpoch, rate, loading }) {
  const list = Array.isArray(epochs) ? epochs.filter(e => e?.epoch) : []
  const lastIdx = list.length - 1
  const [selected, setSelected] = useState(lastIdx)
  const [hovered, setHovered] = useState(null)
  const crosshairRef = useRef(null)

  // keep selection pinned to the newest epoch as data streams in
  useEffect(() => { setSelected(lastIdx) }, [lastIdx])

  // skeleton keeps the section footprint; the wave loads as a ghost outline, not a grey box
  if (loading && !list.length) {
    const ghostYs = [46, 40, 52, 44]
    const ghostPts = X_POSITIONS.map((gx, i) => ({ x: gx, y: ghostYs[i] }))
    const ghostLine = [{ x: 0, y: ghostYs[0] }, ...ghostPts, { x: 100, y: ghostYs[ghostYs.length - 1] }]
    const ghostD = `M ${ghostLine.map(p => `${p.x} ${p.y}`).join(' L ')}`

    return (
      <div className={'EpochsOverview'}>
        <SectionHead title={title} currentEpoch={currentEpoch}/>
        <div className={'HomeHero__Wave EpochsWave EpochsWave--Skeleton'}>
          <svg className={'HomeHero__WaveSvg'} viewBox={'0 0 100 100'} preserveAspectRatio={'none'} aria-hidden={'true'}>
            <path className={'EpochsWave__GhostLine'} d={ghostD} fill={'none'} vectorEffect={'non-scaling-stroke'}/>
            <path className={'EpochsWave__GhostScan'} d={ghostD} fill={'none'} pathLength={'100'} vectorEffect={'non-scaling-stroke'}/>
          </svg>
          {ghostPts.map(p => (
            <span
              key={p.x}
              className={'EpochsWave__GhostDot'}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              aria-hidden={'true'}
            />
          ))}
        </div>
        <div className={'EpochsOverview__Detail'}>
          <div className={'EpochsOverview__Cells HomeHero__StatusBar'}>
            {Array.from({ length: 7 }).map((_, i) => (
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
    return (
      <div className={'EpochsOverview'}>
        <SectionHead title={title} currentEpoch={currentEpoch}/>
        <div className={'HomeHero__Wave EpochsWave EpochsWave--Empty'}>No epoch data</div>
      </div>
    )
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
  // cells below always show the CLICKED epoch; hover only highlights on the chart
  const shown = list[selIdx] || list[lastIdx]

  // nearest-point snap: any position over the wave maps to the closest epoch
  const nearestIdx = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    let best = 0
    for (let i = 1; i < list.length; i++) {
      if (Math.abs(xPct - points[i].x) < Math.abs(xPct - points[best].x)) best = i
    }
    return best
  }

  // crosshair position is set straight on the DOM node so mousemove causes zero re-renders
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    if (crosshairRef.current) crosshairRef.current.style.left = `${xPct}%`
    setHovered(nearestIdx(e))
  }

  return (
    <div className={'EpochsOverview'} style={{ '--epoch-x-frac': (points[selIdx]?.x ?? 50) / 100 }}>
      <SectionHead title={title} currentEpoch={currentEpoch}/>

      <div
        className={'HomeHero__Wave EpochsWave'}
        onMouseMove={handleMove}
        onMouseLeave={() => setHovered(null)}
      >
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

        <span
          ref={crosshairRef}
          className={`EpochsWave__Crosshair${hovered != null ? ' is-visible' : ''}`}
          aria-hidden={'true'}
        />

        {/* two light rails framing the selected epoch, running down to its stats row */}
        <span
          className={'EpochsWave__Beam'}
          style={{
            left: `${points[selIdx]?.x ?? 50}%`,
            // top sits just above the epoch number so no empty rail hangs over it
            top: `calc(${points[selIdx]?.y ?? 50}% - 48px)`
          }}
          aria-hidden={'true'}
        >
          <span key={`l-${selIdx}`} className={'EpochsWave__BeamPulse EpochsWave__BeamPulse--l'}/>
          <span key={`r-${selIdx}`} className={'EpochsWave__BeamPulse EpochsWave__BeamPulse--r'}/>
        </span>

        {list.map((e, i) => (
          <EpochPoint
            key={e.epoch.number}
            epoch={e.epoch}
            metricLabel={`${compact(txCounts[i])} tx`}
            x={points[i].x}
            y={points[i].y}
            selected={i === selIdx}
            hovered={i === hovered}
            onSelect={() => setSelected(i)}
          />
        ))}
      </div>

      <div className={'EpochsOverview__Detail'}>
        <EpochCells data={shown} rate={rate}/>
      </div>
    </div>
  )
}
