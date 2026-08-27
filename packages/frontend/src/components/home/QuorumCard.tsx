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
import { useActiveNetwork } from '../../contexts'
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

const GRID_COLS = 10
const SKELETON_SLOTS = 100
const FALLBACK_BLOCK_SEC = 5

function formatApproxTurn(ms: number) {
  const d = new Date(ms)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
  return `~${date} ${time}`
}

function approxTurnMs(offset: number, blockSec: unknown, signers: number) {
  const sec = typeof blockSec === 'number' && blockSec > 0 ? blockSec : FALLBACK_BLOCK_SEC
  const n = signers > 0 ? signers : 100
  return Date.now() + offset * n * sec * 1000
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

function quorumKey(hash: unknown) {
  return typeof hash === 'string' && hash.length ? hash.toUpperCase() : ''
}

const STATS = [
  {
    key: 'total',
    label: 'Total',
    hint: 'This quorum plus queued. Banned are counted separately.'
  },
  {
    key: 'active',
    label: 'Now',
    hint: 'Members of this quorum. Yellow cells are already in this 100 — they also sat in the previous set.'
  },
  {
    key: 'inactive',
    label: 'Queued',
    hint: 'Unbanned evonodes not in this quorum'
  }
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

function orderWindowKeys(curr: string[], prevSet: Set<string>, followSet: Set<string>) {
  const fromPrev = curr.filter(k => prevSet.has(k))
  const toFollow = curr.filter(k => followSet.has(k) && !prevSet.has(k))
  const unique = curr.filter(k => !prevSet.has(k) && !followSet.has(k))
  return fromPrev.concat(unique, toFollow)
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
        (row.isFocus ? ' is-focus' : '')
      }
      onClick={() => onClick(row.proTxHash)}
    >
      <span className={'QuorumCard__HostIdx'}>{index}</span>
      {row.cc ? (
        <Image
          className={'QuorumCard__HostFlag'}
          src={`/flags/circle/${row.cc.toLowerCase()}.svg`}
          alt={row.cc}
          width={14}
          height={14}
          unoptimized
        />
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
  const status = (() => {
    if (cell.role === 'banned') {
      return isPoSeBannedValidator(cell.validator)
        ? 'Banned (PoSe)'
        : 'Banned / not in registered set'
    }
    if (cell.band === 'carry') return 'This turn and the following one'
    if (cell.band === 'upcoming') return 'New in the following turn'
    if (cell.role === 'invalid') return 'In this turn · invalid'
    if (cell.role === 'next') return 'Following turn (orange)'
    if (cell.role === 'current' || cell.role === 'active') return 'This turn (green)'
    return 'Queued'
  })()

  const cc = v?.geoIpInfo?.countryCode
  const ccName = cc ? countryName(cc) : null
  const proposed = v?.proposedBlocksAmount
  const validatorHref = cell.proTxHash ? `/validator/${cell.proTxHash}` : null
  const identityHref = v?.identity ? `/identity/${v.identity}` : null

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
        <div className={'QuorumCard__TipHeadText'}>
          <div className={'QuorumCard__TipStatus'}>{status}</div>
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
        <TipRow label={'Proposed'} href={validatorHref}>
          {proposed.toLocaleString('en-US')} blocks
        </TipRow>
      )}
      {identityHref && (
        <TipRow label={'Identity'} href={identityHref}>
          {shortHash(v.identity, 4, 4)}
        </TipRow>
      )}
      {!cc && <TipRow label={'Country'}>Unknown</TipRow>}
    </div>
  )
}

