'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { Presets } from '../cards'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { BatchActions } from '../../enums/batchTypes'
import { Skeleton } from './Skeleton'
import { Tooltip } from '../ui/Tooltips'
import { transactionsListHref } from '../transactions/transactionsListHref'
import { formatFullNumber } from '../../util'
import { PRESETS, presetRange } from './MetricChart'
import './TxTypesBar.css'

const MIN_SEG_FRAC = 0.008

function labelOf(type: any) {
  if ((BatchActions as any)[type]?.title) return (BatchActions as any)[type].title
  return (TransactionTypesInfo as any)[type]?.title ?? type
}

function clsOf(type: any) {
  if ((BatchActions as any)[type]) return type
  if ((TransactionTypesInfo as any)[type]) return type
  return 'UNKNOWN'
}

/** Expand BATCH.batchTypes when present; otherwise keep the BATCH row. */
function flattenStatisticItems(items: any) {
  const flat = []
  for (const t of items || []) {
    const count = t.count || 0
    if (count <= 0) continue
    const kind = t.transactionType || 'UNKNOWN'
    if (kind === 'BATCH' && Array.isArray(t.batchTypes) && t.batchTypes.length > 0) {
      for (const bt of t.batchTypes) {
        const n = bt.count || 0
        if (n <= 0) continue
        flat.push({ type: bt.batchType || 'UNKNOWN', count: n, fromBatch: true })
      }
      continue
    }
    flat.push({ type: kind, count, fromBatch: false })
  }
  return flat
}

