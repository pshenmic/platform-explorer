'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Box } from '@chakra-ui/react'
import { Skeleton } from './Skeleton'
import { Tooltip } from '../ui/Tooltips'
import './MasternodesDonut.scss'

const MAX_CELLS = 324

const regionNames = (() => {
  try { return new Intl.DisplayNames(['en'], { type: 'region' }) } catch { return null }
})()

function countryName (cc) {
  try { return regionNames?.of(cc) || cc } catch { return cc }
}

function shortHash (h, head = 4, tail = 4) {
  if (!h || typeof h !== 'string') return '—'
  if (h.length <= head + tail + 1) return h
  return `${h.slice(0, head)}…${h.slice(-tail)}`
}

function parseHealth (raw) {
  if (raw == null || raw === '') return null
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) ? n : null
}

function parseLlmqType (type) {
  if (!type || typeof type !== 'string') return null
  const m = type.match(/llmq_(\d+)_(\d+)/i)
  if (!m) return { raw: type, size: null, threshold: null }
  return { raw: type, size: Number(m[1]), threshold: Number(m[2]) }
}

function healthTone (ratio) {
  if (ratio == null) return 'unknown'
  if (ratio > 0.75) return 'good'
  if (ratio > 0.5) return 'warn'
  if (ratio > 0.25) return 'bad'
  return 'critical'
}

function healthLabel (ratio) {
  if (ratio == null) return '—'
  return `${Math.round(ratio * 100)}%`
}

function memberKey (proTx) {
  return (proTx || '').toLowerCase()
}

const STATS = [
  {
    key: 'total',
    label: 'Total',
    hint: 'All Platform validators (evonodes) tracked on the network.'
  },
  {
    key: 'active',
    label: 'In quorum',
    hint: 'In the current Platform signing set right now.'
  },
  {
    key: 'inactive',
    label: 'Queued',
    hint: 'Not active and not banned. Gray with a blue ring means joining the next set.'
  },
  {
    key: 'banned',
    label: 'Banned',
    hint: 'Not in the registered unbanned set (PoSe ban or left the masternode list).'
  }
]

function buildProportionalCells (active, queued, banned, total) {
  const n = Math.min(Math.max(0, total | 0), MAX_CELLS)
  if (n <= 0) return []

  const raw = [
    { type: 'active', n: Math.max(0, active | 0) },
    { type: 'inactive', n: Math.max(0, queued | 0) },
    { type: 'banned', n: Math.max(0, banned | 0) }
  ]
  const sum = raw.reduce((s, p) => s + p.n, 0)

  let alloc = raw.map(p => p.n)

  if (sum > n) {
    alloc = raw.map(p => (p.n > 0 ? Math.max(1, Math.floor((p.n / sum) * n)) : 0))
    let used = alloc.reduce((s, v) => s + v, 0)
    while (used > n) {
      let i = 0
      for (let j = 1; j < alloc.length; j++) {
        if (alloc[j] > alloc[i]) i = j
      }
      if (alloc[i] <= 1) break
      alloc[i]--
      used--
    }
    let rem = n - used
    const order = raw
      .map((p, i) => ({ i, n: p.n }))
      .filter(p => p.n > 0)
      .sort((a, b) => b.n - a.n)
    let k = 0
    while (rem > 0 && order.length) {
      alloc[order[k % order.length].i]++
      rem--
      k++
    }
  }

  const cells = []
  for (let i = 0; i < alloc[0]; i++) cells.push({ kind: 'abstract', type: 'active', index: i })
  for (let i = 0; i < alloc[1]; i++) cells.push({ kind: 'abstract', type: 'inactive', index: i })
  for (let i = 0; i < alloc[2]; i++) cells.push({ kind: 'abstract', type: 'banned', index: i })
  while (cells.length < n) cells.push({ kind: 'abstract', type: 'idle', index: cells.length })
  return cells
}

function matrixCols (count) {
  if (count <= 0) return 1
  if (count <= 36) return Math.max(6, Math.ceil(Math.sqrt(count)))
  if (count <= 100) return Math.max(8, Math.ceil(Math.sqrt(count)))
  return Math.max(10, Math.ceil(Math.sqrt(count)))
}

function isPoSeBannedValidator (v) {
  const ban = v?.proTxInfo?.state?.PoSeBanHeight
  return typeof ban === 'number' && ban >= 0
}

