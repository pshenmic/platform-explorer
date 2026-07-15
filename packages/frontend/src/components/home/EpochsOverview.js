'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heading } from '@chakra-ui/react'
import { BigNumber, TimeDelta } from '../data'
import { RateTooltip, Tooltip } from '../ui/Tooltips'
import { creditsToDash, removeTrailingZeros, roundUsd } from '../../util'
import { useCountUp, useScramble } from './hooks'
import { StatusCell } from './StatusCell'
import { Skeleton } from './Skeleton'
import { contestedHref, compact, shortId } from './utils'

// 4 epoch points, ends pulled inward so the edge block-markers have room
const X_POSITIONS = [14, 38, 62, 86]
// edge block-markers sit a breath off the wave rims; epoch segments end at these markers
const EDGE_L = 1.2
const EDGE_R = 98.8
const Y_HIGH = 22
const Y_LOW = 70

// neutral marker for finalized-only fields that are null while the epoch is in progress
function Pending () {
  return <span className={'EpochsOverview__Pending'}>pending</span>
}

// compact epoch length: fixed per network (1h on testnet, 9.125d on mainnet)
function durationLabelOf (epoch) {
  if (!epoch?.startTime || !epoch?.endTime) return null
  const ms = epoch.endTime - epoch.startTime
  return ms >= 86400000 ? `${(ms / 86400000).toFixed(1)}d` : `${Math.round(ms / 3600000)}h`
}

// boundary timestamps: date + time on short (testnet) epochs, date on mainnet-length ones
const boundTimeFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
const boundDateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

// session-break marker between two epochs: the block (and moment) one epoch flowed into the next
function EpochBound ({ bound, longEpochs }) {
  const label = bound.ts ? (longEpochs ? boundDateFmt : boundTimeFmt).format(new Date(bound.ts)) : null
  const content = (
    <>
      <span className={'EpochsWave__BoundBlock'}>
        <span className={'EpochsWave__BoundTag'}>{bound.approx ? 'est. block' : 'block'}</span> {bound.approx ? '~' : ''}#{bound.height}
      </span>
      {label && <span className={'EpochsWave__BoundWhen'}>{label}</span>}
    </>
  )
  const edgeClass = bound.edge ? ` EpochsWave__Bound--edge${bound.edge.toUpperCase()}` : ''
  const approxClass = bound.approx ? ' is-approx' : ''

  // only the label is a link; top tracks the wave height so it sits just above the line
  return (
    <span className={`EpochsWave__Bound${edgeClass}${approxClass}`} style={{ left: `${bound.x}%`, top: `calc(${bound.y}% - 44px)` }}>
      {bound.hash
        ? <Link
            href={`/block/${bound.hash}`}
            className={'EpochsWave__BoundLabel'}
            aria-label={`Epoch boundary, first block #${bound.height}`}
          >
            {content}
          </Link>
        : <span
            className={`EpochsWave__BoundLabel${bound.approx ? ' is-approx' : ''}`}
            aria-label={bound.approx ? `Estimated final block ~#${bound.height}` : undefined}
            aria-hidden={bound.approx ? undefined : 'true'}
          >
            {content}
          </span>}
    </span>
  )
}

// section badge states only the fixed epoch length; the live epoch sits on the wave
function SectionHead ({ title, currentEpoch }) {
  const durationLabel = durationLabelOf(currentEpoch?.data?.epoch)

  return (
    <Heading className={'InfoBlock__Title EpochsOverview__Title'} as={'h2'}>
      {title}
      {durationLabel &&
        <span className={'EpochsOverview__Now'} aria-label={`Epoch length ${durationLabel}`}>
          <span className={'EpochsOverview__NowMeta'}>every {durationLabel}</span>
        </span>}
    </Heading>
  )
}

