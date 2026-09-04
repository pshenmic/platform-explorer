'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import Link from 'next/link'
import { BigNumber, TimeDelta } from '../data'
import { BlockIcon } from '../ui/icons'
import { creditsToDash, removeTrailingZeros, roundUsd } from '../../util'
import { useCountUp, useScramble } from './hooks'
import { StatusCell } from './StatusCell'
import { Skeleton } from './Skeleton'
import { compact, shortId } from './utils'

const X_POSITIONS = [12.5, 37.5, 62.5, 87.5]
const EDGE_L = 0
const EDGE_R = 100
const Y_HIGH = 22
const Y_LOW = 60
const SCAN_BOTTOM_Y = 100
const SCAN_MIN_WAVE_SPAN = 10

function yAtX(pts: any, x: any) {
  if (!pts?.length) return 50
  if (x <= pts[0].x) return pts[0].y
  if (x >= pts[pts.length - 1].x) return pts[pts.length - 1].y
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    if (x >= a.x && x <= b.x) {
      const t = b.x === a.x ? 0 : (x - a.x) / (b.x - a.x)
      return a.y + t * (b.y - a.y)
    }
  }
  return pts[pts.length - 1].y
}

function ptsToPathD(pts: any) {
  if (!pts?.length) return null
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
  return `M ${pts.map((p: any) => `${p.x} ${p.y}`).join(' L ')}`
}

function spanX(pts: any) {
  if (!pts?.length) return 0
  return Math.abs(pts[pts.length - 1].x - pts[0].x)
}

function buildScanParts(linePts: any, seg: any) {
  if (!linePts?.length || !seg) {
    return { leftD: ptsToPathD(linePts), rightD: null, railDownD: null, railUpD: null }
  }
  const leftX = seg.l * 100
  const rightX = (seg.l + seg.w) * 100
  const yL = yAtX(linePts, leftX)
  const yR = yAtX(linePts, rightX)

  const left = []
  for (const p of linePts) {
    if (p.x < leftX - 1e-6) left.push(p)
    else break
  }
  left.push({ x: leftX, y: yL })

  const right = [{ x: rightX, y: yR }]
  for (const p of linePts) {
    if (p.x > rightX + 1e-6) right.push(p)
  }

  const railDownD = ptsToPathD([
    { x: leftX, y: yL },
    { x: leftX, y: SCAN_BOTTOM_Y }
  ])
  const railUpD = ptsToPathD([
    { x: rightX, y: SCAN_BOTTOM_Y },
    { x: rightX, y: yR }
  ])

  return {
    leftD: left.length >= 2 && spanX(left) >= SCAN_MIN_WAVE_SPAN ? ptsToPathD(left) : null,
    rightD: right.length >= 2 && spanX(right) >= SCAN_MIN_WAVE_SPAN ? ptsToPathD(right) : null,
    railDownD,
    railUpD
  }
}

function Pending() {
  return <span className={'EpochsOverview__Pending'}>pending</span>
}

function durationLabelOf(epoch: any) {
  if (!epoch?.startTime || !epoch?.endTime) return null
  const ms = epoch.endTime - epoch.startTime
  return ms >= 86400000 ? `${(ms / 86400000).toFixed(1)}d` : `${Math.round(ms / 3600000)}h`
}

function avgBlockTimeLabel(ms: any) {
  // API sends ms
  const s = ms / 1000
  return s < 60 ? `${s.toFixed(1)}s` : `${(s / 60).toFixed(1)}m`
}

const boundTimeFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})
const boundDateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

