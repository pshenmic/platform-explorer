'use client'

import { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { CardHead, Presets } from '../cards'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'
import { Skeleton } from './Skeleton'
import { compact } from './utils'
import { PRESETS, presetRange } from './MetricChart'
import './TxTypesBar.scss'

// a sub-percent slice would collapse below the segment gap: clamp for display, chips keep exact counts
const MIN_SEG_FRAC = 0.008

function labelOf (type) {
  return TransactionTypesInfo[type]?.title ?? type
}

// tx counts by state transition type for a chosen time range: one stacked share bar over chips
export default function TxTypesBar ({ enabled = true }) {
  const [state, setState] = useState({ loading: true, error: false, items: [] })
  // default to "All" so the initial view stays the familiar all-time distribution
  const [presetIdx, setPresetIdx] = useState(PRESETS.length - 1)

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    setState(s => ({ ...s, loading: true, error: false }))
    const { start, end } = presetRange(PRESETS[presetIdx])
    Api.getTransactionsStatistic(start, end)
      .then(res => setState({ loading: false, error: false, items: Array.isArray(res) ? res : [] }))
      .catch(() => setState({ loading: false, error: true, items: [] }))
  }, [enabled, presetIdx])

  const preset = PRESETS[presetIdx]
  const rangeLabel = preset.label === 'All' ? 'all time' : preset.label

  const sorted = [...state.items]
    .filter(t => (t.count || 0) > 0)
    .sort((a, b) => (b.count || 0) - (a.count || 0))
  const total = sorted.reduce((sum, t) => sum + (t.count || 0), 0)

  // display shares are clamped and renormalized so slivers stay visible and the bar still closes
  const rawFracs = sorted.map(t => (total > 0 ? (t.count || 0) / total : 0))
  const clamped = rawFracs.map(f => (f > 0 ? Math.max(f, MIN_SEG_FRAC) : 0))
  const clampedSum = clamped.reduce((sum, f) => sum + f, 0) || 1
  const segments = sorted.map((t, i) => ({
    label: labelOf(t.transactionType),
    count: t.count || 0,
    frac: rawFracs[i],
    dFrac: clamped[i] / clampedSum,
    // per-type shade of the badge family hue keeps segments tellable yet on-brand
    cls: TransactionTypesInfo[t.transactionType] ? t.transactionType : 'UNKNOWN'
  }))

  const pctOf = frac => (frac < 0.01 ? '<1%' : `${Math.round(frac * 100)}%`)
  const tipOf = s => `${s.label} · ${s.count.toLocaleString('en-US')} · ${pctOf(s.frac)}`

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder TxTypesBar'} w={'100%'}>
      <CardHead
        title={'Transaction types'}
        extra={total > 0 &&
          <span className={'TxTypesBar__Total'}>
            {total.toLocaleString('en-US')} <span className={'TxTypesBar__TotalLabel'}>{rangeLabel}</span>
          </span>}
      >
        <Presets options={PRESETS} value={presetIdx} onChange={setPresetIdx}/>
      </CardHead>

      <div className={'TxTypesBar__Body'}>
        {state.loading
          ? <div className={'TxTypesBar__Stack'}>
              <Skeleton w={'100%'} h={'14px'}/>
              <div className={'TxTypesBar__Chips'}>
                {Array.from({ length: 8 }).map((_, i) => <Skeleton w={'110px'} h={'0.75em'} key={i}/>)}
              </div>
            </div>
          : state.error || !total
            ? <div className={'TxTypesBar__Empty'}>No data</div>
            : <div className={'TxTypesBar__Stack'}>
                <div className={'TxTypesBar__Bar'} role={'img'} aria-label={`${total} transactions by type`}>
                  {segments.map(s => (
                    <Tooltip content={tipOf(s)} placement={'top'} key={s.label}>
                      <span
                        className={`TxTypesBar__Seg TxTypesBar__Seg--${s.cls}`}
                        style={{ width: `${s.dFrac * 100}%` }}
                      />
                    </Tooltip>
                  ))}
                </div>

                <div className={'TxTypesBar__Chips'}>
                  {segments.map(s => (
                    <Tooltip content={tipOf(s)} placement={'top'} key={s.label}>
                      <span className={'TxTypesBar__Chip'}>
                        <i className={`TxTypesBar__Dot TxTypesBar__Dot--${s.cls}`}/>
                        <span className={'TxTypesBar__ChipLabel'}>{s.label}</span>
                        <span className={'TxTypesBar__ChipCount'}>{compact(s.count)}</span>
                      </span>
                    </Tooltip>
                  ))}
                </div>
              </div>}
      </div>
    </Box>
  )
}
