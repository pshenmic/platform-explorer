'use client'

import { Tooltip } from '../ui/Tooltips'
import { useCountUp } from './hooks'

const METRICS = [
  { key: 'transactions', label: 'Transactions', field: 'transactionsCount', hint: 'Total state transitions processed across the network.' },
  { key: 'dataContracts', label: 'Data Contracts', field: 'dataContractsCount', hint: 'Total registered data contracts (app schemas).' },
  { key: 'documents', label: 'Documents', field: 'documentsCount', hint: 'Total documents across all data contracts.' },
  { key: 'identities', label: 'Identities', field: 'identitiesCount', hint: 'Total registered identities on the platform.' }
]

// 0..100 viewBox vertices: start (under subhead) → 4 metric waves → end (under live meta)
const WAVE_POINTS = [
  { x: 0, y: 62 },
  { x: 23, y: 20, metric: 0 },
  { x: 44, y: 52, metric: 1 },
  { x: 64, y: 26, metric: 2 },
  { x: 83, y: 56, metric: 3 },
  { x: 100, y: 40 }
]

const WAVE_LINE_D = `M ${WAVE_POINTS.map(p => `${p.x} ${p.y}`).join(' L ')}`
const WAVE_AREA_D = `M ${WAVE_POINTS[0].x} 100 L ${WAVE_POINTS.map(p => `${p.x} ${p.y}`).join(' L ')} L ${WAVE_POINTS[WAVE_POINTS.length - 1].x} 100 Z`

function MetricPoint ({ node, value, x, y }) {
  const animated = useCountUp(typeof value === 'number' ? value : null)
  const display = typeof animated === 'number' ? animated.toLocaleString('en-US') : (animated ?? '-')

  return (
    <Tooltip title={node.label} content={node.hint} placement={'top'}>
      <span className={'HomeHero__WavePoint'} style={{ left: `${x}%`, top: `${y}%` }} tabIndex={0}>
        <span className={'HomeHero__WaveValue'}>{display}</span>
        <span className={'HomeHero__WaveDot'} aria-hidden={'true'}/>
        <span className={'HomeHero__WaveLabel'}>{node.label}</span>
      </span>
    </Tooltip>
  )
}

// Trading-style line under the subhead with the 4 metrics as hoverable points.
export function MetricWave ({ status }) {
  return (
    <div className={'HomeHero__Wave'}>
      <svg className={'HomeHero__WaveSvg'} viewBox={'0 0 100 100'} preserveAspectRatio={'none'} aria-hidden={'true'}>
        <defs>
          <linearGradient id={'homeWaveFill'} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
            <stop offset={'0%'} stopColor={'rgba(0, 141, 228, 0.28)'}/>
            <stop offset={'100%'} stopColor={'rgba(0, 141, 228, 0)'}/>
          </linearGradient>
        </defs>
        <path d={WAVE_AREA_D} fill={'url(#homeWaveFill)'} stroke={'none'}/>
        <path className={'HomeHero__WaveLine'} d={WAVE_LINE_D} fill={'none'} vectorEffect={'non-scaling-stroke'}/>
        <path className={'HomeHero__WaveScan'} d={WAVE_LINE_D} fill={'none'} pathLength={'100'} vectorEffect={'non-scaling-stroke'}/>
      </svg>
      {WAVE_POINTS.filter(p => p.metric !== undefined).map(p => {
        const node = METRICS[p.metric]
        return <MetricPoint key={node.key} node={node} value={status?.[node.field]} x={p.x} y={p.y}/>
      })}
    </div>
  )
}