function boundWhenLabel(bound: any, longEpochs: boolean) {
  if (!bound?.ts) return null
  return (longEpochs ? boundDateFmt : boundTimeFmt).format(new Date(bound.ts))
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function nextWhenLabel(ts: unknown) {
  const d = ts instanceof Date ? ts : new Date(Number(ts))
  if (Number.isNaN(d.getTime())) return null
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

function NextEpochCard({ bound }: any) {
  const label = nextWhenLabel(bound.ts)
  return (
    <span
      className={'EpochsOverview__Next'}
      aria-label={`Next epoch end ~ block ${bound.height}${label ? `, ${label}` : ''}`}
    >
      <span className={'EpochsOverview__NextTag'}>Next</span>
      <span className={'EpochsOverview__NextBlock'}>
        <BlockIcon
          className={'EpochsOverview__NextIcon'}
          w={'1.125rem'}
          h={'1.125rem'}
          aria-hidden={'true'}
        />
        ~{bound.height}
      </span>
      {label && <span className={'EpochsOverview__NextWhen'}>{label}</span>}
      <i className={'EpochsOverview__NextLead'} aria-hidden={'true'} />
    </span>
  )
}

function EpochBound({ bound, longEpochs }: any) {
  const label = boundWhenLabel(bound, longEpochs)
  const edgeClass = bound.edge ? ` EpochsWave__Bound--edge${bound.edge.toUpperCase()}` : ''

  const content = (
    <>
      <span className={'EpochsWave__BoundBlock'}>
        <BlockIcon
          className={'EpochsWave__BoundIcon'}
          w={'0.875rem'}
          h={'0.875rem'}
          aria-hidden={'true'}
        />
        {bound.height}
      </span>
      {label && <span className={'EpochsWave__BoundWhen'}>{label}</span>}
    </>
  )

  return (
    <span
      className={`EpochsWave__Bound${edgeClass}`}
      style={{ left: `${bound.x}%`, top: `calc(${bound.y}% - 56px)` }}
    >
      {bound.hash ? (
        <Link
          href={`/block/${bound.hash}`}
          prefetch={false}
          className={'EpochsWave__BoundLabel'}
          aria-label={`Epoch boundary, first block #${bound.height}`}
        >
          {content}
        </Link>
      ) : (
        <span className={'EpochsWave__BoundLabel'}>{content}</span>
      )}
    </span>
  )
}

function EpochPoint({ epoch, metricLabel, x, y, selected, onSelect }: any) {
  const inProgress = epoch?.endTime > Date.now()
  const scanPulseDelay = `${(Number(x) / 100) * 5}s`

  return (
    <button
      type={'button'}
      className={`HomeHero__WavePoint EpochsWave__Point is-ready${selected ? ' is-selected' : ''}${inProgress ? ' is-live' : ''}`}
      style={
        { left: `${x}%`, top: `${y}%`, ['--scan-pulse-delay']: scanPulseDelay } as CSSProperties
      }
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Epoch ${epoch?.number}${inProgress ? ', in progress' : ''}`}
    >
      <span className={'EpochsWave__Id'}>
        <span className={'HomeHero__WaveValue EpochsWave__Number'}>#{epoch?.number}</span>
      </span>
      <span className={'HomeHero__WaveDot'} aria-hidden={'true'} />
      <span className={'EpochsWave__Meta'}>
        <span className={'HomeHero__WaveLabel'}>{metricLabel}</span>
        {epoch?.endTime && (
          <span className={'EpochsWave__When'}>
            {!inProgress && <>ended </>}
            <TimeDelta endDate={new Date(epoch.endTime)} />
          </span>
        )}
      </span>
    </button>
  )
}

function TipShell({ blurb, children }: any) {
  return (
    <div className={'EpochsOverview__Tip'}>
      {blurb && <div className={'EpochsOverview__TipBlurb'}>{blurb}</div>}
      {children}
    </div>
  )
}

function feesHint(data: any, rate: any) {
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
    <TipShell blurb={'Total fees (credits) collected from state transitions this epoch.'}>
      <div className={'EpochsOverview__TipMain'}>
        {removeTrailingZeros(dash.toFixed(8))} Dash
        {typeof usd === 'number' && (
          <span className={'EpochsOverview__TipUsd'}> · ~{roundUsd(usd)}$</span>
        )}
      </div>
      {rows.map(([label, v]) => (
        <div className={'EpochsOverview__TipRow'} key={label}>
          <span>{label}</span>
          <span>{compact(Number(v))} credits</span>
        </div>
      ))}
    </TipShell>
  )
}

function votesHint(data: any) {
  const resource = data.topVotedResource
  const voter = data.bestVoter?.identifier

  return (
    <TipShell blurb={'Masternode votes cast this epoch.'}>
      <div className={'EpochsOverview__TipMain'}>
        {Number(data.totalVotesCount) || 0} masternode votes
      </div>
      <div className={'EpochsOverview__TipRow'}>
        <span>Gas used</span>
        <span>{compact(Number(data.totalVotesGasUsed) || 0)} credits</span>
      </div>
      {voter != null && (
        <div className={'EpochsOverview__TipRow'}>
          <span>Top voter</span>
          <span>{shortId(voter)}</span>
        </div>
      )}
      {resource?.resourceValue != null && (
        <div className={'EpochsOverview__TipRow'}>
          <span>Top resource</span>
          <span>
            {String(resource.resourceValue)} · {resource.totalCountTowardsIdentity ?? 0}/
            {resource.totalCountAbstain ?? 0}/{resource.totalCountLock ?? 0}
          </span>
        </div>
      )}
    </TipShell>
  )
}

function proposersHint(proposers: any) {
  const blurb =
    'Validators that proposed Platform blocks this epoch (proposer rotates; similar counts mean even share). Click a row to open the validator.'
  if (!Array.isArray(proposers) || !proposers.length) {
    return 'Validator that proposed the most blocks this epoch. Full breakdown is available after the epoch finalizes.'
  }

  const sorted = [...proposers].sort((a, b) => Number(b.count) - Number(a.count))
  const top = sorted.slice(0, 10)
  const rest = sorted.length - top.length

  return (
    <TipShell blurb={blurb}>
      <div className={'EpochsOverview__TipMain'}>
        Top {top.length} of {sorted.length} proposers
      </div>
      {top.map(p => (
        <div className={'EpochsOverview__TipRow'} key={p.proposer}>
          <Link
            href={`/validator/${p.proposer}`}
            prefetch={false}
            className={'EpochsOverview__TipLink'}
            title={p.proposer}
            onClick={e => e.stopPropagation()}
          >
            <span className={'EpochsOverview__TipHash'}>{p.proposer}</span>
          </Link>
          <span>{Number(p.count)} blocks</span>
        </div>
      ))}
      {rest > 0 && (
        <div className={'EpochsOverview__TipRow'}>
          <span>+{rest} more</span>
          <span />
        </div>
      )}
    </TipShell>
  )
}

function blocksHint(epoch: any, endHeight: any, liveCount: any) {
  const blurb = 'Blocks produced in the epoch (finalized after it ends).'
  if (epoch?.firstBlockHeight == null) return blurb

  const longEpoch = epoch?.endTime - epoch?.startTime >= 86400000
  const fmt = longEpoch ? boundDateFmt : boundTimeFmt
  const inProgress = epoch?.endTime > Date.now()

  return (
    <TipShell blurb={blurb}>
      <div className={'EpochsOverview__TipRow'}>
        <span>Started</span>
        <span>
          #{epoch.firstBlockHeight}
          {epoch.startTime ? ` · ${fmt.format(new Date(epoch.startTime))}` : ''}
        </span>
      </div>
      {inProgress ? (
        <div className={'EpochsOverview__TipRow'}>
          <span>Ends</span>
          <span>{epoch.endTime ? `${fmt.format(new Date(epoch.endTime))} · ` : ''}in progress</span>
        </div>
      ) : (
        <div className={'EpochsOverview__TipRow'}>
          <span>Ended</span>
          <span>
            {endHeight != null ? `#${endHeight} · ` : ''}
            {epoch.endTime ? fmt.format(new Date(epoch.endTime)) : ''}
          </span>
        </div>
      )}
      {liveCount != null && (
        <div className={'EpochsOverview__TipRow'}>
          <span>Produced</span>
          <span>{liveCount.toLocaleString('en-US')} so far · counting</span>
        </div>
      )}
    </TipShell>
  )
}