export default function QuorumCard({
  validators,
  validatorsActive,
  validatorsBanned: _validatorsBanned,
  validatorsInactive,
  validatorsList,
  poolLoading,
  bannedValidatorsList,
  bannedListLoading,
  currentQuorum,
  currentQuorumLoading,
  currentQuorumError,
  quorums,
  avgBlockTimeSec
}: any) {
  const queryClient = useQueryClient()
  const { l1explorerBaseUrl } = useActiveNetwork()
  const [pin, setPin] = useState<string | null>(null)
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [loadAllDetails, setLoadAllDetails] = useState(false)
  const pickRef = useRef<HTMLDivElement | null>(null)
  const hostsRef = useRef<HTMLDivElement | null>(null)
  const nodeNumberRef = useRef(new Map<string, number>())
  const nextNodeNumberRef = useRef(1)

  const total = validators?.data?.pagination?.total
  const active = validatorsActive?.data?.pagination?.total
  const inactive = validatorsInactive?.data?.pagination?.total

  const hasTotal = typeof total === 'number' && total > 0

  const currentMembers = Array.isArray(currentQuorum?.members) ? currentQuorum.members : null
  const hasRoster = Boolean(currentMembers && currentMembers.length > 0)

  const sortedQuorums = useMemo(() => {
    const list = [...(Array.isArray(quorums) ? quorums : [])]
      .filter(q => q?.quorumHash)
      .sort((a, b) => (a.blockHeight ?? 0) - (b.blockHeight ?? 0))
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
  const neighborQueryPending = (key: string) => {
    if (!key || key === liveKey) return false
    if ((rosterIndex.membersOf.get(key)?.size ?? 0) > 0) return false
    const idx = sortedQuorums.findIndex(q => quorumKey(q.quorumHash) === key)
    if (idx < 0) return false
    const q = detailQueries[idx]
    return Boolean(q && !q.isFetched)
  }
  const filling = Boolean(
    currentQuorumLoading ||
      selectedQueryPending ||
      neighborQueryPending(prevKey) ||
      neighborQueryPending(followKey) ||
      (Boolean(selectedKey) && selectedMemberSet.size === 0 && !currentQuorumError)
  )

  const windowKeys = useMemo(() => {
    if (filling || selectedMemberSet.size === 0) return []
    const prevSet = rosterIndex.membersOf.get(prevKey) || new Set<string>()
    const followSet = rosterIndex.membersOf.get(followKey) || new Set<string>()
    return orderWindowKeys([...selectedMemberSet], prevSet, followSet)
  }, [filling, selectedMemberSet, rosterIndex, prevKey, followKey])

  const listKeys = useMemo(() => {
    if (filling) return []
    const seen = new Set<string>()
    const keys: string[] = []
    const push = (k: string, allowBanned: boolean) => {
      if (!k || seen.has(k)) return
      if (!allowBanned && bannedSet.has(k)) return
      seen.add(k)
      keys.push(k)
    }
    for (const k of windowKeys) push(k, true)
    for (const v of list) push(memberKey(v.proTxHash), false)
    for (const set of rosterIndex.membersOf.values()) {
      for (const k of set) push(k, false)
    }
    return keys
  }, [filling, windowKeys, list, rosterIndex, bannedSet])

  const nodeNumberByKey = useMemo(() => {
    const map = nodeNumberRef.current
    if (filling) return new Map(map)
    for (const k of listKeys) {
      if (k && !map.has(k)) map.set(k, nextNodeNumberRef.current++)
    }
    return new Map(map)
  }, [filling, listKeys])

  const isLiveView = selectedOffset <= 0
  const windowIndexByKey = useMemo(() => {
    const map = new Map<string, number>()
    for (let i = 0; i < windowKeys.length; i++) map.set(windowKeys[i], i + 1)
    return map
  }, [windowKeys])

  const homeCells = useMemo((): any[] => {
    if (filling) {
      return Array.from({ length: SKELETON_SLOTS }, (_, index) => ({
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
    return windowKeys.map(k => {
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
        homeIndex: isLiveView
          ? (windowIndexByKey.get(k) ?? nodeNumberByKey.get(k) ?? null)
          : (nodeNumberByKey.get(k) ?? null),
        proTxHash: v?.proTxHash || k,
        service: meta?.service || v?.proTxInfo?.state?.service || v?.endpoints?.[0] || null,
        valid: meta ? meta.valid !== false : true,
        validator: v || { proTxHash: k }
      }
    })
  }, [
    filling,
    windowKeys,
    list,
    memberMeta,
    rosterIndex,
    prevKey,
    selectedMemberSet,
    nodeNumberByKey,
    bannedSet,
    bannedValidatorsList,
    isLiveView,
    windowIndexByKey
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
  const headTurn = formatApproxTurn(
    approxTurnMs(selectedOffset, avgBlockTimeSec, llmq?.size || 100)
  )
  const headCore = selectedMeta?.blockHeight ?? selectedMeta?.creationHeight
  const headHref =
    typeof headCore === 'number' && headCore > 0 && l1explorerBaseUrl
      ? `${l1explorerBaseUrl}/block/${headCore}`
      : null

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
    if (!focusKey || !hostsRef.current) return
    const row = hostsRef.current.querySelector('.QuorumCard__Host.is-focus')
    if (row instanceof HTMLElement) row.scrollIntoView({ block: 'nearest' })
  }, [focusKey])

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
      return {
        key: k,
        proTxHash: cell.proTxHash,
        host: rawHost ? stripPort(rawHost) : shortHash(cell.proTxHash, 6, 6),
        type: painted.type,
        dataType,
        cc:
          typeof cell.validator?.geoIpInfo?.countryCode === 'string'
            ? cell.validator.geoIpInfo.countryCode
            : null,
        inPinned: selectedMemberSet.has(k),
        isFocus: Boolean(focusKey && focusKey === k),
        homeIndex:
          isLiveView && selectedMemberSet.has(k)
            ? (windowIndexByKey.get(k) ?? nodeNumberByKey.get(k) ?? null)
            : (nodeNumberByKey.get(k) ?? null)
      }
    })
    rows.sort((a, b) => {
      if (isLiveView) {
        const aNow = selectedMemberSet.has(a.key)
        const bNow = selectedMemberSet.has(b.key)
        if (aNow !== bNow) return aNow ? -1 : 1
      }
      return (a.homeIndex ?? 0) - (b.homeIndex ?? 0)
    })
    return rows
  }, [
    filling,
    listKeys,
    list,
    bannedValidatorsList,
    rosterIndex,
    prevKey,
    selectedMemberSet,
    memberMeta,
    bannedSet,
    nodeNumberByKey,
    focusKey,
    isLiveView,
    windowIndexByKey
  ])

  const queuedKeysCount = listKeys.filter(k => !selectedMemberSet.has(k)).length
  const nowCount = windowKeys.length
  const counts: Record<string, number | null> = {
    total:
      nowCount > 0
        ? nowCount + queuedKeysCount
        : typeof active === 'number' && typeof inactive === 'number'
          ? active + inactive
          : hasTotal
            ? total
            : null,
    active: nowCount > 0 ? nowCount : typeof active === 'number' ? active : null,
    inactive: nowCount > 0 ? queuedKeysCount : typeof inactive === 'number' ? inactive : null
  }

  return (
    <Box
      className={'InfoBlock InfoBlock--NoBorder QuorumCard'}
      w={'100%'}
      as={'section'}
      aria-label={'Quorum'}
    >
      <div className={'QuorumCard__Glow'} aria-hidden={'true'} />

      <header className={'QuorumCard__Head'}>
        <div className={'QuorumCard__HeadText'}>
          <span className={'QuorumCard__Eyebrow'}>Consensus</span>
          <h2 className={'QuorumCard__Title'}>Quorum</h2>
          <p className={'QuorumCard__Lede'}>
            Only a{' '}
            <Tooltip
              placement={'top'}
              content={
                <div className={'QuorumCard__HelpTip'}>
                  <p>
                    Mainnet keeps 24 formed Platform quorums (LLMQ 100/67). Only one signs the
                    current block.
                  </p>
                  <p className={'QuorumCard__HelpFoot'}>
                    Click a quorum: 100 cells in signing order. Yellow cells stayed from the
                    previous set. The IP list is this 100 plus queued nodes; numbers stay on the
                    same IP.
                  </p>
                </div>
              }
            >
              <span className={'QuorumCard__LedeMore'}>rotating set</span>
            </Tooltip>{' '}
            of 100 evonodes signs each block.
          </p>
        </div>

        <div className={'QuorumCard__Controls'}>
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
                    <b>{ready ? n.toLocaleString('en-US') : '—'}</b>
                  </button>
                </Tooltip>
              )
            })}
          </div>
          {sortedQuorums.length > 0 && (
            <p className={'QuorumCard__QCaption'}>
              {headHref ? (
                <a
                  href={headHref}
                  target={'_blank'}
                  rel={'noreferrer'}
                  className={'QuorumCard__BlockLink'}
                >
                  {headTurn}
                </a>
              ) : (
                headTurn
              )}
            </p>
          )}
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
                className={'QuorumCard__Matrix'}
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${Math.max(1, Math.ceil(cells.length / GRID_COLS))}, minmax(0, 1fr))`
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
                  const hostIdx = cell.homeIndex

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
                        (cell.band === 'carry' ? ' is-carry' : '')
                      }
                      aria-label={
                        `${hostIdx != null ? `#${hostIdx}, ` : ''}` +
                        `${shortHash(cell.proTxHash)}, ${roleHint}` +
                        (ccName ? `, ${ccName}` : '')
                      }
                      aria-pressed={inPinned || undefined}
                      onClick={() => focusNode(cell.proTxHash)}
                    >
                      {hostIdx != null && <span className={'QuorumCard__CellIdx'}>{hostIdx}</span>}
                    </button>
                  )

                  return (
                    <Tooltip key={slot} placement={'top'} content={<NodeTooltipBody cell={cell} />}>
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
                className={'QuorumCard__QPick'}
                role={'group'}
                aria-label={'Signing rotation'}
                tabIndex={0}
              >
                {sortedQuorums.map(q => {
                  const formedHeight = q.blockHeight ?? q.creationHeight
                  const qk = quorumKey(q.quorumHash)
                  const on = qk === selectedKey
                  const signed = Boolean(qk && signedHashes.has(qk))
                  const heightLabel =
                    typeof formedHeight === 'number' && formedHeight > 0
                      ? String(formedHeight)
                      : '—'
                  return (
                    <button
                      key={q.quorumHash}
                      type={'button'}
                      className={
                        `QuorumCard__QBtn${on ? ' is-on' : ''}${q.isLive ? ' is-live' : ''}` +
                        (signed ? ' is-signed' : '')
                      }
                      aria-label={`Block ${heightLabel}`}
                      aria-pressed={on}
                      onClick={() => togglePin(`q:${q.quorumHash}`)}
                    >
                      <BlockIcon
                        className={'QuorumCard__QBtnIcon'}
                        w={'0.875rem'}
                        h={'0.875rem'}
                        aria-hidden={'true'}
                      />
                      <span className={'QuorumCard__QBtnHeight'}>{heightLabel}</span>
                    </button>
                  )
                })}
              </div>
            )}
            <div className={'QuorumCard__HostsClip'}>
              <div
                ref={hostsRef}
                className={'QuorumCard__Hosts'}
                aria-label={'Masternode addresses'}
              >
                {hostRows.length === 0 ? (
                  <p className={'QuorumCard__HostsEmpty'}>
                    {filling ? 'Loading addresses…' : 'No addresses'}
                  </p>
                ) : (
                  <div className={'QuorumCard__HostsGrid'}>
                    {hostRows.map(row => (
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