function buildPoolCells ({ list, currentSet, nextSet, memberMeta, bannedSet }) {
  if (!Array.isArray(list) || list.length === 0) return []

  const cells = list.slice(0, MAX_CELLS).map((v, index) => {
    const key = memberKey(v.proTxHash)
    const banned = bannedSet?.size
      ? bannedSet.has(key)
      : isPoSeBannedValidator(v)
    const inCurrent = currentSet?.has(key)
    const inNext = nextSet?.has(key)
    const meta = memberMeta?.get(key)

    let type = 'inactive'
    let role = 'queued'

    if (banned) {
      type = 'banned'
      role = 'banned'
    } else if (inCurrent) {
      if (meta?.valid === false) {
        type = 'invalid'
        role = 'invalid'
      } else if (nextSet?.size && !inNext) {
        type = 'leave'
        role = 'leave'
      } else {
        type = 'active'
        role = 'current'
      }
    } else if (inNext) {
      type = 'join'
      role = 'join'
    } else if (v.isActive && !currentSet) {
      type = 'active'
      role = 'active'
    }

    return {
      kind: 'node',
      index,
      type,
      role,
      proTxHash: v.proTxHash,
      service: meta?.service || v?.proTxInfo?.state?.service || v?.endpoints?.[0] || null,
      valid: meta ? meta.valid !== false : true,
      validator: v
    }
  })

  const rank = { active: 0, leave: 1, join: 2, invalid: 3, inactive: 4, banned: 5, idle: 6 }
  cells.sort((a, b) => (rank[a.type] ?? 9) - (rank[b.type] ?? 9))
  return cells
}

function NodeTooltipBody ({ cell }) {
  const v = cell.validator
  const status = (() => {
    if (cell.role === 'banned') {
      return isPoSeBannedValidator(cell.validator)
        ? 'Banned (PoSe)'
        : 'Banned / not in registered set'
    }
    if (cell.role === 'invalid') return 'In current quorum · invalid'
    if (cell.role === 'leave') return 'Leaving next · still in current set'
    if (cell.role === 'current' || cell.role === 'active') return 'In current signing set'
    if (cell.role === 'join') return 'Queued now · joining the next signing set'
    return 'Queued · not in the current signing set'
  })()

  const cc = v?.geoIpInfo?.countryCode
  const ccName = cc ? countryName(cc) : null
  const proposed = v?.proposedBlocksAmount

  return (
    <div className={'MasternodesDonut__Tip'}>
      <div className={'MasternodesDonut__TipHead'}>
        {cc &&
          <img
            className={'MasternodesDonut__TipFlag'}
            src={`/flags/circle/${cc.toLowerCase()}.svg`}
            alt={''}
            width={22}
            height={22}
            loading={'lazy'}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />}
        <div className={'MasternodesDonut__TipHeadText'}>
          <div className={'MasternodesDonut__TipStatus'}>{status}</div>
          {ccName &&
            <div className={'MasternodesDonut__TipCountry'}>{ccName} · {cc}</div>}
        </div>
      </div>
      <div className={'MasternodesDonut__TipRow'}>
        <span>proTx</span>
        <b>{shortHash(cell.proTxHash, 6, 6)}</b>
      </div>
      {cell.service &&
        <div className={'MasternodesDonut__TipRow'}>
          <span>Host</span>
          <b className={'MasternodesDonut__TipMono'}>{cell.service}</b>
        </div>}
      {typeof proposed === 'number' &&
        <div className={'MasternodesDonut__TipRow'}>
          <span>Proposed</span>
          <b>{proposed.toLocaleString('en-US')} blocks</b>
        </div>}
      {v?.identity &&
        <div className={'MasternodesDonut__TipRow'}>
          <span>Identity</span>
          <b>{shortHash(v.identity, 4, 4)}</b>
        </div>}
      {!cc &&
        <div className={'MasternodesDonut__TipRow'}>
          <span>Country</span>
          <b>Unknown</b>
        </div>}
      <div className={'MasternodesDonut__TipCta'}>Open validator →</div>
    </div>
  )
}

