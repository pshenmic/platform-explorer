'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { Box } from '@chakra-ui/react'
import { Tooltip } from '../ui/Tooltips'
import { BlockIcon } from '../ui/icons'
import * as Api from '../../util/Api'
import { ResponseErrorNotFound } from '../../util/Errors'
import { TimeDelta } from '../data'
import { useCountUp } from './hooks'
import { Skeleton } from './Skeleton'
import './QuorumCard.css'

const QUORUM_DETAIL_STALE = 60_000

async function fetchQuorumDetail(hash: string) {
  try {
    return await Api.getQuorumByHash(hash)
  } catch (e) {
    if (e instanceof ResponseErrorNotFound) return null
    throw e
  }
}

const CORE_BLOCK_SEC = 150

function gridSide(n: number) {
  const size = n > 0 ? n : 100
  const root = Math.round(Math.sqrt(size))
  if (root * root === size) return root
  return Math.max(1, Math.ceil(Math.sqrt(size)))
}

function quorumHeight(q: any) {
  const n = q?.blockHeight ?? q?.creationHeight
  return typeof n === 'number' && n > 0 ? n : null
}

function quorumStep(list: any[]) {
  const hs = list.map(quorumHeight).filter((n): n is number => n != null)
  hs.sort((a, b) => a - b)
  const diffs: number[] = []
  for (let i = 1; i < hs.length; i++) {
    const d = hs[i] - hs[i - 1]
    if (d > 0 && d < 200) diffs.push(d)
  }
  if (!diffs.length) return 24
  diffs.sort((a, b) => a - b)
  return diffs[Math.floor(diffs.length / 2)]
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' })
  } catch {
    return null
  }
})()

function countryName(cc: any) {
  try {
    return regionNames?.of(cc) || cc
  } catch {
    return cc
  }
}

function isPlaceholderHost(host: string) {
  const t = host.trim().toLowerCase()
  if (!t) return true
  const bare = t.replace(/^\[|\]$/g, '')
  return (
    t === '[::]:0' ||
    t === '[::]' ||
    t === '::' ||
    t === '::0' ||
    t === ':0' ||
    t === '0.0.0.0:0' ||
    t === '0.0.0.0' ||
    t === '*:0' ||
    t === '*' ||
    /^(\*|0\.0\.0\.0|\[::\]|::)(:0)?$/.test(t) ||
    bare === '::' ||
    (/:0$/.test(t) && (t.startsWith('[::]') || t.startsWith('0.0.0.0') || t.startsWith('*')))
  )
}

function nodeHost(cell: any) {
  const raw =
    cell?.service || cell?.validator?.proTxInfo?.state?.service || cell?.validator?.endpoints?.[0]
  if (typeof raw !== 'string') return null
  const host = raw.trim()
  if (!host || isPlaceholderHost(host)) return null
  return host
}

function stripPort(host: string) {
  const t = host.trim()
  if (t.startsWith('[')) {
    const end = t.indexOf(']')
    if (end > 0) return t.slice(1, end)
  }
  const colon = t.lastIndexOf(':')
  if (colon > 0 && t.indexOf(':') === colon && /^\d+$/.test(t.slice(colon + 1))) {
    return t.slice(0, colon)
  }
  return t
}

function shortHash(h: any, head = 4, tail = 4) {
  if (!h || typeof h !== 'string') return '—'
  if (h.length <= head + tail + 1) return h
  return `${h.slice(0, head)}…${h.slice(-tail)}`
}

function parseLlmqType(type: any) {
  if (!type || typeof type !== 'string') return null
  const m = type.match(/llmq_(\d+)_(\d+)/i)
  if (!m) return { raw: type, size: null, threshold: null }
  return { raw: type, size: Number(m[1]), threshold: Number(m[2]) }
}

function memberKey(proTx: any) {
  return (proTx || '').toLowerCase()
}

function memberKeysInCoreOrder(members: any) {
  const keys: string[] = []
  const seen = new Set<string>()
  if (!Array.isArray(members)) return keys
  for (const member of members) {
    const key = memberKey(member?.proTxHash)
    if (!key || seen.has(key)) continue
    seen.add(key)
    keys.push(key)
  }
  return keys
}

function sortProTxKeys(keys: string[]) {
  return [...keys].sort((a, b) => a.localeCompare(b))
}

function formatProposeWait(blocks: number, avgSec: number | null) {
  if (typeof avgSec === 'number' && avgSec > 0) {
    const sec = Math.round(blocks * avgSec)
    if (sec < 90) return `~in ${sec}s`
    const min = Math.round(sec / 60)
    return min < 90 ? `~in ${min}m` : `~in ${(min / 60).toFixed(1)}h`
  }
  return `~in ${blocks} blocks`
}

function proposeHintFor(
  nodeKey: string,
  lastKey: string,
  ordered: string[],
  avgSec: number | null,
  later?: { liveOrdered: string[]; offset: number }
) {
  if (!nodeKey || !ordered.length) return null
  const i = ordered.indexOf(nodeKey)
  if (i < 0) return null
  if (later) {
    const live = later.liveOrdered
    const p = lastKey && live.length ? live.indexOf(lastKey) : -1
    const untilLiveDone = p >= 0 ? Math.max(0, live.length - p - 1) : live.length
    const setsAhead = Math.max(0, later.offset - 1)
    const setSize = ordered.length || live.length || 100
    return formatProposeWait(untilLiveDone + setsAhead * setSize + i, avgSec)
  }
  const p = lastKey ? ordered.indexOf(lastKey) : -1
  if (p < 0) return formatProposeWait(i, avgSec)
  if (i === p) return 'now'
  if (i > p) return formatProposeWait(i - p, avgSec)
  return 'finished'
}