function rewardsHint(rewards: any, rate: any) {
  const blurb =
    'The evonode share (37.5%) of the masternode portion of Dash Core block rewards, pooled over this epoch and paid out to participating evonodes when it ends (finalized after the epoch).'
  if (rewards == null) return blurb

  const dash = creditsToDash(Number(rewards))
  const usd = typeof rate?.data?.usd === 'number' ? dash * rate.data.usd : null

  return (
    <TipShell blurb={blurb}>
      <div className={'EpochsOverview__TipMain'}>
        {removeTrailingZeros(dash.toFixed(8))} Dash
        {typeof usd === 'number' && (
          <span className={'EpochsOverview__TipUsd'}> · ~{roundUsd(usd)}$</span>
        )}
      </div>
    </TipShell>
  )
}

function documentsHint(created: any, deleted: any) {
  const blurb = 'Documents created and deleted during this epoch.'
  if (created == null && deleted == null) return blurb

  const c = Number(created) || 0
  const d = Number(deleted) || 0

  return (
    <TipShell blurb={blurb}>
      <div className={'EpochsOverview__TipRow'}>
        <span>Created</span>
        <span>{c.toLocaleString('en-US')}</span>
      </div>
      <div className={'EpochsOverview__TipRow'}>
        <span>Deleted</span>
        <span>{d.toLocaleString('en-US')}</span>
      </div>
      <div className={'EpochsOverview__TipRow'}>
        <span>Total</span>
        <span>{(c + d).toLocaleString('en-US')}</span>
      </div>
    </TipShell>
  )
}