export default function MasternodesDonut ({
  validators,
  validatorsActive,
  validatorsBanned,
  validatorsInactive,
  validatorsList,
  bannedValidatorsList,
  currentQuorum,
  currentQuorumLoading,
  currentQuorumError,
  nextQuorum
}) {
  const [pin, setPin] = useState(null)
  const [helpOpen, setHelpOpen] = useState(false)

  const total = validators?.data?.pagination?.total
  const active = validatorsActive?.data?.pagination?.total
  const banned = validatorsBanned?.data?.pagination?.total
  const inactive = validatorsInactive?.data?.pagination?.total

  const hasTotal = typeof total === 'number' && total > 0
  const loadingTotal = Boolean(validators?.loading)
  const showSkeleton = !hasTotal && loadingTotal
  const showEmpty = !hasTotal && !loadingTotal
  const showContent = hasTotal

  const activeN = typeof active === 'number' ? active : 0
  const bannedN = typeof banned === 'number' ? banned : 0
  const queuedN = typeof inactive === 'number' ? inactive : 0

  const counts = {
    total: hasTotal ? total : null,
    active: typeof active === 'number' ? active : null,
    inactive: typeof inactive === 'number' ? inactive : null,
    banned: typeof banned === 'number' ? banned : null
  }

  const currentMembers = Array.isArray(currentQuorum?.members) ? currentQuorum.members : null
  const nextMembers = Array.isArray(nextQuorum?.members) ? nextQuorum.members : null
  const hasRoster = Boolean(currentMembers && currentMembers.length > 0)

  const currentSet = useMemo(() => {
    if (!currentMembers) return null
    return new Set(currentMembers.map(m => memberKey(m.proTxHash)))
  }, [currentMembers])

  const nextSet = useMemo(() => {
    if (!nextMembers) return null
    return new Set(nextMembers.map(m => memberKey(m.proTxHash)))
  }, [nextMembers])

  const memberMeta = useMemo(() => {
    const map = new Map()
    for (const m of currentMembers || []) {
      map.set(memberKey(m.proTxHash), {
        valid: m.valid !== false,
        service: m.service || null
      })
    }
    for (const m of nextMembers || []) {
      const k = memberKey(m.proTxHash)
      if (!map.has(k)) {
        map.set(k, { valid: m.valid !== false, service: m.service || null })
      }
    }
    return map
  }, [currentMembers, nextMembers])

  const health = parseHealth(currentQuorum?.healthRatio)
  const llmq = parseLlmqType(currentQuorum?.type)
  const validCount = typeof currentQuorum?.numValidMembers === 'number'
    ? currentQuorum.numValidMembers
    : (currentMembers ? currentMembers.filter(m => m?.valid !== false).length : null)
  const rosterSize = currentMembers?.length ?? llmq?.size ?? null
  const dkgFailures = currentQuorum?.previousConsecutiveDKGFailures
  const showDkg = typeof dkgFailures === 'number' && dkgFailures > 0

  const list = useMemo(
    () => (Array.isArray(validatorsList) ? validatorsList : []),
    [validatorsList]
  )
  const bannedSet = useMemo(() => {
    const set = new Set()
    for (const v of Array.isArray(bannedValidatorsList) ? bannedValidatorsList : []) {
      if (v?.proTxHash) set.add(memberKey(v.proTxHash))
    }
    return set
  }, [bannedValidatorsList])
  const hasNodeList = list.length > 0

  const cells = useMemo(() => {
    if (hasNodeList) {
      return buildPoolCells({
        list,
        currentSet,
        nextSet,
        memberMeta,
        bannedSet
      })
    }
    if (!hasTotal) return []
    return buildProportionalCells(activeN, queuedN, bannedN, total)
  }, [hasNodeList, list, currentSet, nextSet, memberMeta, bannedSet, hasTotal, activeN, queuedN, bannedN, total])

  const cols = useMemo(() => matrixCols(cells.length), [cells.length])
  const rows = useMemo(
    () => (cells.length ? Math.ceil(cells.length / cols) : 1),
    [cells.length, cols]
  )
  const capped = hasTotal && cells.length < total
  const abstractMode = !hasNodeList

  const pct = (n) => (hasTotal && typeof n === 'number' ? Math.round((n / total) * 100) : null)

  const geoSummary = useMemo(() => {
    const codes = new Set()
    let withGeo = 0
    for (const v of list) {
      const cc = v?.geoIpInfo?.countryCode
      if (cc) {
        codes.add(cc)
        withGeo++
      }
    }
    return {
      nations: codes.size,
      withGeo,
      listSize: list.length,
      has: codes.size > 0
    }
  }, [list])

  const togglePin = (key) => setPin(p => (p === key ? null : key))

  const matrixAria = hasNodeList
    ? `${list.length} validators` +
      (hasRoster && rosterSize != null ? `, ${rosterSize} in current quorum` : '') +
      (capped ? ` (showing ${cells.length} of ${total})` : '')
    : capped
      ? `${activeN} in quorum of ${total} (matrix capped)`
      : `${activeN} of ${total} in active / queued / banned pool`

  const activeHint = hasRoster && rosterSize != null
    ? `Current signing set: ${rosterSize}` +
      (validCount != null ? ` · ${validCount} valid` : '') +
      (health != null ? ` · health ${healthLabel(health)}` : '') +
      '.'
    : STATS.find(s => s.key === 'active')?.hint

  return (
    <Box
      className={'InfoBlock InfoBlock--NoBorder MasternodesDonut'}
      w={'100%'}
      h={'100%'}
      as={'section'}
      aria-label={'Quorum'}
    >
      <div className={'MasternodesDonut__Glow'} aria-hidden={'true'}/>

      <header className={'MasternodesDonut__Head'}>
        <div className={'MasternodesDonut__HeadText'}>
          <div className={'MasternodesDonut__TitleRow'}>
            <span className={'MasternodesDonut__Eyebrow'}>Consensus</span>
            <button
              type={'button'}
              className={`MasternodesDonut__HelpBtn${helpOpen ? ' is-open' : ''}`}
              aria-expanded={helpOpen}
              aria-controls={'masternodes-donut-help'}
              onClick={() => setHelpOpen(o => !o)}
            >
              ?
            </button>
          </div>
          <h2 className={'MasternodesDonut__Title'}>Quorum</h2>
          <p className={'MasternodesDonut__Lede'}>
            Full validator pool: who is in the signing set, who joins next, who is waiting or banned.
          </p>
          {helpOpen &&
            <div id={'masternodes-donut-help'} className={'MasternodesDonut__Help'} role={'region'}>
              <p>
                Each square is one Platform validator. <b>Color</b> is the only signal on the grid:
                role in the signing set. Country, host, and identity live in the <b>tooltip</b>.
              </p>
              <p>
                <b>Green</b> = current · <b>Yellow</b> = leaving next ·
                <b>Gray + blue ring</b> = queued and joining next · <b>Gray</b> = queued only ·
                <b>Red</b> = banned.
              </p>
              <p>
                Next set is formed by deterministic rules, not a vote. Click opens the validator page.
              </p>
            </div>}
        </div>

        {(hasRoster || currentQuorumLoading || geoSummary.has) &&
          <div className={'MasternodesDonut__Status'} aria-label={'Current quorum status'}>
            {hasRoster &&
              <>
                <span
                  className={`MasternodesDonut__Chip MasternodesDonut__Chip--${healthTone(health)}`}
                  title={'Share of valid members in the current signing set'}
                >
                  <i/> {healthLabel(health)}
                </span>
                {rosterSize != null &&
                  <span className={'MasternodesDonut__Chip'} title={'Valid members / roster size'}>
                    {validCount != null ? `${validCount}/${rosterSize}` : rosterSize}
                  </span>}
                {llmq && llmq.size != null && llmq.threshold != null &&
                  <span className={'MasternodesDonut__Chip'} title={llmq.raw || 'Quorum type'}>
                    {llmq.size}·{llmq.threshold}%
                  </span>}
                {typeof currentQuorum?.blockHeight === 'number' &&
                  <span
                    className={'MasternodesDonut__Chip MasternodesDonut__Chip--muted'}
                    title={'Core height of this quorum'}
                  >
                    #{currentQuorum.blockHeight.toLocaleString('en-US')}
                  </span>}
                <span className={'MasternodesDonut__Chip MasternodesDonut__Chip--live'} title={'Live signing set'}>
                  <i/> Live
                </span>
                {showDkg &&
                  <span
                    className={'MasternodesDonut__Chip MasternodesDonut__Chip--critical'}
                    title={'Previous consecutive DKG failures'}
                  >
                    DKG {dkgFailures}
                  </span>}
              </>}
            {!hasRoster && currentQuorumLoading &&
              <span className={'MasternodesDonut__Chip MasternodesDonut__Chip--muted'}>…</span>}
            {geoSummary.has &&
              <span
                className={'MasternodesDonut__Chip MasternodesDonut__Chip--muted'}
                title={`${geoSummary.withGeo} of ${geoSummary.listSize} validators have geo IP; country is in each tile tooltip`}
              >
                {geoSummary.nations} {geoSummary.nations === 1 ? 'country' : 'countries'}
              </span>}
          </div>}
      </header>

      {currentQuorumError && !hasRoster && !currentQuorumLoading &&
        <p className={'MasternodesDonut__FallbackNote'}>
          Detailed signing roster unavailable. Pool uses explorer active/queued flags only.
        </p>}

      <div className={'MasternodesDonut__Body'}>
        {showSkeleton &&
          <div className={'MasternodesDonut__Stage'}>
            <Skeleton className={'MasternodesDonut__MatrixSkel'} w={'100%'} h={'11rem'} radius={12}/>
            <div className={'MasternodesDonut__Rails'}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} w={'100%'} h={'4.25rem'} radius={12}/>
              ))}
            </div>
          </div>}

        {showEmpty && <div className={'MasternodesDonut__Empty'}>No data</div>}

        {showContent &&
          <div
            className={`MasternodesDonut__Stage${pin ? ' is-pinned' : ''}`}
            data-pin={pin || undefined}
          >
            <div className={'MasternodesDonut__Col'}>
              <div className={'MasternodesDonut__MatrixWrap'}>
                <div
                  className={`MasternodesDonut__Matrix${hasNodeList ? ' MasternodesDonut__Matrix--roster' : ''}`}
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
                  }}
                  role={'img'}
                  aria-label={matrixAria}
                >
                  {cells.map((cell) => {
                    if (cell.kind === 'abstract') {
                      const type = cell.type
                      return (
                        <button
                          key={`a-${type}-${cell.index}`}
                          type={'button'}
                          data-type={type === 'idle' ? 'total' : type}
                          className={`MasternodesDonut__Cell MasternodesDonut__Cell--${type}`}
                          tabIndex={type === 'idle' ? -1 : 0}
                          aria-label={
                            type === 'idle'
                              ? 'Other validators'
                              : STATS.find(s => s.key === type)?.label
                          }
                          aria-pressed={pin === (type === 'idle' ? 'total' : type)}
                          onClick={() => togglePin(type === 'idle' ? 'total' : type)}
                        />
                      )
                    }

                    const dataType = cell.type === 'leave' || cell.type === 'invalid'
                      ? 'active'
                      : cell.type === 'join'
                        ? 'inactive'
                        : cell.type === 'idle'
                          ? 'total'
                          : cell.type

                    const cc = cell.validator?.geoIpInfo?.countryCode
                    const ccName = cc ? countryName(cc) : null
                    const roleHint = cell.role === 'leave'
                      ? 'leaving next'
                      : cell.role === 'join'
                        ? 'joining next'
                        : cell.role

                    const link = (
                      <Link
                        href={`/validator/${cell.proTxHash}`}
                        data-type={dataType}
                        data-role={cell.role}
                        className={`MasternodesDonut__Cell MasternodesDonut__Cell--${cell.type}`}
                        aria-label={
                          `${shortHash(cell.proTxHash)}, ${roleHint}` +
                          (ccName ? `, ${ccName}` : '')
                        }
                      />
                    )

                    return (
                      <Tooltip
                        key={cell.proTxHash || `n-${cell.index}`}
                        placement={'top'}
                        content={<NodeTooltipBody cell={cell}/>}
                      >
                        {link}
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
              {abstractMode &&
                <p className={'MasternodesDonut__FallbackNote MasternodesDonut__FallbackNote--inline'}>
                  Loading per-node list… squares are proportional for now.
                </p>}
              {capped && hasNodeList &&
                <p className={'MasternodesDonut__FallbackNote MasternodesDonut__FallbackNote--inline'}>
                  Showing {cells.length.toLocaleString('en-US')} of {total.toLocaleString('en-US')} validators
                  (API page limit).
                </p>}
            </div>

            <div className={'MasternodesDonut__Rails'} role={'list'}>
              {STATS.map(s => {
                const n = counts[s.key]
                const ready = typeof n === 'number'
                const share = s.key !== 'total' ? pct(n) : null
                const hint = s.key === 'active' ? activeHint : s.hint
                return (
                  <button
                    key={s.key}
                    type={'button'}
                    role={'listitem'}
                    data-type={s.key}
                    className={`MasternodesDonut__Rail MasternodesDonut__Rail--${s.key}`}
                    onClick={() => togglePin(s.key)}
                    aria-pressed={pin === s.key}
                    disabled={!ready}
                  >
                    <span className={'MasternodesDonut__RailTop'}>
                      <span className={'MasternodesDonut__RailId'}>
                        <i className={`MasternodesDonut__Dot MasternodesDonut__Dot--${s.key}`}/>
                        {s.label}
                      </span>
                      <span className={'MasternodesDonut__RailNums'}>
                        <b>{ready ? n.toLocaleString('en-US') : '—'}</b>
                        {share != null && <em>{share}%</em>}
                      </span>
                    </span>
                    <span className={'MasternodesDonut__RailHint'}>{hint}</span>
                  </button>
                )
              })}
            </div>
          </div>}
      </div>
    </Box>
  )
}