function quorumKey(hash: unknown) {
  return typeof hash === 'string' && hash.length ? hash.toUpperCase() : ''
}

const STATS = [
  { key: 'total', label: 'Total', hint: 'This quorum plus queued' },
  { key: 'inactive', label: 'Queued', hint: 'Not in this quorum' },
  { key: 'active', label: 'Now', hint: 'This quorum of 100' }
]

function isPoSeBannedValidator(v: any) {
  const ban = v?.proTxInfo?.state?.PoSeBanHeight
  return typeof ban === 'number' && ban >= 0
}

function paintPoolNode(
  k: string,
  selectedSet: Set<string>,
  prevSet: Set<string>,
  memberMeta: any,
  isBanned: boolean
) {
  if (!selectedSet.has(k)) {
    return isBanned
      ? { type: 'banned', role: 'banned', band: 'out' }
      : { type: 'inactive', role: 'queued', band: 'wait' }
  }
  const meta = memberMeta?.get(k)
  if (isBanned || meta?.valid === false) {
    return { type: 'banned', role: 'banned', band: prevSet.has(k) ? 'carry' : 'selected' }
  }
  if (prevSet.has(k)) return { type: 'next', role: 'next', band: 'carry' }
  return { type: 'active', role: 'current', band: 'selected' }
}