function transactionsHint(data: any) {
  const blurb = 'State transitions processed during this epoch.'
  const tps = data?.tps
  if (tps == null || Number.isNaN(Number(tps))) return blurb

  const tpsNum = Number(tps)
  const tpsLabel = tpsNum < 0.01 && tpsNum > 0 ? tpsNum.toFixed(4) : tpsNum.toFixed(3)

  return (
    <TipShell blurb={blurb}>
      <div className={'EpochsOverview__TipRow'}>
        <span>Transactions</span>
        <span>{(Number(data.totalTxCount) || 0).toLocaleString('en-US')}</span>
      </div>
      <div className={'EpochsOverview__TipRow'}>
        <span>TPS</span>
        <span>{tpsLabel}</span>
      </div>
    </TipShell>
  )
}

function EpochCells({ data, nextData, rate }: any) {
  const epoch = data.epoch
  const endHeight =
    nextData?.epoch?.number === epoch?.number + 1 && nextData?.epoch?.firstBlockHeight != null
      ? Number(nextData.epoch.firstBlockHeight) - 1
      : null
  const finalizedBlocks = epoch?.totalBlocksInEpoch
  const pendingBlocks = data.pendingBlocksInEpoch != null ? Number(data.pendingBlocksInEpoch) : null
  const blocks = finalizedBlocks ?? pendingBlocks ?? null
  const blocksLive = finalizedBlocks == null && blocks != null
  const rewards = epoch?.coreBlockRewards
  const feesCredits = Number(data.totalCollectedFees) || 0

  const created = data.totalCreatedDocumentsCount // undefined → Pending; 0 is a real value
  const deleted = data.totalDeletedDocumentsCount
  const names = data.totalRegisteredNamesCount
  const contested = data.totalContestedDocumentsCount
  const avgMs = data.avgBlockTime
  const proposers = epoch?.blockProposers

  const txAnim = useCountUp(Number(data.totalTxCount) || 0)
  const blocksAnim = useCountUp(typeof blocks === 'number' ? blocks : null)
  const feesAnim = useCountUp(feesCredits)
  const rewardsAnim = useCountUp(rewards != null ? Number(rewards) : null)
  const votesAnim = useCountUp(Number(data.totalVotesCount) || 0)
  const docsAnim = useCountUp(created != null ? Number(created) : null)
  const delAnim = useCountUp(deleted != null ? Number(deleted) : null)
  const namesAnim = useCountUp(names != null ? Number(names) : null)
  const contestedAnim = useCountUp(contested != null ? Number(contested) : null)
  const proposerAnim = useScramble(data.bestValidator ? shortId(data.bestValidator) : null)

  return (
    <div className={'EpochsOverview__Cells HomeHero__StatusBar'}>
      <span className={'EpochsOverview__Wash'} aria-hidden={'true'} />
      <StatusCell label={'Transactions'} hint={transactionsHint(data)}>
        <span className={'EpochsOverview__Stat'}>
          <BigNumber>{txAnim}</BigNumber>
        </span>
      </StatusCell>

      <StatusCell label={'Blocks'} hint={blocksHint(epoch, endHeight, blocksLive ? blocks : null)}>
        {typeof blocksAnim === 'number' ? (
          <span className={'EpochsOverview__Stat'}>
            <BigNumber>{blocksAnim}</BigNumber>
          </span>
        ) : (
          <Pending />
        )}
      </StatusCell>

      <StatusCell label={'Fees'} hint={feesHint(data, rate)}>
        <span className={'EpochsOverview__Stat'}>
          {compact(typeof feesAnim === 'number' ? feesAnim : feesCredits) ?? 0}
        </span>
      </StatusCell>

      <StatusCell label={'Core rewards'} hint={rewardsHint(rewards, rate)}>
        {typeof rewardsAnim === 'number' ? (
          <span className={'EpochsOverview__Stat'}>{creditsToDash(rewardsAnim).toFixed(2)}</span>
        ) : (
          <Pending />
        )}
      </StatusCell>

      <StatusCell label={'Documents'} hint={documentsHint(created, deleted)}>
        {typeof docsAnim === 'number' ? (
          <span className={'EpochsOverview__Stat EpochsOverview__DocStat'}>
            <span className={'EpochsOverview__DocNew'}>+{compact(docsAnim)}</span>
            <span className={'EpochsOverview__DocDel'}>−{compact(delAnim ?? 0)}</span>
          </span>
        ) : (
          <Pending />
        )}
      </StatusCell>

      <StatusCell label={'Names'} hint={'DPNS names registered during this epoch.'}>
        {typeof namesAnim === 'number' ? (
          <span className={'EpochsOverview__Stat'}>
            <BigNumber>{namesAnim}</BigNumber>
          </span>
        ) : (
          <Pending />
        )}
      </StatusCell>

      <StatusCell
        label={'Contested'}
        hint={'Contested documents (e.g. premium names) opened for masternode voting this epoch.'}
      >
        {typeof contestedAnim === 'number' ? (
          <span className={'EpochsOverview__Stat'}>
            <BigNumber>{contestedAnim}</BigNumber>
          </span>
        ) : (
          <Pending />
        )}
      </StatusCell>

      <StatusCell label={'Votes'} hint={votesHint(data)}>
        <span className={'EpochsOverview__Stat'}>{votesAnim}</span>
      </StatusCell>

      <StatusCell
        label={'Block time'}
        hint={'Average time between blocks in this epoch (needs at least two blocks).'}
      >
        {avgMs != null ? (
          <span className={'EpochsOverview__Stat'}>{avgBlockTimeLabel(Number(avgMs))}</span>
        ) : (
          <Pending />
        )}
      </StatusCell>

      <StatusCell
        label={'Protocol'}
        hint={
          'Platform protocol version the epoch ran on (from its first block). Upgrades activate on epoch boundaries, so a version bump means node operators had to update.'
        }
      >
        <span className={'EpochsOverview__Stat'}>
          {typeof data.protocolVersion === 'number' ? `v${data.protocolVersion}` : '-'}
        </span>
      </StatusCell>

      <StatusCell
        label={
          <>
            <span className={'EpochsOverview__LabelFull'}>Top proposer</span>
            <span className={'EpochsOverview__LabelShort'}>Proposer</span>
          </>
        }
        hint={proposersHint(proposers)}
      >
        {data.bestValidator ? (
          <span className={'EpochsOverview__Stat EpochsOverview__ProposerVal'}>{proposerAnim}</span>
        ) : (
          <span className={'EpochsOverview__Stat'}>-</span>
        )}
      </StatusCell>
    </div>
  )
}

