'use client'

import { useState, useEffect, useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { Presets } from '../cards'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { Skeleton } from './Skeleton'
import { compact } from './utils'
import { PRESETS, presetRange } from './MetricChart'
import './TxTypesBar.scss'

const MIN_SEG_FRAC = 0.008

function labelOf (type) {
  if (type === 'BATCH') return 'Batch · docs & tokens'
  return TransactionTypesInfo[type]?.title ?? type
}

function pctOf (frac) {
  if (frac <= 0) return '0%'
  if (frac < 0.01) return '<1%'
  return `${Math.round(frac * 100)}%`
}

export default function TxTypesBar ({ enabled = true }) {
  const [state, setState] = useState({ loading: true, error: false, items: [] })
  const [presetIdx, setPresetIdx] = useState(PRESETS.length - 1)
  const [pin, setPin] = useState(null)

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    setState(s => ({ ...s, loading: true, error: false }))
    setPin(null)
    const { start, end } = presetRange(PRESETS[presetIdx])
    Api.getTransactionsStatistic(start, end)
      .then(res => setState({ loading: false, error: false, items: Array.isArray(res) ? res : [] }))
      .catch(() => setState({ loading: false, error: true, items: [] }))
  }, [enabled, presetIdx])

  const preset = PRESETS[presetIdx]
  const rangeLabel = preset.label === 'All' ? 'all time' : preset.label

  const segments = useMemo(() => {
    const sorted = [...state.items]
      .filter(t => (t.count || 0) > 0)
      .sort((a, b) => (b.count || 0) - (a.count || 0))
    const total = sorted.reduce((sum, t) => sum + (t.count || 0), 0)
    const rawFracs = sorted.map(t => (total > 0 ? (t.count || 0) / total : 0))
    const clamped = rawFracs.map(f => (f > 0 ? Math.max(f, MIN_SEG_FRAC) : 0))
    const clampedSum = clamped.reduce((sum, f) => sum + f, 0) || 1
    return sorted.map((t, i) => ({
      type: t.transactionType || 'UNKNOWN',
      label: labelOf(t.transactionType),
      count: t.count || 0,
      frac: rawFracs[i],
      dFrac: clamped[i] / clampedSum,
      cls: TransactionTypesInfo[t.transactionType] ? t.transactionType : 'UNKNOWN',
      rank: i + 1
    }))
  }, [state.items])

  const total = segments.reduce((sum, s) => sum + s.count, 0)
  const pinned = pin ? segments.find(s => s.type === pin) : null

  const togglePin = (type) => {
    setPin(p => (p === type ? null : type))
  }

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder TxTypesBar'} w={'100%'} as={'section'} aria-label={'Transaction types'}>
      <header className={'TxTypesBar__Head'}>
        <div className={'TxTypesBar__HeadText'}>
          <span className={'TxTypesBar__Eyebrow'}>Network mix</span>
          <h2 className={'TxTypesBar__Title'}>Transaction types</h2>
          <p className={'TxTypesBar__Lede'}>
            Share of state transitions. Batch is large because most document and token actions ride inside it.
          </p>
        </div>
        <Presets options={PRESETS} value={presetIdx} onChange={setPresetIdx}/>
      </header>

      <div className={'TxTypesBar__Body'}>
        {state.loading
          ? <div className={'TxTypesBar__Stack'}>
              <Skeleton w={'12ch'} h={'2em'}/>
              <Skeleton w={'100%'} h={'18px'} radius={9}/>
              <div className={'TxTypesBar__Rows'}>
                {Array.from({ length: 6 }).map((_, i) => <Skeleton w={'100%'} h={'2.25rem'} key={i}/>)}
              </div>
            </div>
          : state.error || !total
            ? <div className={'TxTypesBar__Empty'}>No data</div>
            : <div
                className={`TxTypesBar__Stack${pin ? ' is-pinned' : ''}`}
                data-pin={pin || undefined}
              >
                <div className={'TxTypesBar__Hero'}>
                  <div className={'TxTypesBar__HeroMain'}>
                    <span className={'TxTypesBar__HeroCount'}>{total.toLocaleString('en-US')}</span>
                    <span className={'TxTypesBar__HeroUnit'}>txs · {rangeLabel}</span>
                  </div>
                  <div className={`TxTypesBar__Focus${pinned ? ' is-on' : ''}`}>
                    <span
                      className={`TxTypesBar__FocusDot${pinned ? ` TxTypesBar__Seg--${pinned.cls}` : ' is-idle'}`}
                      aria-hidden={'true'}
                    />
                    <div className={'TxTypesBar__FocusCopy'}>
                      <span className={'TxTypesBar__FocusLabel'}>
                        {pinned ? pinned.label : 'Click a type to pin'}
                      </span>
                      <span className={'TxTypesBar__FocusMeta'}>
                        {pinned
                          ? `${pinned.count.toLocaleString('en-US')} · ${pctOf(pinned.frac)}`
                          : `${segments.length} types · hover to compare`}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={'TxTypesBar__Bar'}
                  role={'list'}
                  aria-label={`${total} transactions by type`}
                >
                  {segments.map(s => (
                    <button
                      key={s.type}
                      type={'button'}
                      role={'listitem'}
                      data-type={s.type}
                      className={`TxTypesBar__Seg TxTypesBar__Seg--${s.cls}`}
                      style={{ flexGrow: s.dFrac, flexBasis: 0 }}
                      title={`${s.label}: ${s.count.toLocaleString('en-US')} (${pctOf(s.frac)})`}
                      onClick={() => togglePin(s.type)}
                      aria-pressed={pin === s.type}
                      aria-label={s.label}
                    />
                  ))}
                </div>

                <div className={'TxTypesBar__Rows'} role={'list'}>
                  {segments.map(s => (
                    <button
                      key={s.type}
                      type={'button'}
                      role={'listitem'}
                      data-type={s.type}
                      className={'TxTypesBar__Row'}
                      title={`${s.label}: ${s.count.toLocaleString('en-US')} (${pctOf(s.frac)})`}
                      onClick={() => togglePin(s.type)}
                      aria-pressed={pin === s.type}
                    >
                      <span className={'TxTypesBar__Rank'}>{s.rank}</span>
                      <span className={`TxTypesBar__Dot TxTypesBar__Dot--${s.cls}`}/>
                      <span className={'TxTypesBar__RowLabel'}>{s.label}</span>
                      <span className={'TxTypesBar__Meter'} aria-hidden={'true'}>
                        <i
                          className={`TxTypesBar__MeterFill TxTypesBar__Seg--${s.cls}`}
                          style={{ width: `${Math.max(s.frac * 100, 1.5)}%` }}
                        />
                      </span>
                      <span className={'TxTypesBar__RowCount'}>{compact(s.count)}</span>
                      <span className={'TxTypesBar__RowPct'}>{pctOf(s.frac)}</span>
                    </button>
                  ))}
                </div>
              </div>}
      </div>
    </Box>
  )
}
