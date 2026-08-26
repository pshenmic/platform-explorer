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

// 25 cols → 4 rows for a 100-signer window
const GRID_COLS = 25
const SKELETON_SLOTS = 375
const PLATFORM_DKG_BLOCKS = 24
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
    hint: 'Next 100: ~28 stay from Now, the rest are orange'
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

function isPoSeBannedValidator(v: any) {
  const ban = v?.proTxInfo?.state?.PoSeBanHeight
  return typeof ban === 'number' && ban >= 0
}

function isBannedNode(v: any, bannedSet: Set<any> | undefined, key: string) {
  return Boolean(bannedSet?.has(key)) || Boolean(v && isPoSeBannedValidator(v))
}

function paintNode(
  k: string,
  v: any,
  colorNowSet: Set<any>,
  colorNextSet: Set<any>,
  memberMeta: any,
  bannedSet: Set<any> | undefined
) {
  const meta = memberMeta?.get(k)
  // Now members stay green even if PoSe-banned
  if (colorNowSet.has(k)) {
    if (meta?.valid === false) return { type: 'invalid', role: 'invalid' }
    return { type: 'active', role: 'current' }
  }
  if (colorNextSet.has(k)) return { type: 'next', role: 'next' }
  if (isBannedNode(v, bannedSet, k)) return { type: 'banned', role: 'banned' }
  if (v?.isActive && colorNowSet.size === 0) return { type: 'active', role: 'active' }
  return { type: 'inactive', role: 'queued' }
}

function windowOutlineClass(slot: number, windowSlots: Set<number>, cols: number) {
  if (!windowSlots.has(slot)) return ''
  const r = Math.floor(slot / cols)
  const c = slot % cols
  const up = (r - 1) * cols + c
  const down = (r + 1) * cols + c
  let s = ' is-in-window'
  if (r === 0 || !windowSlots.has(up)) s += ' is-win-n'
  if (!windowSlots.has(down)) s += ' is-win-s'
  if (c === 0 || !windowSlots.has(slot - 1)) s += ' is-win-w'
  if (c === cols - 1 || !windowSlots.has(slot + 1)) s += ' is-win-e'
  return s
}

function setOfMembers(membersOf: Map<string, Set<string>> | undefined, hash: unknown) {
  const k = quorumKey(hash)
  if (!k) return new Set<string>()
  return membersOf?.get(k) || membersOf?.get(hash as string) || new Set<string>()
}

// Order: Now unique, overlap, Next unique, later
function buildQueueCells({
  list,
  bannedSet,
  memberMeta,
  membersOf,
  rotation,
  headKey,
  nextHeadKey,
  liveKey,
  liveNextKey,
  showBanned
}: any) {
  if (!Array.isArray(list) || list.length === 0) return []

  const byKey = new Map<string, any>()
  for (const v of list) {
    const k = memberKey(v.proTxHash)
    if (k) byKey.set(k, v)
  }

  const headSet: Set<string> = setOfMembers(membersOf, headKey)
  const nextHeadSet: Set<string> = setOfMembers(membersOf, nextHeadKey)
  const liveSet: Set<string> = setOfMembers(membersOf, liveKey)
  const liveNextSet: Set<string> = setOfMembers(membersOf, liveNextKey)

  const used = new Set<string>()
  const cells: any[] = []

  const pushKey = (k: string, band: string) => {
    if (!k || used.has(k)) return
    const v = byKey.get(k)
    const keepIfBanned =
      headSet.has(k) || nextHeadSet.has(k) || liveSet.has(k) || liveNextSet.has(k)
    const banned = isBannedNode(v, bannedSet, k)
    if (banned && !showBanned && !keepIfBanned) return
    if (!v && !keepIfBanned) return
    used.add(k)
    const painted = paintNode(k, v, headSet, nextHeadSet, memberMeta, bannedSet)
    const type = banned && !keepIfBanned ? 'banned' : painted.type
    const role = banned && !keepIfBanned ? 'banned' : painted.role
    const meta = memberMeta?.get(k)
    cells.push({
      kind: 'node',
      type,
      role,
      band,
      proTxHash: v?.proTxHash || k,
      service: meta?.service || v?.proTxInfo?.state?.service || v?.endpoints?.[0] || null,
      valid: meta ? meta.valid !== false : true,
      validator: v || { proTxHash: k }
    })
  }

  for (const k of headSet) {
    if (!nextHeadSet.has(k)) pushKey(k, 'selected')
  }
  for (const k of headSet) {
    if (nextHeadSet.has(k)) pushKey(k, 'carry')
  }
  for (const k of nextHeadSet) {
    if (!headSet.has(k)) pushKey(k, 'upcoming')
  }

  if (Array.isArray(rotation) && rotation.length) {
    const start = rotation.findIndex((q: any) => quorumKey(q.quorumHash) === quorumKey(headKey))
    const from = start >= 0 ? start : 0
    for (let i = 2; i < rotation.length; i++) {
      const q = rotation[(from + i) % rotation.length]
      const set = setOfMembers(membersOf, q.quorumHash)
      for (const k of set) pushKey(k, 'later')
    }
  }

  for (const v of list) {
    const k = memberKey(v.proTxHash)
    if (isBannedNode(v, bannedSet, k)) continue
    pushKey(k, 'later')
  }

  if (showBanned) {
    while (cells.length % GRID_COLS !== 0) {
      cells.push({ kind: 'idle', type: 'idle', band: 'pad' })
    }
    for (const v of list) {
      const k = memberKey(v.proTxHash)
      if (!isBannedNode(v, bannedSet, k)) continue
      pushKey(k, 'banned')
    }
  }

  return cells
}