function EpochPoint ({ epoch, metricLabel, x, y, selected, hovered, onSelect }) {
  // the in-progress epoch counts down ("36 min. left") instead of "ended X ago"
  const inProgress = epoch?.endTime > Date.now()

  return (
    <button
      type={'button'}
      className={`HomeHero__WavePoint EpochsWave__Point${selected ? ' is-selected' : ''}${hovered ? ' is-hovered' : ''}${inProgress ? ' is-live' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Epoch ${epoch?.number}${inProgress ? ', in progress' : ''}`}
    >
      <span className={'HomeHero__WaveValue EpochsWave__Number'}>#{epoch?.number}</span>
      <span className={'HomeHero__WaveDot'} aria-hidden={'true'}/>
      <span className={'EpochsWave__Meta'}>
        <span className={'HomeHero__WaveLabel'}>{metricLabel}</span>
        {epoch?.endTime &&
          <span className={'EpochsWave__When'}>
            {!inProgress && <>ended </>}
            <TimeDelta endDate={new Date(epoch.endTime)}/>
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

// stat row for the shown epoch; washKey remounts the wash so the pour replays on every pick
function EpochCells ({ data, rate, washKey }) {
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
      <span key={`wash-${washKey}`} className={'EpochsOverview__Wash'} aria-hidden={'true'}/>
      <StatusCell label={'Transactions'} hint={'State transitions processed during this epoch.'}>
        <span className={'EpochsOverview__Stat'}><BigNumber>{txAnim}</BigNumber></span>
      </StatusCell>

      <StatusCell label={'Blocks'} hint={'Blocks produced in the epoch (finalized after it ends). Hover the value for the starting heights.'}>
        {typeof blocksAnim === 'number' && epoch?.firstBlockHeight != null
          ? <BlocksTooltip epoch={epoch}>
              <span className={'EpochsOverview__Stat EpochsOverview__Stat--Tip'}>
                <span className={'EpochsOverview__TipTarget'}><BigNumber>{blocksAnim}</BigNumber></span>
              </span>
            </BlocksTooltip>
          : typeof blocksAnim === 'number'
            ? <span className={'EpochsOverview__Stat'}><BigNumber>{blocksAnim}</BigNumber></span>
            : <Pending/>}
      </StatusCell>

      <StatusCell label={'Fees'} hint={'Total fees (credits) collected from state transitions this epoch. Hover the value for DASH / USD and the processing/storage breakdown.'}>
        <FeesTooltip data={data} rate={rate}>
          <span className={'EpochsOverview__Stat EpochsOverview__Stat--Tip'}>
            <span className={'EpochsOverview__TipTarget'}>
              {compact(typeof feesAnim === 'number' ? feesAnim : feesCredits) ?? 0}
              <span className={'EpochsOverview__Unit'}>credits</span>
            </span>
          </span>
        </FeesTooltip>
      </StatusCell>

      <StatusCell label={'Rewards'} hint={'Core block rewards (credits) added to the evonode pool for the epoch (finalized after it ends). Hover for the exact DASH / USD value.'}>
        {typeof rewardsAnim === 'number'
          ? <RateTooltip dash={creditsToDash(Number(rewards))} rate={rate?.data} placement={'top'}>
              <span className={'EpochsOverview__Stat EpochsOverview__Stat--Tip'}>
                <span className={'EpochsOverview__TipTarget'}>
                  {creditsToDash(rewardsAnim).toFixed(2)}
                  <span className={'EpochsOverview__Unit'}>DASH</span>
                </span>
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
          <span className={'EpochsOverview__Stat EpochsOverview__Stat--Tip'}>
            <span className={'EpochsOverview__TipTarget'}>{votesAnim}</span>
          </span>
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

  // epoch boundaries sit between adjacent points: epoch i ended where epoch i+1 began
  const bounds = list.slice(1).map((e, i) => ({
    x: (points[i].x + points[i + 1].x) / 2,
    // wave height at the boundary (the line is straight between vertices) — labels ride above it
    y: (points[i].y + points[i + 1].y) / 2,
    height: e.epoch?.firstBlockHeight,
    ts: e.epoch?.startTime,
    hash: e.firstBlockHash
  })).filter(b => b.height != null)

  // edge markers: exact window start; projected live-epoch close (height estimated)
  if (list[0]?.epoch?.firstBlockHeight != null) {
    bounds.unshift({
      x: EDGE_L,
      y: points[0].y,
      height: list[0].epoch.firstBlockHeight,
      ts: list[0].epoch.startTime,
      hash: list[0].firstBlockHash,
      edge: 'l'
    })
  }
  const lastEntry = list[lastIdx]
  const prevEntry = list[lastIdx - 1]
  if (
    lastEntry?.epoch?.endTime > Date.now() &&
    lastEntry?.epoch?.firstBlockHeight != null &&
    prevEntry?.epoch?.firstBlockHeight != null
  ) {
    const prevSpan = Number(lastEntry.epoch.firstBlockHeight) - Number(prevEntry.epoch.firstBlockHeight)
    bounds.push({
      x: EDGE_R,
      y: points[lastIdx].y,
      height: Number(lastEntry.epoch.firstBlockHeight) + prevSpan - 1,
      ts: lastEntry.epoch.endTime,
      hash: null,
      edge: 'r',
      approx: true
    })
  }
  const longEpochs = list.some(e => (e.epoch?.endTime - e.epoch?.startTime) >= 86400000)

  // boundaries carve the wave into one segment per epoch, ending at the edge markers
  const segments = points.map((p, i) => {
    const l = i === 0 ? EDGE_L : (points[i - 1].x + p.x) / 2
    const r = i === lastIdx ? EDGE_R : (p.x + points[i + 1].x) / 2
    return { l: l / 100, w: (r - l) / 100 }
  })
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

  const handleMove = (e) => setHovered(nearestIdx(e))

  const seg = segments[selIdx] ?? { l: 0, w: 1 }

  return (
    <div className={'EpochsOverview'} style={{ '--epoch-seg-l': seg.l, '--epoch-seg-w': seg.w }}>
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
          <path className={'HomeHero__WaveScanGlow'} d={lineD} fill={'none'} pathLength={'100'} vectorEffect={'non-scaling-stroke'}/>
          <path className={'HomeHero__WaveScan'} d={lineD} fill={'none'} pathLength={'100'} vectorEffect={'non-scaling-stroke'}/>
        </svg>

        {bounds.map(b => <EpochBound key={`${b.edge || 'mid'}-${b.height}`} bound={b} longEpochs={longEpochs}/>)}

        {/* light rails framing the selected epoch's whole segment (boundary to boundary) */}
        <span
          className={'EpochsWave__Beam'}
          style={{
            left: `${seg.l * 100}%`,
            width: `${seg.w * 100}%`,
            // rails run down from the wave line, keeping the boundary labels unobstructed
            top: `${points[selIdx]?.y ?? 50}%`
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
        <EpochCells data={shown} rate={rate} washKey={selIdx}/>
      </div>
    </div>
  )
}