export default function TxTypesBar({ enabled = true }) {
  const [state, setState] = useState<{ loading: boolean; error: boolean; items: any[] }>({
    loading: true,
    error: false,
    items: []
  })
  const [presetIdx, setPresetIdx] = useState(PRESETS.length - 1)
  const [pin, setPin] = useState<any>(null)
  const [hover, setHover] = useState<any>(null)

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    setState(s => ({ ...s, loading: true, error: false }))
    setPin(null)
    setHover(null)
    const { start, end } = presetRange(PRESETS[presetIdx])
    Api.getTransactionsStatistic(start, end)
      .then(res => setState({ loading: false, error: false, items: Array.isArray(res) ? res : [] }))
      .catch(() => setState({ loading: false, error: true, items: [] }))
  }, [enabled, presetIdx])

  const preset = PRESETS[presetIdx]
  const rangeLabel = preset.label === 'All' ? 'all time' : preset.label

  const segments = useMemo(() => {
    const flat = flattenStatisticItems(state.items).sort((a, b) => b.count - a.count)
    const total = flat.reduce((sum, t) => sum + t.count, 0)
    const rawFracs = flat.map(t => (total > 0 ? t.count / total : 0))
    const clamped = rawFracs.map(f => (f > 0 ? Math.max(f, MIN_SEG_FRAC) : 0))
    const clampedSum = clamped.reduce((sum, f) => sum + f, 0) || 1
    return flat.map((t, i) => ({
      type: t.type,
      label: labelOf(t.type),
      count: t.count,
      frac: rawFracs[i],
      dFrac: clamped[i] / clampedSum,
      cls: clsOf(t.type),
      rank: i + 1,
      fromBatch: t.fromBatch
    }))
  }, [state.items])

  const total = segments.reduce((sum, s) => sum + s.count, 0)
  // pin beats hover so the header number stays stable while inspecting a type
  const focusType = pin || hover
  const focused = focusType ? segments.find(s => s.type === focusType) : null

  const rangeTotal = state.loading
    ? '—'
    : focused
      ? focused.count.toLocaleString('en-US')
      : total.toLocaleString('en-US')
  const statMeta = focused ? focused.label : state.error ? '' : rangeLabel

  const togglePin = (type: any) => {
    setPin((p: any) => (p === type ? null : type))
  }

  const focusHandlers = (type: any) => ({
    onMouseEnter: () => setHover(type),
    onMouseLeave: () => setHover((h: any) => (h === type ? null : h)),
    onFocus: () => setHover(type),
    onBlur: () => setHover((h: any) => (h === type ? null : h))
  })

  return (
    <Box className={'TxTypesBar'} w={'100%'} h={'100%'} as={'section'} aria-label={'Transaction'}>
      <header className={'TxTypesBar__Head'}>
        <div className={'TxTypesBar__HeadText'}>
          <span className={'TxTypesBar__Eyebrow'}>Network mix</span>
          <h2 className={'TxTypesBar__Title'}>Transaction</h2>
          <p className={'TxTypesBar__Lede'}>
            Who is joining, writing data, or moving credits
            <br />
            and using{' '}
            <Tooltip
              placement={'top'}
              content={
                <div className={'TxTypesBar__HelpTip'}>
                  <p>
                    Use this mix to see what Platform is for right now: new people, app data,
                    tokens, credit flows, votes, and privacy.
                  </p>
                  <p className={'TxTypesBar__HelpFoot'}>
                    Pick a type to see its count. A document or token row is one write on chain, not
                    a raw batch dump.
                  </p>
                </div>
              }
            >
              <span className={'TxTypesBar__LedeMore'}>tokens</span>
            </Tooltip>
            .
          </p>
        </div>
        <div className={'TxTypesBar__Controls'}>
          <Presets options={PRESETS} value={presetIdx} onChange={setPresetIdx} />
          <div className={`TxTypesBar__Stat${focused ? ' is-on' : ''}${pin ? ' is-pinned' : ''}`}>
            <div className={'TxTypesBar__StatMain'}>
              <span className={'TxTypesBar__StatCount'}>{rangeTotal}</span>
              <span className={'TxTypesBar__StatUnit'}>txs</span>
            </div>
            {statMeta && <span className={'TxTypesBar__StatMeta'}>{statMeta}</span>}
          </div>
        </div>
      </header>

      <div className={'TxTypesBar__Body'}>
        {state.loading ? (
          <div className={'TxTypesBar__Stack'}>
            <Skeleton w={'100%'} h={'18px'} radius={9} />
            <div className={'TxTypesBar__Rows'}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton w={'100%'} h={'2.25rem'} key={i} />
              ))}
            </div>
          </div>
        ) : state.error || !total ? (
          <div className={'TxTypesBar__Empty'}>No data</div>
        ) : (
          <div
            className={`TxTypesBar__Stack${pin ? ' is-pinned' : ''}`}
            data-focus={focusType || undefined}
            onMouseLeave={() => {
              if (!pin) setHover(null)
            }}
          >
            <div
              className={'TxTypesBar__Bar'}
              role={'group'}
              aria-label={`${total} transactions by type`}
            >
              {segments.map(s => (
                <Link
                  key={s.type}
                  href={transactionsListHref({ type: s.type, fromBatch: s.fromBatch })}
                  data-type={s.type}
                  className={`TxTypesBar__Seg TxTypesBar__Seg--${s.cls}${focusType === s.type ? ' is-focus' : ''}`}
                  style={{ flexGrow: s.dFrac, flexBasis: 0 }}
                  title={`${s.label}: ${s.count.toLocaleString('en-US')}`}
                  aria-label={`${s.label}, open filtered transactions`}
                  {...focusHandlers(s.type)}
                />
              ))}
            </div>

            <div className={'TxTypesBar__Rows'} role={'group'} aria-label={'Transaction types'}>
              {segments.map(s => (
                <button
                  key={s.type}
                  type={'button'}
                  data-type={s.type}
                  className={`TxTypesBar__Row${focusType === s.type ? ' is-focus' : ''}`}
                  title={`${s.label}: ${s.count.toLocaleString('en-US')}`}
                  onClick={() => togglePin(s.type)}
                  aria-pressed={pin === s.type}
                  {...focusHandlers(s.type)}
                >
                  <span className={'TxTypesBar__Rank'}>{s.rank}</span>
                  <span className={`TxTypesBar__Dot TxTypesBar__Dot--${s.cls}`} />
                  <Link
                    href={transactionsListHref({ type: s.type, fromBatch: s.fromBatch })}
                    className={'TxTypesBar__RowLabel TxTypesBar__RowLabelLink'}
                    onClick={e => e.stopPropagation()}
                  >
                    {s.label}
                  </Link>
                  <span className={'TxTypesBar__Meter'} aria-hidden={'true'}>
                    <i
                      className={`TxTypesBar__MeterFill TxTypesBar__Seg--${s.cls}`}
                      style={{ width: `${Math.max(s.frac * 100, 1.5)}%` }}
                    />
                  </span>
                  <span className={'TxTypesBar__RowCount'}>{formatFullNumber(s.count) as any}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Box>
  )
}