function hostMatches(row: any, query: string) {
  const s = query.trim().toLowerCase()
  if (!s) return true
  if (String(row.homeIndex ?? '').includes(s.replace(/^#/, ''))) return true
  if (typeof row.host === 'string' && row.host.toLowerCase().includes(s)) return true
  const proTx = typeof row.proTxHash === 'string' ? row.proTxHash.toLowerCase() : ''
  return proTx.includes(s.replace(/^0x/, ''))
}

function RollingIdx({ value }: { value: number }) {
  const n = useCountUp(value, 500, true)
  const shown = typeof n === 'number' ? n : value
  return (
    <span className={'QuorumCard__CellIdx'}>
      <span className={'QuorumCard__CellIdxMark'} aria-hidden={'true'}>
        #
      </span>
      {shown}
    </span>
  )
}

function HostSearch({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <label className={'QuorumCard__HostSearch'}>
      <span className={'QuorumCard__HostSearchLabel'}>Find node</span>
      <input
        type={'search'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={'IP or proTx'}
        autoComplete={'off'}
        spellCheck={false}
        aria-label={'Find node by IP or proTx'}
        className={'QuorumCard__HostSearchInput'}
      />
    </label>
  )
}

function HostButton({
  row,
  index,
  onClick
}: {
  row: any
  index: number
  onClick: (proTx: string) => void
}) {
  return (
    <button
      type={'button'}
      data-type={row.dataType}
      className={
        `QuorumCard__Host QuorumCard__Host--${row.type}` +
        (row.inPinned ? ' is-in-pin' : '') +
        (row.isFocus ? ' is-focus' : '') +
        (row.isProposer ? ' is-proposer' : '')
      }
      onClick={() => onClick(row.proTxHash)}
    >
      <span className={'QuorumCard__HostIdx'}>{index > 0 ? `#${index}` : ''}</span>
      {row.cc ? (
        <Image
          className={'QuorumCard__HostFlag'}
          src={`/flags/circle/${row.cc.toLowerCase()}.svg`}
          alt={row.cc}
          width={14}
          height={14}
          unoptimized
        />
      ) : row.geoPending ? (
        <Skeleton className={'QuorumCard__HostFlag'} w={14} h={14} circle />
      ) : (
        <span className={'QuorumCard__HostFlag is-empty'} aria-hidden={'true'} />
      )}
      <span title={row.host}>{row.host}</span>
    </button>
  )
}

function TipRow({ label, href, children, mono }: any) {
  const value = <b className={mono ? 'QuorumCard__TipMono' : undefined}>{children}</b>
  return (
    <div className={'QuorumCard__TipRow'}>
      <span>{label}</span>
      {href ? (
        <Link href={href} className={'QuorumCard__TipLink'} onClick={e => e.stopPropagation()}>
          {value}
        </Link>
      ) : (
        value
      )}
    </div>
  )
}

function NodeTooltipBody({ cell }: any) {
  const v = cell.validator
  const title = cell.homeIndex != null ? `#${cell.homeIndex}` : shortHash(cell.proTxHash, 6, 6)

  const cc = v?.geoIpInfo?.countryCode
  const ccName = cc ? countryName(cc) : null
  const geoPending = Boolean(cell.geoPending && !cc)
  const proposed = v?.proposedBlocksAmount
  const validatorHref = cell.proTxHash ? `/validator/${cell.proTxHash}` : null

  return (
    <div className={'QuorumCard__Tip'}>
      <div className={'QuorumCard__TipHead'}>
        {cc && (
          <Image
            className={'QuorumCard__TipFlag'}
            src={`/flags/circle/${cc.toLowerCase()}.svg`}
            alt={''}
            width={22}
            height={22}
            unoptimized
            onError={e => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        {geoPending && <Skeleton className={'QuorumCard__TipFlag'} w={22} h={22} circle />}
        <div className={'QuorumCard__TipHeadText'}>
          <div className={'QuorumCard__TipStatus'}>{title}</div>
          {ccName && (
            <div className={'QuorumCard__TipCountry'}>
              {ccName} · {cc}
            </div>
          )}
        </div>
      </div>
      <TipRow label={'proTx'} href={validatorHref}>
        {shortHash(cell.proTxHash, 6, 6)}
      </TipRow>
      {cell.service && (
        <TipRow label={'Host'} mono>
          {cell.service}
        </TipRow>
      )}
      {typeof proposed === 'number' && (
        <TipRow label={'Validated'} href={validatorHref}>
          {proposed.toLocaleString('en-US')} blocks
        </TipRow>
      )}
      {cell.proposeHint && <TipRow label={'Proposing'}>{cell.proposeHint}</TipRow>}
    </div>
  )
}

export default function QuorumCard({
  validators,
  validatorsActive: _validatorsActive,
  validatorsBanned: _validatorsBanned,
  validatorsInactive: _validatorsInactive,
  validatorsList,
  poolLoading,
  bannedValidatorsList,
  bannedListLoading: _bannedListLoading,
  currentQuorum,
  currentQuorumLoading,
  currentQuorumError,
  quorums,
  l1LockedHeight,
  lastProposerProTx,
  avgBlockTimeSec
}: any) {
  const queryClient = useQueryClient()
  const [pin, setPin] = useState<string | null>(null)
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [hostQuery, setHostQuery] = useState('')
  const [loadAllDetails, setLoadAllDetails] = useState(false)
  const pickRef = useRef<HTMLDivElement | null>(null)
  const hostsRef = useRef<HTMLDivElement | null>(null)
  const nodeNumberRef = useRef(new Map<string, number>())
  const nextNodeNumberRef = useRef(1)

  const total = validators?.data?.pagination?.total

  const hasTotal = typeof total === 'number' && total > 0

  const currentMembers = Array.isArray(currentQuorum?.members) ? currentQuorum.members : null
  const hasRoster = Boolean(currentMembers && currentMembers.length > 0)
  const lastProposerKey = memberKey(lastProposerProTx)

  const sortedQuorums = useMemo(() => {
    const list = [...(Array.isArray(quorums) ? quorums : [])]
      .filter(q => q?.quorumHash)
      .sort((a, b) => (quorumHeight(b) ?? 0) - (quorumHeight(a) ?? 0))
    if (!list.length) return []
    const liveKey = quorumKey(currentQuorum?.quorumHash)
    const liveI = list.findIndex(
      q => Boolean(q.isCurrent) || (liveKey && quorumKey(q.quorumHash) === liveKey)
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

  useEffect(() => {
    const el = pickRef.current
    if (!el) return
    const sync = () => {
      const max = Math.max(0, el.scrollWidth - el.clientWidth)
      if (max < 2) {
        el.dataset.overflow = 'none'
        return
      }
      const left = el.scrollLeft > 2
      const right = el.scrollLeft < max - 2
      el.dataset.overflow = left && right ? 'both' : left ? 'start' : 'end'
    }
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', sync)
      ro.disconnect()
    }
  }, [sortedQuorums.length])

  const liveHash = typeof currentQuorum?.quorumHash === 'string' ? currentQuorum.quorumHash : null
  const liveKey = quorumKey(liveHash)
  const nextHash = sortedQuorums.find(q => q.offset === 1)?.quorumHash ?? null
  const nextKey = quorumKey(nextHash)
  const pinnedQuorumHashEarly =
    typeof pin === 'string' && pin.startsWith('q:') ? pin.slice(2) : null
  const pinnedKey = quorumKey(pinnedQuorumHashEarly)
  const selectedKey = pinnedKey || liveKey
  const viewingLiveQuorum = !pinnedKey || pinnedKey === liveKey
  const showLastProposer = Boolean(lastProposerKey && viewingLiveQuorum)
  const selectedMeta = sortedQuorums.find(q => quorumKey(q.quorumHash) === selectedKey) || null
  const selectedOffset = selectedMeta?.offset ?? 0
  const rotN = sortedQuorums.length
  const neighborAt = (delta: number) => {
    if (rotN < 2) return ''
    const at = (((selectedOffset + delta) % rotN) + rotN) % rotN
    const key = quorumKey(sortedQuorums.find(q => q.offset === at)?.quorumHash)
    return key && key !== selectedKey ? key : ''
  }
  const prevKey = neighborAt(-1)
  const followKey = neighborAt(1)

  useEffect(() => {
    const el = pickRef.current
    if (!el || !pinnedKey) return
    const on = el.querySelector('.QuorumCard__QBtn.is-on')
    if (!(on instanceof HTMLElement)) return
    on.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
  }, [pinnedKey])

  const detailQueries = useQueries({
    queries: sortedQuorums.map(q => {
      const hash = q.quorumHash as string
      const key = quorumKey(hash)
      const isLive = Boolean(key && key === liveKey)
      const needed =
        key === nextKey ||
        key === pinnedKey ||
        key === prevKey ||
        key === followKey ||
        loadAllDetails
      return {
        queryKey: ['home', 'quorums', 'detail', key],
        queryFn: () => fetchQuorumDetail(hash),
        enabled: Boolean(hash && !isLive && needed),
        staleTime: QUORUM_DETAIL_STALE,
        retry: 1
      }
    })
  })

  useEffect(() => {
    const selected = sortedQuorums.find(q => quorumKey(q.quorumHash) === pinnedKey)
    const prefetchOffset = pinnedQuorumHashEarly ? (selected?.offset ?? 0) + 1 : 1
    const target = sortedQuorums.find(q => q.offset === prefetchOffset)
    const hash = target?.quorumHash
    const key = quorumKey(hash)
    if (!hash || !key || key === liveKey) return
    void queryClient.prefetchQuery({
      queryKey: ['home', 'quorums', 'detail', key],
      queryFn: () => fetchQuorumDetail(hash),
      staleTime: QUORUM_DETAIL_STALE
    })
  }, [liveKey, pinnedKey, pinnedQuorumHashEarly, prevKey, followKey, queryClient, sortedQuorums])

  const detailStamp = detailQueries
    .map(
      q =>
        `${q.dataUpdatedAt}:${q.data?.quorumHash || ''}:${Array.isArray(q.data?.members) ? q.data.members.length : 0}`
    )
    .join('|')

  const membersByHash = useMemo(() => {
    const map = new Map<string, any[]>()
    const put = (hash: unknown, members: unknown) => {
      const key = quorumKey(hash)
      if (!key || !Array.isArray(members)) return
      map.set(key, members)
    }
    put(liveHash, currentQuorum?.members)
    for (const q of detailQueries) put(q.data?.quorumHash, q.data?.members)
    return map
  }, [currentQuorum?.members, detailStamp, liveHash])

  const sortedQuorumsWithMembers = useMemo(
    () =>
      sortedQuorums.map(q => {
        const members = membersByHash.get(quorumKey(q.quorumHash))
        return members ? { ...q, members } : q
      }),
    [membersByHash, sortedQuorums]
  )

  const rosterIndex = useMemo(() => {
    const byNode = new Map()
    const membersOf = new Map()
    for (const q of sortedQuorumsWithMembers) {
      const hash = q.quorumHash
      const key = quorumKey(hash) || hash
      const set = new Set()
      for (const m of q.members || []) {
        const k = memberKey(m.proTxHash)
        if (!k) continue
        set.add(k)
        const arr = byNode.get(k) || []
        arr.push({ hash: key, index: q.offset, isCurrent: q.isLive })
        byNode.set(k, arr)
      }
      membersOf.set(key, set)
      if (hash && hash !== key) membersOf.set(hash, set)
    }
    for (const arr of byNode.values()) {
      arr.sort((a: any, b: any) => {
        if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1
        return a.index - b.index
      })
    }
    return { byNode, membersOf }
  }, [sortedQuorumsWithMembers])

  const memberMeta = useMemo(() => {
    const map = new Map()
    for (const q of sortedQuorumsWithMembers) {
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
  }, [sortedQuorumsWithMembers, currentMembers])

  const llmq = parseLlmqType(currentQuorum?.type)
  const rosterSize = currentMembers?.length ?? llmq?.size ?? null
  const quorumSize = llmq?.size ?? rosterSize ?? 100
  const gridCols = gridSide(quorumSize)

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
  const selectedMemberSet = useMemo(() => {
    const k = selectedKey
    if (!k) return new Set<string>()
    return rosterIndex.membersOf.get(k) || new Set<string>()
  }, [rosterIndex, selectedKey])
  const selectedIdx = sortedQuorums.findIndex(q => quorumKey(q.quorumHash) === selectedKey)
  const selectedQuery = selectedIdx >= 0 ? detailQueries[selectedIdx] : null
  const selectedQueryPending = Boolean(
    selectedKey && selectedKey !== liveKey && selectedQuery && !selectedQuery.isFetched
  )
  const filling = Boolean(
    currentQuorumLoading ||
      selectedQueryPending ||
      (Boolean(selectedKey) && selectedMemberSet.size === 0 && !currentQuorumError)
  )

  const windowKeys = useMemo(() => {
    if (filling) return []
    const selected = sortedQuorumsWithMembers.find(q => quorumKey(q.quorumHash) === selectedKey)
    return memberKeysInCoreOrder(selected?.members)
  }, [filling, sortedQuorumsWithMembers, selectedKey])

  const liveSeedKeys = useMemo(() => {
    const live = sortedQuorumsWithMembers.find(q => quorumKey(q.quorumHash) === liveKey)
    return sortProTxKeys(memberKeysInCoreOrder(live?.members ?? currentMembers))
  }, [sortedQuorumsWithMembers, liveKey, currentMembers])

  const selectedSeedKeys = useMemo(() => sortProTxKeys(windowKeys), [windowKeys])

  const listKeys = useMemo(() => {
    if (filling) return []
    const seen = new Set<string>()
    const rest: string[] = []
    const pushRest = (k: string, allowBanned: boolean) => {
      if (!k || seen.has(k)) return
      if (!allowBanned && bannedSet.has(k)) return
      seen.add(k)
      rest.push(k)
    }
    for (const k of liveSeedKeys) seen.add(k)
    for (const k of windowKeys) pushRest(k, true)
    for (const v of list) pushRest(memberKey(v.proTxHash), false)
    for (const set of rosterIndex.membersOf.values()) {
      for (const k of set) pushRest(k, false)
    }
    return [...liveSeedKeys.filter(Boolean), ...sortProTxKeys(rest)]
  }, [filling, liveSeedKeys, windowKeys, list, rosterIndex, bannedSet])

  const nodeNumberByKey = useMemo(() => {
    const map = nodeNumberRef.current
    if (filling) return new Map(map)
    for (const k of listKeys) {
      if (k && !map.has(k)) map.set(k, nextNodeNumberRef.current++)
    }
    return new Map(map)
  }, [filling, listKeys])

  const homeCells = useMemo((): any[] => {
    if (filling) {
      return Array.from({ length: quorumSize }, (_, index) => ({
        kind: 'skel',
        type: 'skel',
        index
      }))
    }
    const prevSet = rosterIndex.membersOf.get(prevKey) || new Set<string>()
    const byKey = new Map<string, any>()
    for (const v of list) {
      const k = memberKey(v.proTxHash)
      if (k) byKey.set(k, v)
    }
    for (const v of Array.isArray(bannedValidatorsList) ? bannedValidatorsList : []) {
      const k = memberKey(v?.proTxHash)
      if (k && !byKey.has(k)) byKey.set(k, v)
    }
    const cells = windowKeys.map(k => {
      const v = byKey.get(k)
      const painted = paintPoolNode(
        k,
        selectedMemberSet,
        prevSet,
        memberMeta,
        bannedSet.has(k) || isPoSeBannedValidator(v)
      )
      const meta = memberMeta?.get(k)
      return {
        kind: 'node',
        type: painted.type,
        role: painted.role,
        band: painted.band,
        homeIndex: nodeNumberByKey.get(k) ?? null,
        proTxHash: v?.proTxHash || k,
        service: meta?.service || v?.proTxInfo?.state?.service || v?.endpoints?.[0] || null,
        valid: meta ? meta.valid !== false : true,
        validator: v || { proTxHash: k },
        geoPending: Boolean(poolLoading && !(typeof v?.geoIpInfo?.countryCode === 'string'))
      }
    })
    cells.sort((a, b) => (a.homeIndex ?? 0) - (b.homeIndex ?? 0))
    return cells
  }, [
    filling,
    poolLoading,
    windowKeys,
    list,
    memberMeta,
    rosterIndex,
    prevKey,
    selectedMemberSet,
    nodeNumberByKey,
    bannedSet,
    bannedValidatorsList,
    quorumSize
  ])

  const windowSlots = useMemo(() => {
    const set = new Set<number>()
    for (let i = 0; i < homeCells.length; i++) {
      const cell = homeCells[i]
      if (cell.kind !== 'node' || !cell.proTxHash) continue
      if (selectedMemberSet.has(memberKey(cell.proTxHash))) set.add(i)
    }
    return set
  }, [homeCells, selectedMemberSet])
  const windowCount = windowSlots.size
  const headLabel = selectedOffset <= 0 ? 'Now' : selectedOffset === 1 ? 'Next' : 'Turn'
  const headCore = selectedMeta?.blockHeight ?? selectedMeta?.creationHeight
  const headTurn = typeof headCore === 'number' ? `Core ${headCore.toLocaleString('en-US')}` : '—'
  const quorumEta = useMemo(() => {
    const step = quorumStep(sortedQuorums)
    const heights = sortedQuorums.map(quorumHeight).filter((n): n is number => n != null)
    if (!heights.length || step <= 0) return null
    const maxH = Math.max(...heights)
    const liveH = quorumHeight(sortedQuorums.find(q => q.isLive))
    const tip =
      typeof l1LockedHeight === 'number' && l1LockedHeight > 0 ? l1LockedHeight : (liveH ?? maxH)
    let toNext = step
    if (tip <= maxH) toNext = maxH + step - tip
    else {
      const r = (tip - maxH) % step
      toNext = r === 0 ? step : step - r
    }
    const offset = Math.max(0, selectedOffset)
    const blocks = offset <= 0 ? toNext : toNext + (offset - 1) * step
    return {
      kind: offset <= 0 ? 'left' : 'in',
      end: new Date(Date.now() + Math.max(1, blocks) * CORE_BLOCK_SEC * 1000)
    }
  }, [sortedQuorums, selectedOffset, l1LockedHeight])
  const headHash =
    typeof selectedMeta?.quorumHash === 'string' && selectedMeta.quorumHash.length > 0
      ? selectedMeta.quorumHash.toLowerCase()
      : null
  const headHref = headHash ? `https://dashscan.io/blocks/${headHash}` : null

  const togglePin = (key: any) => setPin(p => (p === key ? null : key))

  const focusNode = (proTx: any) => {
    const key = memberKey(proTx)
    if (!key) return
    setFocusKey(k => (k === key ? null : key))
    setLoadAllDetails(true)
  }

  const signedHashes = useMemo(() => {
    const set = new Set<string>()
    if (!focusKey) return set
    for (const q of rosterIndex.byNode.get(focusKey) || []) {
      if (q?.hash) set.add(q.hash)
    }
    return set
  }, [focusKey, rosterIndex])

  useEffect(() => {
    if (!hostsRef.current) return
    const sel = focusKey
      ? '.QuorumCard__Host.is-focus'
      : hostQuery.trim()
        ? '.QuorumCard__Host'
        : null
    if (!sel) return
    const row = hostsRef.current.querySelector(sel)
    if (row instanceof HTMLElement) row.scrollIntoView({ block: 'nearest' })
  }, [focusKey, hostQuery])

  const matrixAria =
    (hasTotal ? `${total} validators` : 'Validator pool') +
    (hasRoster && rosterSize != null ? `, ${rosterSize} in current quorum` : '')

  const cells = homeCells

  const hostRows = useMemo(() => {
    if (filling) return []
    const prevSet = rosterIndex.membersOf.get(prevKey) || new Set<string>()
    const byKey = new Map<string, any>()
    for (const v of list) {
      const k = memberKey(v.proTxHash)
      if (k) byKey.set(k, v)
    }
    for (const v of Array.isArray(bannedValidatorsList) ? bannedValidatorsList : []) {
      const k = memberKey(v?.proTxHash)
      if (k && !byKey.has(k)) byKey.set(k, v)
    }
    const rows = listKeys.map(k => {
      const v = byKey.get(k)
      const painted = paintPoolNode(
        k,
        selectedMemberSet,
        prevSet,
        memberMeta,
        bannedSet.has(k) || isPoSeBannedValidator(v)
      )
      const meta = memberMeta?.get(k)
      const cell = {
        type: painted.type,
        proTxHash: v?.proTxHash || k,
        service: meta?.service || v?.proTxInfo?.state?.service || v?.endpoints?.[0] || null,
        validator: v || { proTxHash: k }
      }
      const dataType =
        painted.type === 'invalid' || painted.type === 'banned'
          ? painted.type === 'banned'
            ? 'banned'
            : 'active'
          : painted.type === 'idle'
            ? 'total'
            : painted.type
      const rawHost = nodeHost(cell)
      const cc =
        typeof cell.validator?.geoIpInfo?.countryCode === 'string'
          ? cell.validator.geoIpInfo.countryCode
          : null
      return {
        key: k,
        proTxHash: cell.proTxHash,
        host: rawHost ? stripPort(rawHost) : shortHash(cell.proTxHash, 6, 6),
        type: painted.type,
        dataType,
        cc,
        geoPending: Boolean(poolLoading && !cc),
        inPinned: selectedMemberSet.has(k),
        isFocus: Boolean(focusKey && focusKey === k),
        isProposer: Boolean(showLastProposer && k === lastProposerKey),
        homeIndex: nodeNumberByKey.get(k) ?? null
      }
    })
    rows.sort((a, b) => (a.homeIndex ?? 0) - (b.homeIndex ?? 0))
    return rows
  }, [
    filling,
    poolLoading,
    listKeys,
    list,
    bannedValidatorsList,
    rosterIndex,
    prevKey,
    selectedMemberSet,
    memberMeta,
    bannedSet,
    nodeNumberByKey,
    lastProposerKey,
    showLastProposer,
    focusKey
  ])

  const visibleHostRows = useMemo(
    () => (hostQuery.trim() ? hostRows.filter(row => hostMatches(row, hostQuery)) : hostRows),
    [hostRows, hostQuery]
  )
  const searchMatchKeys = useMemo(() => {
    if (!hostQuery.trim()) return null
    return new Set(visibleHostRows.map(row => row.key))
  }, [hostQuery, visibleHostRows])

  useEffect(() => {
    if (!searchMatchKeys || searchMatchKeys.size !== 1) return
    const only = visibleHostRows[0]?.proTxHash
    if (only) {
      setFocusKey(memberKey(only))
      setLoadAllDetails(true)
    }
  }, [searchMatchKeys, visibleHostRows])

  const queuedKeysCount = listKeys.filter(k => !selectedMemberSet.has(k)).length
  const nowCount = windowKeys.length
  const nowFixed = quorumSize
  const groupCount = sortedQuorums.length || 24
  const poolReady = !poolLoading && !filling && listKeys.length > 0
  const counts: Record<string, number | null> = {
    total: poolReady ? nowCount + queuedKeysCount : null,
    inactive: poolReady ? queuedKeysCount : null,
    active: nowFixed
  }

  return (
    <Box
      className={'InfoBlock InfoBlock--NoBorder QuorumCard'}
      w={'100%'}
      as={'section'}
      aria-label={'Quorums'}
    >
      <div className={'QuorumCard__Glow'} aria-hidden={'true'} />

      <header className={'QuorumCard__Head'}>
        <div className={'QuorumCard__HeadTop'}>
          <div className={'QuorumCard__HeadText'}>
            <span className={'QuorumCard__Eyebrow'}>Consensus</span>
            <h2 className={'QuorumCard__Title'}>Quorums</h2>
          </div>
          <div className={'QuorumCard__Legend'} role={'group'} aria-label={'Validator counts'}>
            {STATS.map(s => {
              const n = counts[s.key]
              const ready = typeof n === 'number'
              const nowOn = pin === 'active' || (Boolean(pinnedKey) && pinnedKey === liveKey)
              const pressed = s.key === 'active' ? nowOn : pin === s.key
              return (
                <Tooltip key={s.key} placement={'top'} content={s.hint}>
                  <button
                    type={'button'}
                    data-type={s.key}
                    className={`QuorumCard__Leg QuorumCard__Leg--${s.key}${pressed ? ' is-on' : ''}`}
                    onClick={() => {
                      if (s.key === 'active' && liveHash) {
                        togglePin(`q:${liveHash}`)
                        return
                      }
                      togglePin(s.key)
                    }}
                    aria-pressed={pressed}
                    disabled={!ready}
                  >
                    <span className={'QuorumCard__LegLabel'}>
                      <i className={`QuorumCard__Dot QuorumCard__Dot--${s.key}`} />
                      {s.label}
                    </span>
                    <b>
                      {ready ? (
                        n.toLocaleString('en-US')
                      ) : (
                        <Skeleton w={'3.2ch'} h={'0.95em'} radius={4} />
                      )}
                    </b>
                  </button>
                </Tooltip>
              )
            })}
          </div>
        </div>
        <div className={'QuorumCard__HeadBottom'}>
          <p className={'QuorumCard__Lede'}>
            <span className={'QuorumCard__LedeLine'}>
              <a
                className={'QuorumCard__BlockLink'}
                href={
                  'https://docs.dash.org/en/stable/docs/user/masternodes/understanding.html#evolution-masternodes-evonodes'
                }
                target={'_blank'}
                rel={'noreferrer'}
              >
                Evonodes
              </a>{' '}
              are grouped in quorums
            </span>
            <span className={'QuorumCard__LedeLine'}>and they take turns in proposing blocks</span>
            <span className={'QuorumCard__LegendsSlot'}>
              <Tooltip
                placement={'top'}
                className={'QuorumCard__HelpTipTooltip'}
                content={
                  <div className={'QuorumCard__HelpTip'}>
                    <p>
                      A{' '}
                      <a
                        className={'QuorumCard__HelpMark'}
                        href={'https://docs.dash.org/en/stable/docs/core/dips/dip-0006.html'}
                        target={'_blank'}
                        rel={'noreferrer'}
                        onClick={e => e.stopPropagation()}
                      >
                        quorum
                      </a>{' '}
                      is {nowFixed} evonodes.{' '}
                      <a
                        className={'QuorumCard__HelpMark'}
                        href={
                          'https://docs.dash.org/en/stable/docs/core/guide/dash-features-masternode-quorums.html'
                        }
                        target={'_blank'}
                        rel={'noreferrer'}
                        onClick={e => e.stopPropagation()}
                      >
                        {groupCount} groups
                      </a>{' '}
                      take turns signing.
                    </p>
                    <ul className={'QuorumCard__HelpKeys'} aria-label={'Color legend'}>
                      <li className={'QuorumCard__HelpKey'}>
                        <span
                          className={'QuorumCard__HelpChip QuorumCard__HelpChip--active'}
                          aria-hidden={'true'}
                        />
                        <span>Proposing this quorum</span>
                      </li>
                      <li className={'QuorumCard__HelpKey'}>
                        <span
                          className={'QuorumCard__HelpChip QuorumCard__HelpChip--done'}
                          aria-hidden={'true'}
                        />
                        <span>Already proposed this turn</span>
                      </li>
                      <li className={'QuorumCard__HelpKey'}>
                        <span
                          className={'QuorumCard__HelpChip QuorumCard__HelpChip--next'}
                          aria-hidden={'true'}
                        />
                        <span>From the previous quorum</span>
                      </li>
                      <li className={'QuorumCard__HelpKey'}>
                        <span
                          className={'QuorumCard__HelpChip QuorumCard__HelpChip--proposer'}
                          aria-hidden={'true'}
                        />
                        <span>Proposed the last block</span>
                      </li>
                      <li className={'QuorumCard__HelpKey'}>
                        <span
                          className={'QuorumCard__HelpChip QuorumCard__HelpChip--inactive'}
                          aria-hidden={'true'}
                        />
                        <span>In the next turns, waiting</span>
                      </li>
                      <li className={'QuorumCard__HelpKey'}>
                        <span
                          className={'QuorumCard__HelpChip QuorumCard__HelpChip--banned'}
                          aria-hidden={'true'}
                        />
                        <span>
                          <a
                            className={'QuorumCard__HelpMark'}
                            href={'https://docs.dash.org/en/stable/docs/core/dips/dip-0003.html'}
                            target={'_blank'}
                            rel={'noreferrer'}
                            onClick={e => e.stopPropagation()}
                          >
                            Banned
                          </a>{' '}
                          nodes
                        </span>
                      </li>
                    </ul>
                  </div>
                }
              >
                <button type={'button'} className={'QuorumCard__Legends'}>
                  Legend
                </button>
              </Tooltip>
            </span>
          </p>
          <p className={'QuorumCard__QCaption'}>
            {sortedQuorums.length > 0 ? (
              <>
                {headHref ? (
                  <a
                    href={headHref}
                    target={'_blank'}
                    rel={'noreferrer'}
                    className={'QuorumCard__BlockLink'}
                  >
                    <BlockIcon
                      className={'QuorumCard__CaptionIcon'}
                      w={'0.875rem'}
                      h={'0.875rem'}
                      aria-hidden={'true'}
                    />
                    {headTurn}
                  </a>
                ) : (
                  <span className={'QuorumCard__BlockLink'}>
                    <BlockIcon
                      className={'QuorumCard__CaptionIcon'}
                      w={'0.875rem'}
                      h={'0.875rem'}
                      aria-hidden={'true'}
                    />
                    {headTurn}
                  </span>
                )}
                {quorumEta && (
                  <span
                    className={'QuorumCard__QEta'}
                    title={`About ${quorumStep(sortedQuorums)} Core blocks per turn (~2.5 min each)`}
                  >
                    ~{quorumEta.kind === 'in' ? 'in ' : ''}
                    <TimeDelta
                      endDate={quorumEta.end}
                      format={'compact'}
                      showTimestampTooltip={false}
                    />
                    {quorumEta.kind === 'left' ? ' left' : ''}
                  </span>
                )}
              </>
            ) : (
              <>
                <Skeleton w={'11ch'} h={'0.8em'} radius={4} />
                <Skeleton w={'6ch'} h={'0.8em'} radius={4} />
              </>
            )}
          </p>
        </div>
      </header>

      {currentQuorumError && !hasRoster && !currentQuorumLoading && (
        <p className={'QuorumCard__FallbackNote'}>
          Detailed signing roster unavailable. Pool uses explorer active/queued flags only.
        </p>
      )}

      <div className={'QuorumCard__Body'}>
        <div
          className={
            `QuorumCard__Stage` +
            (pin ? ' is-pinned' : '') +
            (windowCount > 0 && !filling ? ' is-window' : '')
          }
          data-pin={pin || undefined}
          data-window={selectedOffset === 1 ? 'next' : selectedOffset > 1 ? 'later' : 'live'}
        >
          <div className={'QuorumCard__Col'}>
            <div className={'QuorumCard__MatrixWrap'}>
              <div
                className={'QuorumCard__Matrix' + (filling ? ' QuorumCard__Matrix--skel' : '')}
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${Math.max(1, Math.ceil(cells.length / gridCols))}, minmax(0, 1fr))`
                }}
                role={'img'}
                aria-label={matrixAria}
              >
                {cells.map((cell, slot) => {
                  if (cell.kind === 'skel' || cell.kind === 'idle') {
                    return (
                      <span
                        key={slot}
                        className={`QuorumCard__Cell QuorumCard__Cell--${cell.kind === 'skel' ? 'skel' : 'idle'}`}
                      />
                    )
                  }

                  const dataType =
                    cell.type === 'invalid' ? 'active' : cell.type === 'idle' ? 'total' : cell.type

                  const cc = cell.validator?.geoIpInfo?.countryCode
                  const ccName = cc ? countryName(cc) : null
                  const roleHint =
                    cell.band === 'carry'
                      ? `from previous, signing ${headLabel}`
                      : cell.role === 'current'
                        ? `signing ${headLabel}`
                        : cell.role === 'next'
                          ? `from previous`
                          : cell.role

                  const nodeKey = memberKey(cell.proTxHash)
                  const inPinned = windowSlots.has(slot)
                  const isFocus = Boolean(focusKey && focusKey === nodeKey)
                  const isSearchHit = Boolean(searchMatchKeys?.has(nodeKey))
                  const hostIdx = cell.homeIndex
                  const isProposer = Boolean(showLastProposer && nodeKey === lastProposerKey)
                  const avgSec = typeof avgBlockTimeSec === 'number' ? avgBlockTimeSec : null
                  const proposeHint = viewingLiveQuorum
                    ? proposeHintFor(nodeKey, lastProposerKey, liveSeedKeys, avgSec)
                    : proposeHintFor(nodeKey, lastProposerKey, selectedSeedKeys, avgSec, {
                        liveOrdered: liveSeedKeys,
                        offset: selectedOffset
                      })

                  const tile = (
                    <button
                      type={'button'}
                      data-type={dataType}
                      data-role={cell.role}
                      data-band={cell.band || undefined}
                      className={
                        `QuorumCard__Cell QuorumCard__Cell--${cell.type}` +
                        (inPinned ? ' is-in-pin' : '') +
                        (isFocus ? ' is-focus' : '') +
                        (isSearchHit ? ' is-search-hit' : '') +
                        (cell.band === 'carry' ? ' is-carry' : '') +
                        (isProposer ? ' is-proposer' : '') +
                        (proposeHint === 'finished' ? ' is-done' : '')
                      }
                      aria-label={
                        `${hostIdx != null ? `#${hostIdx}, ` : ''}` +
                        `${shortHash(cell.proTxHash)}, ${roleHint}` +
                        (isProposer ? ', last block proposer' : '') +
                        (ccName ? `, ${ccName}` : '')
                      }
                      aria-pressed={inPinned || undefined}
                      onClick={() => focusNode(cell.proTxHash)}
                    >
                      {hostIdx != null && <RollingIdx value={hostIdx} />}
                    </button>
                  )

                  return (
                    <Tooltip
                      key={slot}
                      placement={'top'}
                      content={<NodeTooltipBody cell={{ ...cell, isProposer, proposeHint }} />}
                    >
                      {tile}
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          </div>

          <div className={'QuorumCard__Side'}>
            {sortedQuorums.length > 0 && (
              <div
                ref={pickRef}
                className={'QuorumCard__QPick pe-QuietScroll'}
                role={'group'}
                aria-label={'Signing rotation'}
                tabIndex={0}
              >
                {sortedQuorums.map((q, i) => {
                  const qk = quorumKey(q.quorumHash)
                  const on = qk === selectedKey
                  const signed = Boolean(qk && signedHashes.has(qk))
                  const formedHeight = q.blockHeight ?? q.creationHeight
                  const heightLabel =
                    typeof formedHeight === 'number' && formedHeight > 0
                      ? String(formedHeight)
                      : '—'
                  const slot = i + 1
                  return (
                    <button
                      key={q.quorumHash}
                      type={'button'}
                      className={
                        `QuorumCard__QBtn${on ? ' is-on' : ''}${q.isLive ? ' is-live' : ''}` +
                        (signed ? ' is-signed' : '')
                      }
                      aria-label={`Quorum ${slot} of ${sortedQuorums.length}, Core ${heightLabel}`}
                      aria-pressed={on}
                      onClick={() => togglePin(`q:${q.quorumHash}`)}
                    >
                      <span className={'QuorumCard__QBtnIdx'}>#{slot}</span>
                      <span className={'QuorumCard__QBtnHeight'}>{heightLabel}</span>
                    </button>
                  )
                })}
              </div>
            )}
            <div className={'QuorumCard__HostsClip'}>
              {hostRows.length > 0 && <HostSearch value={hostQuery} onChange={setHostQuery} />}
              <div
                ref={hostsRef}
                className={'QuorumCard__Hosts pe-QuietScroll'}
                aria-label={'Masternode addresses'}
              >
                {hostRows.length === 0 ? (
                  <p className={'QuorumCard__HostsEmpty'}>
                    {filling ? 'Loading addresses…' : 'No addresses'}
                  </p>
                ) : visibleHostRows.length === 0 ? (
                  <p className={'QuorumCard__HostsEmpty'}>No matching node</p>
                ) : (
                  <div className={'QuorumCard__HostsGrid'}>
                    {visibleHostRows.map(row => (
                      <HostButton
                        key={row.key}
                        row={row}
                        index={row.homeIndex ?? 0}
                        onClick={focusNode}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}