function TurnTip({
  turn,
  formedHeight,
  signers
}: {
  turn: string
  formedHeight?: number | null
  signers?: number | null
}) {
  return (
    <div className={'QuorumCard__TurnTip'}>
      <div className={'QuorumCard__TurnTipRows'}>
        <div className={'QuorumCard__TipRow'}>
          <span>Turn</span>
          <b>{turn}</b>
        </div>
        {typeof signers === 'number' && signers > 0 && (
          <div className={'QuorumCard__TipRow'}>
            <span>Signers</span>
            <b>{signers.toLocaleString('en-US')}</b>
          </div>
        )}
        {typeof formedHeight === 'number' && (
          <div className={'QuorumCard__TipRow'}>
            <span>Formed</span>
            <b>#{formedHeight.toLocaleString('en-US')}</b>
          </div>
        )}
      </div>
    </div>
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

function turnLabel(offset: any, isLive: any) {
  if (isLive || offset === 0) return 'Now'
  if (offset === 1) return 'Next'
  return `+${offset + 1}`
}

function CaptionTitle({
  height,
  href,
  fallback
}: {
  height: number | null
  href: string | null
  fallback: string
}) {
  if (height == null) return fallback
  const label = height.toLocaleString('en-US')
  const body = (
    <>
      <BlockIcon
        className={'QuorumCard__CaptionIcon'}
        w={'0.875rem'}
        h={'0.875rem'}
        aria-hidden={'true'}
      />
      {label}
    </>
  )
  if (!href) return body
  return (
    <a href={href} target={'_blank'} rel={'noreferrer'} className={'QuorumCard__BlockLink'}>
      {body}
    </a>
  )
}

function bandOrder(band: string) {
  if (band === 'selected') return 0
  if (band === 'carry') return 1
  if (band === 'upcoming') return 2
  if (band === 'later') return 3
  if (band === 'pad') return 4
  if (band === 'banned') return 5
  return 6
}

function visualHomeRange(cells: any[], start: number, count: number) {
  let seen = 0
  let first: number | null = null
  let last: number | null = null
  for (const c of cells) {
    if (c.kind !== 'node' || typeof c.homeIndex !== 'number') continue
    if (seen >= start && seen < start + count) {
      if (first == null) first = c.homeIndex
      last = c.homeIndex
    }
    seen += 1
    if (seen >= start + count) break
  }
  if (first == null || last == null) return null
  return { lo: first, hi: last }
}

function formatQuorumIds(ids: any) {
  if (!ids?.length) return null
  return ids
    .map((n: any) => {
      if (n === 0) return 'Now'
      if (n === 1) return 'Next'
      return `+${n}`
    })
    .join(' · ')
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
  validatorsBanned,
  validatorsInactive,
  validatorsList,
  poolLoading,
  bannedValidatorsList,
  bannedListLoading,
  currentQuorum,
  currentQuorumLoading,
  currentQuorumError,
  quorums,
  platformHeight,
  avgBlockTimeSec
}: any) {
  const queryClient = useQueryClient()
  const { l1explorerBaseUrl } = useActiveNetwork()
  const [pin, setPin] = useState<string | null>(null)
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [loadAllDetails, setLoadAllDetails] = useState(false)
  const pickRef = useRef<HTMLDivElement | null>(null)
  const hostsRef = useRef<HTMLDivElement | null>(null)

  const total = validators?.data?.pagination?.total
  const active = validatorsActive?.data?.pagination?.total
  const banned = validatorsBanned?.data?.pagination?.total
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
      const needed = key === nextKey || key === pinnedKey || loadAllDetails
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
  }, [liveKey, pinnedKey, pinnedQuorumHashEarly, queryClient, sortedQuorums])

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
  }, [currentQuorum?.members, detailStamp, liveHash]) // detailStamp: query objects are new each render

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
  const hasNodeList = list.length > 0
  const nextMembers =
    (nextKey && rosterIndex.membersOf.get(nextKey)) ||
    (nextHash && rosterIndex.membersOf.get(nextHash)) ||
    null
  const nextIdx = sortedQuorums.findIndex(q => quorumKey(q.quorumHash) === nextKey)
  const nextQuery = nextIdx >= 0 ? detailQueries[nextIdx] : null
  const nextQueryPending = Boolean(nextKey && nextQuery && !nextQuery.isFetched)
  const filling = Boolean(
    poolLoading ||
      bannedListLoading ||
      !hasNodeList ||
      (nextKey && !nextMembers?.size && nextQueryPending)
  )

  useEffect(() => {
    if (!filling && sortedQuorums.length > 0) setLoadAllDetails(true)
  }, [filling, sortedQuorums.length])

  const showBanned = pin === 'banned'
  const selectedKey = pinnedKey || liveKey
  const selectedMeta = sortedQuorums.find(q => quorumKey(q.quorumHash) === selectedKey) || null
  const selectedOffset = selectedMeta?.offset ?? 0
  // Even offset = pair head; odd slides onto the following turn
  const pairOffset = selectedOffset - (selectedOffset % 2)
  const regroup = Boolean(pinnedKey && pairOffset >= 2)
  const pairHeadMeta = sortedQuorums.find(q => q.offset === pairOffset) || null
  const pairFollowMeta = sortedQuorums.find(q => q.offset === pairOffset + 1) || null
  const headKey = regroup ? quorumKey(pairHeadMeta?.quorumHash) : liveKey
  const nextHeadKey = regroup ? quorumKey(pairFollowMeta?.quorumHash) : nextKey
  const selectedMemberSet = useMemo(() => {
    const k = selectedKey
    if (!k) return new Set<string>()
    return rosterIndex.membersOf.get(k) || new Set<string>()
  }, [rosterIndex, selectedKey])

  const homeCells = useMemo((): any[] => {
    if (filling) {
      return Array.from({ length: SKELETON_SLOTS }, (_, index) => ({
        kind: 'skel',
        type: 'skel',
        index
      }))
    }
    const raw = buildQueueCells({
      list,
      bannedSet,
      memberMeta,
      membersOf: rosterIndex.membersOf,
      rotation: sortedQuorums,
      headKey: liveKey,
      nextHeadKey: nextKey,
      liveKey,
      liveNextKey: nextKey,
      showBanned
    })
    return raw.map((cell: any) => {
      if (cell.kind !== 'node' || !cell.proTxHash) return cell
      const qs = rosterIndex.byNode.get(memberKey(cell.proTxHash)) || []
      return {
        ...cell,
        quorumHashes: qs.map((q: any) => q.hash),
        quorumIndexes: qs.map((q: any) => q.index).filter((n: any) => typeof n === 'number')
      }
    })
  }, [
    filling,
    list,
    memberMeta,
    bannedSet,
    rosterIndex,
    sortedQuorums,
    liveKey,
    nextKey,
    showBanned
  ])

  const homeIndexByKey = useMemo(() => {
    const map = new Map<string, number>()
    let n = 0
    for (const cell of homeCells) {
      if (cell.kind !== 'node' || !cell.proTxHash) continue
      n += 1
      map.set(memberKey(cell.proTxHash), n)
    }
    return map
  }, [homeCells])

  const cells = useMemo((): any[] => {
    if (filling) return homeCells
    const raw = regroup
      ? buildQueueCells({
          list,
          bannedSet,
          memberMeta,
          membersOf: rosterIndex.membersOf,
          rotation: sortedQuorums,
          headKey,
          nextHeadKey,
          liveKey,
          liveNextKey: nextKey,
          showBanned
        }).map((cell: any) => {
          if (cell.kind !== 'node' || !cell.proTxHash) return cell
          const qs = rosterIndex.byNode.get(memberKey(cell.proTxHash)) || []
          return {
            ...cell,
            quorumHashes: qs.map((q: any) => q.hash),
            quorumIndexes: qs.map((q: any) => q.index).filter((n: any) => typeof n === 'number')
          }
        })
      : homeCells
    const withIndex = raw.map((cell: any) => {
      if (cell.kind !== 'node' || !cell.proTxHash) return cell
      return { ...cell, homeIndex: homeIndexByKey.get(memberKey(cell.proTxHash)) ?? null }
    })
    if (!regroup) return withIndex
    const nodes: any[] = []
    const tail: any[] = []
    for (const cell of withIndex) {
      if (cell.kind === 'node') nodes.push(cell)
      else tail.push(cell)
    }
    nodes.sort(
      (a, b) => bandOrder(a.band) - bandOrder(b.band) || (a.homeIndex ?? 0) - (b.homeIndex ?? 0)
    )
    return nodes.concat(tail)
  }, [
    filling,
    homeCells,
    homeIndexByKey,
    regroup,
    list,
    bannedSet,
    memberMeta,
    rosterIndex,
    sortedQuorums,
    headKey,
    nextHeadKey,
    liveKey,
    nextKey,
    showBanned
  ])

  const queuedN = useMemo(
    () => homeCells.filter(c => c.kind === 'node' && c.type === 'inactive').length,
    [homeCells]
  )
  const nowUniqueN = useMemo(
    () => cells.filter(c => c.kind === 'node' && c.band === 'selected').length,
    [cells]
  )
  const carryN = useMemo(
    () => cells.filter(c => c.kind === 'node' && c.band === 'carry').length,
    [cells]
  )
  const upcomingN = useMemo(
    () => cells.filter(c => c.kind === 'node' && c.band === 'upcoming').length,
    [cells]
  )
  const windowSlots = useMemo(() => {
    const set = new Set<number>()
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]
      if (cell.kind !== 'node' || !cell.proTxHash) continue
      if (selectedMemberSet.has(memberKey(cell.proTxHash))) set.add(i)
    }
    return set
  }, [cells, selectedMemberSet])
  const windowCount = windowSlots.size
  const nowEnd = nowUniqueN + carryN
  const nextStart = nowUniqueN + 1
  const nextEnd = nowUniqueN + carryN + upcomingN
  const headLabel = regroup ? turnLabel(pairOffset, false) : 'Now'
  const followLabel = regroup ? turnLabel(pairOffset + 1, pairOffset + 1 === 0) : 'Next'
  const heightAt = (offset: number) => {
    const base = Number(platformHeight)
    if (!Number.isFinite(base) || base <= 0) return null
    return Math.round(base + offset * PLATFORM_DKG_BLOCKS)
  }
  const titleAt = (offset: number, fallback: string) => {
    if (offset < 2) return fallback
    const h = heightAt(offset)
    return h != null ? `~${h.toLocaleString('en-US')}` : fallback
  }
  const coreHeightOf = (q: any) => {
    const h = q?.blockHeight ?? q?.creationHeight
    return typeof h === 'number' && h > 0 ? h : null
  }
  const coreHref = (h: number | null) =>
    h != null && l1explorerBaseUrl ? `${l1explorerBaseUrl}/block/${h}` : null
  const headCore = coreHeightOf(pairHeadMeta)
  const followCore = coreHeightOf(pairFollowMeta)
  const headTitle =
    headCore != null ? `#${headCore.toLocaleString('en-US')}` : titleAt(pairOffset, headLabel)
  const followTitle =
    followCore != null
      ? `#${followCore.toLocaleString('en-US')}`
      : titleAt(pairOffset + 1, followLabel)
  const headHref = coreHref(headCore)
  const followHref = coreHref(followCore)
  const headSpan = regroup ? visualHomeRange(cells, 0, nowEnd || 100) : null
  const followSpan = regroup ? visualHomeRange(cells, nowUniqueN, 100) : null
  const headRange = headSpan ? `${headSpan.lo}–${headSpan.hi}` : `1–${nowEnd || 100}`
  const followRange = followSpan ? `${followSpan.lo}–${followSpan.hi}` : `${nextStart}–${nextEnd}`

  const counts: Record<string, number | null> = {
    total: hasTotal ? total : null,
    active: typeof active === 'number' ? active : null,
    next: nextMembers?.size
      ? nextMembers.size
      : filling
        ? null
        : nextKey
          ? llmq?.size || 100
          : null,
    inactive: filling || !hasNodeList ? (typeof inactive === 'number' ? inactive : null) : queuedN,
    banned: typeof banned === 'number' ? banned : null
  }

  const togglePin = (key: any) => setPin(p => (p === key ? null : key))

  // Highlight only; do not change the selected turn
  const focusNode = (proTx: any) => {
    const key = memberKey(proTx)
    if (key) setFocusKey(key)
  }

  useEffect(() => {
    if (!focusKey || !hostsRef.current) return
    const row = hostsRef.current.querySelector('.QuorumCard__Host.is-focus')
    if (row instanceof HTMLElement) row.scrollIntoView({ block: 'nearest' })
  }, [focusKey])

  const pinnedQuorumHash = pinnedQuorumHashEarly
  const pinnedQuorumMeta = pinnedQuorumHash
    ? sortedQuorumsWithMembers.find(q => quorumKey(q.quorumHash) === pinnedKey) || null
    : null
  const quorumSize = llmq?.size || 100

  const matrixAria =
    (hasTotal ? `${total} validators` : 'Validator pool') +
    (hasRoster && rosterSize != null ? `, ${rosterSize} in current quorum` : '')

  const hostRows = useMemo(() => {
    return homeCells
      .filter((cell: any) => cell.kind === 'node' && cell.proTxHash)
      .map((cell: any) => {
        const nodeKey = memberKey(cell.proTxHash)
        const dataType =
          cell.type === 'invalid' ? 'active' : cell.type === 'idle' ? 'total' : cell.type
        const dot =
          cell.type === 'active' || cell.type === 'invalid'
            ? 'active'
            : cell.type === 'next'
              ? 'next'
              : cell.type === 'banned'
                ? 'banned'
                : 'inactive'
        const cc = cell.validator?.geoIpInfo?.countryCode
        return {
          key: nodeKey,
          proTxHash: cell.proTxHash,
          host: nodeHost(cell) || shortHash(cell.proTxHash, 6, 6),
          type: cell.type,
          dataType,
          dot,
          cc: typeof cc === 'string' ? cc : null,
          quorumHashes: cell.quorumHashes,
          quorumIndexes: Array.isArray(cell.quorumIndexes) ? cell.quorumIndexes : [],
          inPinned: selectedMemberSet.has(nodeKey),
          isFocus: Boolean(focusKey && focusKey === nodeKey)
        }
      })
  }, [homeCells, focusKey, selectedMemberSet])

  const hostIndexByKey = useMemo(() => {
    const map = new Map<string, number>()
    for (let i = 0; i < hostRows.length; i++) {
      map.set(hostRows[i].key, i + 1)
    }
    return map
  }, [hostRows])

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
                    Green is this turn, orange is the following one. Now/Next stay put; +2/+4…
                    rebuild the same green+orange pair (numbers still match the list).
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
              const nextOn = pin === 'next' || (Boolean(pinnedKey) && pinnedKey === nextKey)
              const pressed = s.key === 'active' ? nowOn : s.key === 'next' ? nextOn : pin === s.key
              return (
                <button
                  key={s.key}
                  type={'button'}
                  data-type={s.key}
                  className={`QuorumCard__Leg QuorumCard__Leg--${s.key}${pressed ? ' is-on' : ''}`}
                  onClick={() => {
                    if (s.key === 'active' && liveHash) {
                      togglePin(`q:${liveHash}`)
                      return
                    }
                    if (s.key === 'next' && nextHash) {
                      togglePin(`q:${nextHash}`)
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
              )
            })}
          </div>
          {sortedQuorums.length > 0 && (
            <p className={'QuorumCard__QCaption'}>
              <span className={'QuorumCard__PairCaption'}>
                <span data-tone={'now'} className={selectedOffset % 2 === 0 ? 'is-on' : undefined}>
                  <b className={headCore != null ? 'is-block' : undefined}>
                    <CaptionTitle height={headCore} href={headHref} fallback={headTitle} />
                  </b>
                  <em>{headRange}</em>
                </span>
                {nextEnd > nowEnd && (
                  <span
                    data-tone={'next'}
                    className={selectedOffset % 2 === 1 ? 'is-on' : undefined}
                  >
                    <b className={followCore != null ? 'is-block' : undefined}>
                      <CaptionTitle height={followCore} href={followHref} fallback={followTitle} />
                    </b>
                    <em>{followRange}</em>
                  </span>
                )}
              </span>
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
        {sortedQuorums.length > 0 && (
          <div
            ref={pickRef}
            className={'QuorumCard__QPick'}
            role={'group'}
            aria-label={'Signing rotation'}
            aria-orientation={'horizontal'}
            tabIndex={0}
          >
            {sortedQuorums.map(q => {
              const selected = quorumKey(q.quorumHash) === pinnedKey
              const label = turnLabel(q.offset, q.isLive)
              const signers = quorumSize
              const turn =
                q.isLive || q.offset === 0
                  ? 'Now'
                  : formatApproxTurn(approxTurnMs(q.offset, avgBlockTimeSec, signers))
              return (
                <Tooltip
                  key={q.quorumHash}
                  placement={'top'}
                  title={q.offset < 2 ? label : ''}
                  content={
                    <TurnTip
                      turn={turn}
                      formedHeight={q.blockHeight ?? q.creationHeight}
                      signers={signers}
                    />
                  }
                >
                  <button
                    type={'button'}
                    className={`QuorumCard__QBtn${q.offset < 2 ? ' is-word' : ''}${selected ? ' is-on' : ''}${q.isLive ? ' is-live' : ''}${q.offset === 1 ? ' is-next' : ''}`}
                    aria-pressed={selected}
                    onClick={() => togglePin(`q:${q.quorumHash}`)}
                  >
                    {label}
                  </button>
                </Tooltip>
              )
            })}
          </div>
        )}
        <div
          className={
            `QuorumCard__Stage` +
            (pin ? ' is-pinned' : '') +
            (pinnedQuorumHash && !showBanned ? ' is-pinned-quorum' : '') +
            (showBanned ? ' is-show-banned' : '') +
            (windowCount > 0 && !filling ? ' is-window' : '')
          }
          data-pin={showBanned ? undefined : pinnedQuorumHash ? 'quorum' : pin || undefined}
          data-window={selectedOffset % 2 === 1 ? 'next' : 'live'}
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
                      ? `signs ${headLabel} and ${followLabel}`
                      : cell.band === 'upcoming'
                        ? `new in ${followLabel}`
                        : cell.role === 'current'
                          ? `signing ${headLabel}`
                          : cell.role === 'next'
                            ? `signs ${followLabel}`
                            : cell.quorumIndexes?.length
                              ? `signs ${formatQuorumIds(cell.quorumIndexes)}`
                              : cell.role

                  const nodeKey = memberKey(cell.proTxHash)
                  const inPinned = windowSlots.has(slot)
                  const isFocus = Boolean(focusKey && focusKey === nodeKey)
                  const hostIdx = cell.homeIndex ?? hostIndexByKey.get(nodeKey)

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
                        windowOutlineClass(slot, windowSlots, GRID_COLS) +
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

          <div className={'QuorumCard__HostsClip'}>
            <div ref={hostsRef} className={'QuorumCard__Hosts'} aria-label={'Masternode addresses'}>
              {hostRows.length === 0 ? (
                <p className={'QuorumCard__HostsEmpty'}>
                  {filling ? 'Loading addresses…' : 'No addresses'}
                </p>
              ) : (
                hostRows.map((row, i) => {
                  const signs = formatQuorumIds(row.quorumIndexes)
                  return (
                    <Tooltip
                      key={row.key}
                      placement={'top'}
                      title={'Signs'}
                      content={signs || 'none loaded'}
                    >
                      <button
                        type={'button'}
                        data-type={row.dataType}
                        className={
                          `QuorumCard__Host QuorumCard__Host--${row.type}` +
                          (row.inPinned ? ' is-in-pin' : '') +
                          (row.isFocus ? ' is-focus' : '')
                        }
                        onClick={() => focusNode(row.proTxHash)}
                      >
                        <span className={'QuorumCard__HostIdx'}>{i + 1}</span>
                        <i className={`QuorumCard__Dot QuorumCard__Dot--${row.dot}`} />
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
                        <span>{row.host}</span>
                      </button>
                    </Tooltip>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}