function deriveSlots(slotNumbers: any, currentEpoch: any, arrived: any) {
  if (Array.isArray(slotNumbers) && slotNumbers.length) return slotNumbers
  const cur = currentEpoch?.data?.epoch?.number
  if (typeof cur === 'number') {
    return [cur - 3, cur - 2, cur - 1, cur].filter(n => n >= 0)
  }
  if (arrived.length) {
    const max = Math.max(...arrived.map((e: any) => e.epoch.number))
    return [max - 3, max - 2, max - 1, max].filter(n => n >= 0)
  }
  return []
}

export function EpochsOverview({ title, epochs, currentEpoch, rate, loading, slotNumbers }: any) {
  const arrived = Array.isArray(epochs) ? epochs.filter(e => e?.epoch) : []
  const byNumber = new Map(arrived.map(e => [e.epoch.number, e]))
  const slots = deriveSlots(slotNumbers, currentEpoch, arrived)
  const lastIdx = Math.max(0, slots.length - 1)

  const [selected, setSelected] = useState(lastIdx)

  useEffect(() => {
    for (let i = slots.length - 1; i >= 0; i--) {
      if (byNumber.has(slots[i])) {
        setSelected(i)
        return
      }
    }
    setSelected(lastIdx)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- slots + arrived epoch numbers
  }, [slots.join(','), arrived.map(e => e.epoch.number).join(',')])

  if (!slots.length) {
    const ghostYs = [46, 40, 52, 44]
    const ghostPts = X_POSITIONS.map((gx, i) => ({ x: gx, y: ghostYs[i] ?? 46 }))
    const ghostLine = [
      { x: 0, y: ghostYs[0] },
      ...ghostPts,
      { x: 100, y: ghostYs[ghostPts.length - 1] }
    ]
    const ghostD = `M ${ghostLine.map(p => `${p.x} ${p.y}`).join(' L ')}`

    return (
      <div className={'EpochsOverview'} aria-label={title || 'Epochs'}>
        <header className={'EpochsOverview__Head'}>
          <div className={'EpochsOverview__HeadText'}>
            <span className={'EpochsOverview__Eyebrow'}>Time on Platform</span>
            <div className={'EpochsOverview__TitleRow'}>
              <h2 className={'EpochsOverview__Title'}>{title || 'Epochs'}</h2>
            </div>
            <p className={'EpochsOverview__Lede'}>
              Tap a point on the wave for that epoch&apos;s KPIs.
            </p>
          </div>
        </header>
        <div
          className={`HomeHero__Wave EpochsWave${loading ? ' EpochsWave--Skeleton' : ' EpochsWave--Empty'}`}
        >
          {loading ? (
            <>
              <svg
                className={'HomeHero__WaveSvg'}
                viewBox={'0 0 100 100'}
                preserveAspectRatio={'none'}
                aria-hidden={'true'}
              >
                <path
                  className={'EpochsWave__GhostLine'}
                  d={ghostD}
                  fill={'none'}
                  vectorEffect={'non-scaling-stroke'}
                />
                <path
                  className={'EpochsWave__GhostScan'}
                  d={ghostD}
                  fill={'none'}
                  pathLength={'100'}
                  vectorEffect={'non-scaling-stroke'}
                />
              </svg>
              {ghostPts.map(p => (
                <span
                  key={p.x}
                  className={'EpochsWave__GhostDot'}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  aria-hidden={'true'}
                />
              ))}
            </>
          ) : (
            'No epoch data'
          )}
        </div>
        <div className={'EpochsOverview__Detail'}>
          <div className={'EpochsOverview__Cells HomeHero__StatusBar'}>
            {Array.from({ length: 11 }).map((_, i) => (
              <div className={'HomeHero__StatusCell'} key={i}>
                <Skeleton w={'48px'} h={'0.6em'} />
                <Skeleton w={'64px'} h={'1.1em'} className={'EpochsOverview__SkelGap'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const knownTx = slots
    .map(n => byNumber.get(n))
    .filter(Boolean)
    .map(e => Number(e.totalTxCount) || 0)
  const tMin = knownTx.length ? Math.min(...knownTx) : 0
  const tMax = knownTx.length ? Math.max(...knownTx) : 1
  const midY = (Y_HIGH + Y_LOW) / 2
  const yOf = (v: any) => {
    if (!knownTx.length || tMax === tMin) return midY
    return Y_LOW - ((v - tMin) / (tMax - tMin)) * (Y_LOW - Y_HIGH)
  }

  const points = slots.map((num, i) => {
    const ep = byNumber.get(num)
    return {
      num,
      x: X_POSITIONS[i] ?? (i / Math.max(1, lastIdx)) * 100,
      y: ep ? yOf(Number(ep.totalTxCount) || 0) : midY,
      ep: ep || null,
      ready: !!ep
    }
  })

  const bounds = []
  for (let i = 1; i < points.length; i++) {
    const e = points[i].ep
    if (!e?.epoch?.firstBlockHeight) continue
    bounds.push({
      x: (points[i - 1].x + points[i].x) / 2,
      y: (points[i - 1].y + points[i].y) / 2,
      height: e.epoch.firstBlockHeight,
      ts: e.epoch.startTime,
      hash: e.firstBlockHash
    })
  }

  const firstReady = points.find(p => p.ready)
  if (firstReady?.ep?.epoch?.firstBlockHeight != null) {
    bounds.unshift({
      x: EDGE_L,
      y: points[0].y,
      height: firstReady.ep.epoch.firstBlockHeight,
      ts: firstReady.ep.epoch.startTime,
      hash: firstReady.ep.firstBlockHash,
      edge: 'l'
    })
  }

  const lastEntry = points[lastIdx]?.ep
  const prevEntry = points[lastIdx - 1]?.ep
  if (
    lastEntry?.epoch?.endTime > Date.now() &&
    lastEntry?.epoch?.firstBlockHeight != null &&
    prevEntry?.epoch?.firstBlockHeight != null
  ) {
    const prevSpan =
      Number(lastEntry.epoch.firstBlockHeight) - Number(prevEntry.epoch.firstBlockHeight)
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

  const longEpochs = arrived.some(e => e.epoch?.endTime - e.epoch?.startTime >= 86400000)
  const epochDuration = durationLabelOf(
    currentEpoch?.data?.epoch || points.filter(p => p.ready).at(-1)?.ep?.epoch
  )

  const segments = points.map((p, i) => {
    const l = i === 0 ? EDGE_L : (points[i - 1].x + p.x) / 2
    const r = i === lastIdx ? EDGE_R : (p.x + points[i + 1].x) / 2
    return { l: l / 100, w: (r - l) / 100 }
  })

  const linePts = [
    { x: 0, y: points[0].y },
    ...points.map(p => ({ x: p.x, y: p.y })),
    { x: 100, y: points[lastIdx].y }
  ]
  const lineD = `M ${linePts.map(p => `${p.x} ${p.y}`).join(' L ')}`
  const areaD = `M 0 100 L ${linePts.map(p => `${p.x} ${p.y}`).join(' L ')} L 100 100 Z`

  const selIdx = Math.min(Math.max(0, selected), lastIdx)
  const shown = points[selIdx]?.ep || points.filter(p => p.ready).at(-1)?.ep
  const nextShown = points[selIdx + 1]?.ep

  const seg = segments[selIdx] ?? { l: 0, w: 1 }
  const hasAny = points.some(p => p.ready)
  const { leftD, rightD, railDownD, railUpD } = hasAny
    ? buildScanParts(linePts, seg)
    : { leftD: null, rightD: null, railDownD: null, railUpD: null }

  const nextBound = bounds.find(b => b.approx)

  return (
    <div
      className={'EpochsOverview'}
      style={{ ['--epoch-seg-l']: seg.l, ['--epoch-seg-w']: seg.w } as CSSProperties}
      aria-label={title || 'Epochs'}
    >
      <header className={'EpochsOverview__Head'}>
        <div className={'EpochsOverview__HeadText'}>
          <span className={'EpochsOverview__Eyebrow'}>Time on Platform</span>
          <div className={'EpochsOverview__TitleRow'}>
            <h2 className={'EpochsOverview__Title'}>{title || 'Epochs'}</h2>
            {epochDuration && (
              <span
                className={'EpochsOverview__LedeMark'}
                title={'Typical epoch length on this network'}
              >
                every {epochDuration}
              </span>
            )}
          </div>
          <p className={'EpochsOverview__Lede'}>
            Tap a point on the wave for that epoch&apos;s KPIs.
          </p>
        </div>
        {nextBound && <NextEpochCard bound={nextBound} />}
      </header>
      <div className={`HomeHero__Wave EpochsWave${hasAny ? '' : ' EpochsWave--Skeleton'}`}>
        <svg
          className={'HomeHero__WaveSvg'}
          viewBox={'0 0 100 100'}
          preserveAspectRatio={'none'}
          aria-hidden={'true'}
        >
          <defs>
            <linearGradient id={'homeEpochFill'} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
              <stop
                offset={'0%'}
                stopColor={'var(--pe-color-brand-normal)'}
                stopOpacity={'0.28'}
              />
              <stop
                offset={'100%'}
                stopColor={'var(--pe-color-brand-normal)'}
                stopOpacity={'0'}
              />
            </linearGradient>
            <linearGradient
              id={'homeEpochFadeGrad'}
              x1={'0'}
              y1={'0'}
              x2={'0'}
              y2={'100'}
              gradientUnits={'userSpaceOnUse'}
            >
              <stop offset={'0%'} stopColor={'#fff'} />
              <stop offset={'50%'} stopColor={'#fff'} />
              <stop offset={'100%'} stopColor={'#000'} />
            </linearGradient>
            <mask
              id={'homeEpochFade'}
              maskUnits={'userSpaceOnUse'}
              x={'0'}
              y={'0'}
              width={'100'}
              height={'100'}
            >
              <rect x={'0'} y={'0'} width={'100'} height={'100'} fill={'url(#homeEpochFadeGrad)'} />
            </mask>
          </defs>
          {hasAny ? (
            <>
              <path
                className={'EpochsWave__Area'}
                d={areaD}
                fill={'url(#homeEpochFill)'}
                mask={'url(#homeEpochFade)'}
                stroke={'none'}
              />
              <path
                className={'HomeHero__WaveLine EpochsWave__Line'}
                d={lineD}
                fill={'none'}
                vectorEffect={'non-scaling-stroke'}
              />
              {leftD && (
                <>
                  <path
                    className={'HomeHero__WaveScanGlow'}
                    d={leftD}
                    fill={'none'}
                    pathLength={'100'}
                    vectorEffect={'non-scaling-stroke'}
                  />
                  <path
                    className={'HomeHero__WaveScan'}
                    d={leftD}
                    fill={'none'}
                    pathLength={'100'}
                    vectorEffect={'non-scaling-stroke'}
                  />
                </>
              )}
              {rightD && (
                <>
                  <path
                    className={'HomeHero__WaveScanGlow HomeHero__WaveScan--Phase'}
                    d={rightD}
                    fill={'none'}
                    pathLength={'100'}
                    vectorEffect={'non-scaling-stroke'}
                  />
                  <path
                    className={'HomeHero__WaveScan HomeHero__WaveScan--Phase'}
                    d={rightD}
                    fill={'none'}
                    pathLength={'100'}
                    vectorEffect={'non-scaling-stroke'}
                  />
                </>
              )}
              {railDownD && (
                <>
                  <path
                    className={
                      'HomeHero__WaveScanGlow EpochsWave__RailScan EpochsWave__RailScan--Down'
                    }
                    d={railDownD}
                    fill={'none'}
                    pathLength={'100'}
                    vectorEffect={'non-scaling-stroke'}
                  />
                  <path
                    className={'HomeHero__WaveScan EpochsWave__RailScan EpochsWave__RailScan--Down'}
                    d={railDownD}
                    fill={'none'}
                    pathLength={'100'}
                    vectorEffect={'non-scaling-stroke'}
                  />
                </>
              )}
              {railUpD && (
                <>
                  <path
                    className={
                      'HomeHero__WaveScanGlow EpochsWave__RailScan EpochsWave__RailScan--Up'
                    }
                    d={railUpD}
                    fill={'none'}
                    pathLength={'100'}
                    vectorEffect={'non-scaling-stroke'}
                  />
                  <path
                    className={'HomeHero__WaveScan EpochsWave__RailScan EpochsWave__RailScan--Up'}
                    d={railUpD}
                    fill={'none'}
                    pathLength={'100'}
                    vectorEffect={'non-scaling-stroke'}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <path
                className={'EpochsWave__GhostLine'}
                d={lineD}
                fill={'none'}
                vectorEffect={'non-scaling-stroke'}
              />
              <path
                className={'EpochsWave__GhostScan'}
                d={lineD}
                fill={'none'}
                pathLength={'100'}
                vectorEffect={'non-scaling-stroke'}
              />
            </>
          )}
        </svg>

        {hasAny &&
          bounds
            .filter(b => !b.approx)
            .map(b => (
              <EpochBound
                key={`${b.edge || 'mid'}-${b.height}`}
                bound={b}
                longEpochs={longEpochs}
              />
            ))}

        {hasAny && (
          <span
            className={'EpochsWave__Beam'}
            style={{
              left: `${seg.l * 100}%`,
              width: `${seg.w * 100}%`,
              top: `${points[selIdx]?.y ?? 50}%`
            }}
            aria-hidden={'true'}
          />
        )}

        {points.map((p, i) =>
          p.ready ? (
            <EpochPoint
              key={p.num}
              epoch={p.ep.epoch}
              metricLabel={`${compact(Number(p.ep.totalTxCount) || 0)} tx`}
              x={p.x}
              y={p.y}
              selected={i === selIdx}
              onSelect={() => setSelected(i)}
            />
          ) : (
            <span
              key={`ghost-${p.num}`}
              className={'EpochsWave__GhostDot EpochsWave__GhostDot--slot'}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              aria-hidden={'true'}
            />
          )
        )}
      </div>

      <div className={'EpochsOverview__Detail'}>
        {shown ? (
          <EpochCells data={shown} nextData={nextShown} rate={rate} />
        ) : (
          <div className={'EpochsOverview__Cells HomeHero__StatusBar'}>
            {Array.from({ length: 11 }).map((_, i) => (
              <div className={'HomeHero__StatusCell'} key={i}>
                <Skeleton w={'48px'} h={'0.6em'} />
                <Skeleton w={'64px'} h={'1.1em'} className={'EpochsOverview__SkelGap'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
