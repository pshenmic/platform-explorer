'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Box } from '@chakra-ui/react'
import { Skeleton } from './Skeleton'
import { Tooltip } from '../ui/Tooltips'
import './MasternodesDonut.css'

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

function parseLlmqType (type) {
  if (!type || typeof type !== 'string') return null
  const m = type.match(/llmq_(\d+)_(\d+)/i)
  if (!m) return { raw: type, size: null, threshold: null }
  return { raw: type, size: Number(m[1]), threshold: Number(m[2]) }
}

function memberKey (proTx) {
  return (proTx || '').toLowerCase()
}

const STATS = [
  {
    key: 'total',
    label: 'Total',
    hint: 'All evonodes on Platform'
  },
  {
    key: 'active',
    label: 'Now',
    hint: 'Signing this block'
  },
  {
    key: 'next',
    label: 'Next',
    hint: 'Orange · signs the next rotation'
  },
  {
    key: 'inactive',
    label: 'Queued',
    hint: 'Waiting, not in Now or Next'
  },
  {
    key: 'banned',
    label: 'Banned',
    hint: 'PoSe banned or left the list'
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
  return Math.max(12, Math.ceil(Math.sqrt(count)))
}

function isPoSeBannedValidator (v) {
  const ban = v?.proTxInfo?.state?.PoSeBanHeight
  return typeof ban === 'number' && ban >= 0
}

function buildPoolCells ({ list, currentSet, nextSet, memberMeta, bannedSet }) {
  if (!Array.isArray(list) || list.length === 0) return []

  const cells = list.map((v, index) => {
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
      type = meta?.valid === false ? 'invalid' : 'active'
      role = meta?.valid === false ? 'invalid' : 'current'
    } else if (inNext) {
      type = 'next'
      role = 'next'
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

  const rank = { active: 0, next: 1, invalid: 2, inactive: 3, banned: 4, idle: 5 }
  cells.sort((a, b) => (rank[a.type] ?? 9) - (rank[b.type] ?? 9))
  return cells
}

function TipRow ({ label, href, children, mono }) {
  const value = <b className={mono ? 'MasternodesDonut__TipMono' : undefined}>{children}</b>
  return (
    <div className={'MasternodesDonut__TipRow'}>
      <span>{label}</span>
      {href
        ? (
          <Link
            href={href}
            className={'MasternodesDonut__TipLink'}
            onClick={e => e.stopPropagation()}
          >
            {value}
          </Link>
          )
        : value}
    </div>
  )
}

function formatQuorumIds (ids) {
  if (!ids?.length) return null
  return ids.map(n => {
    if (n === 0) return 'Now'
    if (n === 1) return 'Next'
    return `+${n}`
  }).join(' · ')
}

function NodeTooltipBody ({ cell }) {
  const v = cell.validator
  const quorumLabel = formatQuorumIds(cell.quorumIndexes)
  const status = (() => {
    if (cell.role === 'banned') {
      return isPoSeBannedValidator(cell.validator)
        ? 'Banned (PoSe)'
        : 'Banned / not in registered set'
    }
    if (cell.role === 'invalid') return 'In current quorum · invalid'
    if (cell.role === 'next') return 'Signs next'
    if (cell.role === 'current' || cell.role === 'active') return 'In the live signing set'
    if (quorumLabel) return `In quorum ${quorumLabel}`
    return 'Not in a loaded Platform quorum'
  })()

  const cc = v?.geoIpInfo?.countryCode
  const ccName = cc ? countryName(cc) : null
  const proposed = v?.proposedBlocksAmount
  const validatorHref = cell.proTxHash ? `/validator/${cell.proTxHash}` : null
  const identityHref = v?.identity ? `/identity/${v.identity}` : null

  return (
    <div className={'MasternodesDonut__Tip'}>
      <div className={'MasternodesDonut__TipHead'}>
        {cc &&
          <Image
            className={'MasternodesDonut__TipFlag'}
            src={`/flags/circle/${cc.toLowerCase()}.svg`}
            alt={''}
            width={22}
            height={22}
            unoptimized
            onError={e => { e.currentTarget.style.display = 'none' }}
          />}
        <div className={'MasternodesDonut__TipHeadText'}>
          <div className={'MasternodesDonut__TipStatus'}>{status}</div>
          {ccName &&
            <div className={'MasternodesDonut__TipCountry'}>{ccName} · {cc}</div>}
        </div>
      </div>
      <TipRow label={'proTx'} href={validatorHref}>
        {shortHash(cell.proTxHash, 6, 6)}
      </TipRow>
      {quorumLabel &&
        <TipRow label={'Signs'}>
          {quorumLabel}
        </TipRow>}
      {cell.service &&
        <TipRow label={'Host'} mono>
          {cell.service}
        </TipRow>}
      {typeof proposed === 'number' &&
        <TipRow label={'Proposed'} href={validatorHref}>
          {proposed.toLocaleString('en-US')} blocks
        </TipRow>}
      {identityHref &&
        <TipRow label={'Identity'} href={identityHref}>
          {shortHash(v.identity, 4, 4)}
        </TipRow>}
      {!cc &&
        <TipRow label={'Country'}>
          Unknown
        </TipRow>}
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
  quorums
}) {
  const [pin, setPin] = useState(null)
  const [focusKey, setFocusKey] = useState(null)

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

  const currentMembers = Array.isArray(currentQuorum?.members) ? currentQuorum.members : null
  const hasRoster = Boolean(currentMembers && currentMembers.length > 0)

  const currentSet = useMemo(() => {
    if (!currentMembers) return null
    return new Set(currentMembers.map(m => memberKey(m.proTxHash)))
  }, [currentMembers])

  const sortedQuorums = useMemo(() => {
    const list = [...(Array.isArray(quorums) ? quorums : [])]
      .filter(q => q?.quorumHash)
      .sort((a, b) => (a.blockHeight ?? 0) - (b.blockHeight ?? 0))
    if (!list.length) return []
    const liveHash = currentQuorum?.quorumHash
    const liveI = list.findIndex(q =>
      Boolean(q.isCurrent) || (liveHash && q.quorumHash === liveHash)
    )
    const start = liveI >= 0 ? liveI : 0
    return list.map((_, i) => {
      const q = list[(start + i) % list.length]
      return {
        ...q,
        offset: i,
        isLive: i === 0 && liveI >= 0
      }
    })
  }, [quorums, currentQuorum?.quorumHash])

  const rosterIndex = useMemo(() => {
    const byNode = new Map()
    const membersOf = new Map()
    for (const q of sortedQuorums) {
      const hash = q.quorumHash
      const set = new Set()
      for (const m of q.members || []) {
        const k = memberKey(m.proTxHash)
        if (!k) continue
        set.add(k)
        const arr = byNode.get(k) || []
        arr.push({ hash, index: q.offset, isCurrent: q.isLive })
        byNode.set(k, arr)
      }
      membersOf.set(hash, set)
    }
    for (const arr of byNode.values()) {
      arr.sort((a, b) => {
        if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1
        return a.index - b.index
      })
    }
    return { byNode, membersOf }
  }, [sortedQuorums])

  const memberMeta = useMemo(() => {
    const map = new Map()
    for (const q of Array.isArray(quorums) ? quorums : []) {
      for (const m of q.members || []) {
        const k = memberKey(m.proTxHash)
        if (!k || map.has(k)) continue
        map.set(k, { valid: m.valid !== false, service: m.service || null })
      }
    }
    for (const m of currentMembers || []) {
      const k = memberKey(m.proTxHash)
      if (!k) continue
      map.set(k, { valid: m.valid !== false, service: m.service || null })
    }
    return map
  }, [quorums, currentMembers])

  const llmq = parseLlmqType(currentQuorum?.type)
  const rosterSize = currentMembers?.length ?? llmq?.size ?? null

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
    const raw = hasNodeList
      ? buildPoolCells({
        list,
        currentSet,
        nextSet: rosterIndex.membersOf.get(sortedQuorums.find(q => q.offset === 1)?.quorumHash) || null,
        memberMeta,
        bannedSet
      })
      : (hasTotal ? buildProportionalCells(activeN, queuedN, bannedN, total) : [])
    return raw.map(cell => {
      if (cell.kind !== 'node' || !cell.proTxHash) return cell
      const qs = rosterIndex.byNode.get(memberKey(cell.proTxHash)) || []
      return {
        ...cell,
        quorumHashes: qs.map(q => q.hash),
        quorumIndexes: qs.map(q => q.index).filter(n => typeof n === 'number')
      }
    })
  }, [hasNodeList, list, currentSet, memberMeta, bannedSet, hasTotal, activeN, queuedN, bannedN, total, rosterIndex, sortedQuorums])

  const nextN = useMemo(
    () => cells.filter(c => c.type === 'next').length,
    [cells]
  )

  const counts = {
    total: hasTotal ? total : null,
    active: typeof active === 'number' ? active : null,
    next: hasNodeList ? nextN : null,
    inactive: typeof inactive === 'number'
      ? Math.max(0, inactive - (hasNodeList ? nextN : 0))
      : null,
    banned: typeof banned === 'number' ? banned : null
  }

  const cols = useMemo(() => matrixCols(cells.length), [cells.length])
  const rows = useMemo(
    () => (cells.length ? Math.ceil(cells.length / cols) : 1),
    [cells.length, cols]
  )
  const capped = hasTotal && cells.length < total

  const pct = (n) => (hasTotal && typeof n === 'number' ? Math.round((n / total) * 100) : null)

  const togglePin = (key) => setPin(p => (p === key ? null : key))

  const cycleNodeQuorum = (hashes, proTx) => {
    const key = memberKey(proTx)
    if (key) setFocusKey(key)
    if (!hashes?.length) return
    const ordered = hashes
      .map(h => sortedQuorums.find(q => q.quorumHash === h))
      .filter(Boolean)
      .sort((a, b) => a.offset - b.offset)
    if (!ordered.length) return
    const keys = ordered.map(q => q.quorumHash)
    if (typeof pin === 'string' && pin.startsWith('q:')) {
      const cur = pin.slice(2)
      const i = keys.indexOf(cur)
      if (i === -1) {
        setPin(`q:${keys[0]}`)
        return
      }
      if (i + 1 < keys.length) {
        setPin(`q:${keys[i + 1]}`)
        return
      }
      setPin(null)
      return
    }
    setPin(`q:${keys[0]}`)
  }

  const turnLabel = (offset, isLive) => {
    if (isLive || offset === 0) return 'Now'
    if (offset === 1) return 'Next'
    return `+${offset}`
  }

  const pinnedQuorumHash = typeof pin === 'string' && pin.startsWith('q:') ? pin.slice(2) : null
  const pinnedQuorumSet = pinnedQuorumHash ? rosterIndex.membersOf.get(pinnedQuorumHash) : null
  const pinnedQuorumMeta = pinnedQuorumHash
    ? (sortedQuorums.find(q => q.quorumHash === pinnedQuorumHash) || null)
    : null

  const matrixAria = hasNodeList
    ? `${list.length} validators` +
      (hasRoster && rosterSize != null ? `, ${rosterSize} in current quorum` : '') +
      (capped ? ` (showing ${cells.length} of ${total})` : '')
    : capped
      ? `${activeN} in quorum of ${total} (matrix capped)`
      : `${activeN} of ${total} in active / queued / banned pool`

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
          <span className={'MasternodesDonut__Eyebrow'}>Consensus</span>
          <h2 className={'MasternodesDonut__Title'}>Quorum</h2>
          <p className={'MasternodesDonut__Lede'}>
            Only a
            <Tooltip
              placement={'top'}
              content={
                <div className={'MasternodesDonut__HelpTip'}>
                  <p>
                    Mainnet keeps 24 formed Platform quorums (LLMQ 100/67). Only one signs
                    the current block.
                  </p>
                  <p className={'MasternodesDonut__HelpFoot'}>
                    Click a square to see that node&apos;s soonest turn. Click again to
                    cycle its other quorums.
                  </p>
                </div>
              }
            >
              <span className={'MasternodesDonut__LedeMore'}>rotating set</span>
            </Tooltip>
            {' '}of 100 evonodes signs each block.
          </p>
        </div>

        {sortedQuorums.length > 0 &&
          <div className={'MasternodesDonut__QBar'} aria-label={'Platform quorums'}>
            <p className={'MasternodesDonut__QCaption'}>
              {pinnedQuorumMeta
                ? <>
                    <b>{turnLabel(pinnedQuorumMeta.offset, pinnedQuorumMeta.isLive)}</b>
                    <span>
                      {(pinnedQuorumMeta.members?.length || pinnedQuorumSet?.size || 0)} signers
                    </span>
                    {pinnedQuorumMeta.isLive
                      ? <em>signing now</em>
                      : <span>
                          {pinnedQuorumMeta.offset === 1
                            ? 'signs next'
                            : `in ${pinnedQuorumMeta.offset} rotations`}
                        </span>}
                  </>
                : <>
                    <b>When does it sign?</b>
                    <span>pick a node or a turn</span>
                  </>}
            </p>
            <div className={'MasternodesDonut__QPick'} role={'group'} aria-label={'Signing rotation'}>
              {sortedQuorums.map(q => {
                const selected = q.quorumHash === pinnedQuorumHash
                const label = turnLabel(q.offset, q.isLive)
                return (
                  <button
                    key={q.quorumHash}
                    type={'button'}
                    className={
                      `MasternodesDonut__QBtn${q.offset < 2 ? ' is-word' : ''}${selected ? ' is-on' : ''}${q.isLive ? ' is-live' : ''}${q.offset === 1 ? ' is-next' : ''}`
                    }
                    aria-pressed={selected}
                    title={
                      (q.isLive
                        ? 'Signing this Platform block'
                        : q.offset === 1
                          ? 'Next signing set'
                          : `Signing set in ${q.offset} rotations`) +
                      (typeof q.blockHeight === 'number'
                        ? ` · formed at #${q.blockHeight.toLocaleString('en-US')}`
                        : '')
                    }
                    onClick={() => togglePin(`q:${q.quorumHash}`)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
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
            className={`MasternodesDonut__Stage${pin ? ' is-pinned' : ''}${pinnedQuorumHash ? ' is-pinned-quorum' : ''}`}
            data-pin={pinnedQuorumHash ? 'quorum' : (pin || undefined)}
          >
            <div className={'MasternodesDonut__Col'}>
              <div className={'MasternodesDonut__MatrixWrap'}>
                <div
                  className={`MasternodesDonut__Matrix${hasNodeList ? ' MasternodesDonut__Matrix--roster' : ''}`}
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(10px, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(10px, 1fr))`
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

                    const dataType = cell.type === 'invalid'
                      ? 'active'
                      : cell.type === 'idle'
                        ? 'total'
                        : cell.type

                    const cc = cell.validator?.geoIpInfo?.countryCode
                    const ccName = cc ? countryName(cc) : null
                    const roleHint = cell.role === 'current'
                      ? 'signing now'
                      : cell.role === 'next'
                        ? 'signs next'
                        : (cell.quorumIndexes?.length
                            ? `signs ${formatQuorumIds(cell.quorumIndexes)}`
                            : cell.role)

                    const nodeKey = memberKey(cell.proTxHash)
                    const inPinned = Boolean(pinnedQuorumSet && pinnedQuorumSet.has(nodeKey))
                    const isFocus = Boolean(focusKey && focusKey === nodeKey)

                    const tile = (
                      <button
                        type={'button'}
                        data-type={dataType}
                        data-role={cell.role}
                        className={
                          `MasternodesDonut__Cell MasternodesDonut__Cell--${cell.type}` +
                          (inPinned ? ' is-in-pin' : '') +
                          (isFocus ? ' is-focus' : '')
                        }
                        aria-label={
                          `${shortHash(cell.proTxHash)}, ${roleHint}` +
                          (ccName ? `, ${ccName}` : '')
                        }
                        aria-pressed={inPinned || undefined}
                        onClick={() => cycleNodeQuorum(cell.quorumHashes, cell.proTxHash)}
                      />
                    )

                    return (
                      <Tooltip
                        key={cell.proTxHash || `n-${cell.index}`}
                        placement={'top'}
                        content={<NodeTooltipBody cell={cell}/>}
                      >
                        {tile}
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
              {capped && hasNodeList &&
                <p className={'MasternodesDonut__FallbackNote MasternodesDonut__FallbackNote--inline'}>
                  Loaded {cells.length.toLocaleString('en-US')} of {total.toLocaleString('en-US')} validators
                </p>}
            </div>

            <div className={'MasternodesDonut__Rails'} role={'group'} aria-label={'Validator groups'}>
              {STATS.map(s => {
                const n = counts[s.key]
                const ready = typeof n === 'number'
                const share = s.key !== 'total' ? pct(n) : null
                return (
                  <button
                    key={s.key}
                    type={'button'}
                    data-type={s.key}
                    className={`MasternodesDonut__Rail MasternodesDonut__Rail--${s.key}`}
                    onClick={() => togglePin(s.key)}
                    aria-pressed={pin === s.key}
                    disabled={!ready}
                    title={s.hint}
                  >
                    <span className={'MasternodesDonut__RailId'}>
                      <i className={`MasternodesDonut__Dot MasternodesDonut__Dot--${s.key}`}/>
                      {s.label}
                    </span>
                    <span className={'MasternodesDonut__RailHint'}>{s.hint}</span>
                    <span className={'MasternodesDonut__RailNums'}>
                      <b>{ready ? n.toLocaleString('en-US') : '—'}</b>
                      {share != null && <em>{share}%</em>}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>}
      </div>
    </Box>
  )
}
