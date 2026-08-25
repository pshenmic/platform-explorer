'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { Box } from '@chakra-ui/react'
import { Skeleton } from './Skeleton'
import { Tooltip } from '../ui/Tooltips'
import * as Api from '../../util/Api'
import { ResponseErrorNotFound } from '../../util/Errors'
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

const GRID_COLS = 26
const SKELETON_SLOTS = 650
const PLATFORM_DKG_BLOCKS = 24
const FALLBACK_BLOCK_MS = 150_000
const turnWhenFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})

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

function isPoSeBannedValidator(v: any) {
  const ban = v?.proTxInfo?.state?.PoSeBanHeight
  return typeof ban === 'number' && ban >= 0
}

function buildPoolCells({ list, currentSet, nextSet, memberMeta, bannedSet, sortByType }: any) {
  if (!Array.isArray(list) || list.length === 0) return []

  const cells = list.map((v, index) => {
    const key = memberKey(v.proTxHash)
    const banned = Boolean(bannedSet?.has(key)) || isPoSeBannedValidator(v)
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

  const rank: Record<string, number> = {
    active: 0,
    next: 1,
    invalid: 2,
    inactive: 3,
    banned: 4,
    idle: 5
  }
  if (sortByType) cells.sort((a, b) => (rank[a.type] ?? 9) - (rank[b.type] ?? 9))
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
    if (cell.role === 'invalid') return 'In current quorum · invalid'
    if (cell.role === 'next') return 'Signs next'
    if (cell.role === 'current' || cell.role === 'active') return 'In the live signing set'
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
  avgBlockTimeSec
}: any) {
  const queryClient = useQueryClient()
  const [pin, setPin] = useState<string | null>(null)
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [loadAllDetails, setLoadAllDetails] = useState(false)
  const [pendingNode, setPendingNode] = useState<string | null>(null)
  const pickRef = useRef<HTMLDivElement | null>(null)

  const total = validators?.data?.pagination?.total
  const active = validatorsActive?.data?.pagination?.total
  const banned = validatorsBanned?.data?.pagination?.total
  const inactive = validatorsInactive?.data?.pagination?.total

  const hasTotal = typeof total === 'number' && total > 0

  const activeN = typeof active === 'number' ? active : 0
  const bannedN = typeof banned === 'number' ? banned : 0
  const queuedN = typeof inactive === 'number' ? inactive : 0

  const currentMembers = Array.isArray(currentQuorum?.members) ? currentQuorum.members : null
  const hasRoster = Boolean(currentMembers && currentMembers.length > 0)

  const currentSet = useMemo(() => {
    if (!currentMembers) return null
    return new Set(currentMembers.map((m: any) => memberKey(m.proTxHash)))
  }, [currentMembers])

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

  const cells = useMemo((): any[] => {
    if (filling) {
      return Array.from({ length: SKELETON_SLOTS }, (_, index) => ({
        kind: 'skel',
        type: 'skel',
        index
      }))
    }
    const raw = buildPoolCells({
      list,
      currentSet,
      nextSet: nextMembers,
      memberMeta,
      bannedSet,
      sortByType: true
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
  }, [filling, list, currentSet, nextMembers, memberMeta, bannedSet, rosterIndex])

  const nextN = useMemo(() => cells.filter(c => c.type === 'next').length, [cells])

  const counts: Record<string, number | null> = {
    total: hasTotal ? total : null,
    active: typeof active === 'number' ? active : null,
    next: filling ? nextMembers?.size || null : hasNodeList ? nextN : null,
    inactive:
      typeof inactive === 'number' ? Math.max(0, inactive - (hasNodeList ? nextN : 0)) : null,
    banned: typeof banned === 'number' ? banned : null
  }

  const togglePin = (key: any) => setPin(p => (p === key ? null : key))

  const cycleNodeQuorum = (hashes: any, proTx: any) => {
    const key = memberKey(proTx)
    if (key) setFocusKey(key)
    if (!hashes?.length) {
      setLoadAllDetails(true)
      if (key) setPendingNode(key)
      return
    }
    const ordered = hashes
      .map((h: any) => sortedQuorumsWithMembers.find(q => quorumKey(q.quorumHash) === quorumKey(h)))
      .filter(Boolean)
      .sort((a: any, b: any) => a.offset - b.offset)
    if (!ordered.length) return
    const keys = ordered.map((q: any) => q.quorumHash)
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

  const detailsFetching = detailQueries.some(q => q.isFetching)

  useEffect(() => {
    if (!pendingNode) return
    if (loadAllDetails && detailsFetching) return
    const qs = rosterIndex.byNode.get(pendingNode) || []
    if (qs.length) {
      const hashes = qs.map((q: any) => q.hash)
      const ordered = hashes
        .map((h: any) =>
          sortedQuorumsWithMembers.find(q => quorumKey(q.quorumHash) === quorumKey(h))
        )
        .filter(Boolean)
        .sort((a: any, b: any) => a.offset - b.offset)
      if (ordered.length) setPin(`q:${ordered[0].quorumHash}`)
    }
    setPendingNode(null)
  }, [detailsFetching, loadAllDetails, pendingNode, rosterIndex, sortedQuorumsWithMembers])

  const blockMs =
    typeof avgBlockTimeSec === 'number' && avgBlockTimeSec > 0
      ? avgBlockTimeSec * 1000
      : FALLBACK_BLOCK_MS

  const turnAt = (offset: number) => new Date(Date.now() + offset * PLATFORM_DKG_BLOCKS * blockMs)

  const turnLabel = (offset: any, isLive: any) => {
    if (isLive || offset === 0) return 'Now'
    if (offset === 1) return 'Next'
    return `+${offset}`
  }

  const pinnedQuorumHash = pinnedQuorumHashEarly
  const pinnedQuorumSet =
    (pinnedKey && rosterIndex.membersOf.get(pinnedKey)) ||
    (pinnedQuorumHash ? rosterIndex.membersOf.get(pinnedQuorumHash) : null)
  const pinnedQuorumMeta = pinnedQuorumHash
    ? sortedQuorumsWithMembers.find(q => quorumKey(q.quorumHash) === pinnedKey) || null
    : null
  const quorumSize = llmq?.size || 100
  const pinnedSignerCount = quorumSize

  const matrixAria =
    (hasTotal ? `${total} validators` : 'Validator pool') +
    (hasRoster && rosterSize != null ? `, ${rosterSize} in current quorum` : '')

  const hostRows = useMemo(() => {
    return cells
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
          inPinned: Boolean(pinnedQuorumSet && pinnedQuorumSet.has(nodeKey)),
          isFocus: Boolean(focusKey && focusKey === nodeKey)
        }
      })
      .sort((a: any, b: any) => {
        const aIp = a.host.includes('.') || a.host.includes(':')
        const bIp = b.host.includes('.') || b.host.includes(':')
        if (aIp !== bIp) return aIp ? -1 : 1
        return (
          a.host.localeCompare(b.host, undefined, { numeric: true }) || a.key.localeCompare(b.key)
        )
      })
  }, [cells, focusKey, pinnedQuorumSet])

  const hostIndexByKey = useMemo(() => {
    const map = new Map<string, number>()
    hostRows.forEach((row: any, i: number) => {
      map.set(row.key, i + 1)
    })
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
                    Click a square to see that node&apos;s soonest turn. Click again to cycle its
                    other quorums.
                  </p>
                </div>
              }
            >
              <span className={'QuorumCard__LedeMore'}>rotating set</span>
            </Tooltip>{' '}
            of
            <br />
            100 evonodes signs each block.
          </p>
        </div>

        <div className={'QuorumCard__Controls'}>
          <div className={'QuorumCard__Legend'} role={'group'} aria-label={'Validator counts'}>
            {STATS.map(s => {
              const n = counts[s.key]
              const ready = typeof n === 'number'
              return (
                <button
                  key={s.key}
                  type={'button'}
                  data-type={s.key}
                  className={`QuorumCard__Leg QuorumCard__Leg--${s.key}${pin === s.key ? ' is-on' : ''}`}
                  onClick={() => togglePin(s.key)}
                  aria-pressed={pin === s.key}
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
              {pendingNode && !pinnedQuorumMeta ? (
                <>
                  <span className={'QuorumCard__QCaptionHead'}>
                    <b>Looking up</b>
                  </span>
                  <span className={'QuorumCard__QCaptionMeta'}>this node&apos;s quorums</span>
                </>
              ) : pinnedQuorumMeta ? (
                <>
                  <span className={'QuorumCard__QCaptionHead'}>
                    <b>{turnLabel(pinnedQuorumMeta.offset, pinnedQuorumMeta.isLive)}</b>
                    <span>{pinnedSignerCount} signers</span>
                  </span>
                  {pinnedQuorumMeta.isLive ? (
                    <em className={'QuorumCard__QCaptionMeta'}>signing now</em>
                  ) : (
                    <span className={'QuorumCard__QCaptionMeta'}>
                      ~ {turnWhenFmt.format(turnAt(pinnedQuorumMeta.offset))}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className={'QuorumCard__QCaptionHead'}>
                    <b>When does it sign?</b>
                  </span>
                  <span className={'QuorumCard__QCaptionMeta'}>pick a node or a turn</span>
                </>
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
              return (
                <Tooltip
                  key={q.quorumHash}
                  placement={'top'}
                  title={q.offset < 2 ? label : ''}
                  content={
                    <TurnTip
                      turn={
                        q.isLive || q.offset === 0
                          ? 'Now'
                          : `~ ${turnWhenFmt.format(turnAt(q.offset))}`
                      }
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
          className={`QuorumCard__Stage${pin ? ' is-pinned' : ''}${pinnedQuorumHash ? ' is-pinned-quorum' : ''}${pendingNode && !pinnedQuorumHash ? ' is-lookup' : ''}`}
          data-pin={pinnedQuorumHash ? 'quorum' : pin || undefined}
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
                    cell.role === 'current'
                      ? 'signing now'
                      : cell.role === 'next'
                        ? 'signs next'
                        : cell.quorumIndexes?.length
                          ? `signs ${formatQuorumIds(cell.quorumIndexes)}`
                          : cell.role

                  const nodeKey = memberKey(cell.proTxHash)
                  const inPinned = Boolean(pinnedQuorumSet && pinnedQuorumSet.has(nodeKey))
                  const isFocus = Boolean(focusKey && focusKey === nodeKey)
                  const hostIdx = hostIndexByKey.get(nodeKey)

                  const tile = (
                    <button
                      type={'button'}
                      data-type={dataType}
                      data-role={cell.role}
                      className={
                        `QuorumCard__Cell QuorumCard__Cell--${cell.type}` +
                        (inPinned ? ' is-in-pin' : '') +
                        (isFocus ? ' is-focus' : '')
                      }
                      aria-label={
                        `${hostIdx != null ? `#${hostIdx}, ` : ''}` +
                        `${shortHash(cell.proTxHash)}, ${roleHint}` +
                        (ccName ? `, ${ccName}` : '')
                      }
                      aria-pressed={inPinned || undefined}
                      onClick={() => cycleNodeQuorum(cell.quorumHashes, cell.proTxHash)}
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
            <div className={'QuorumCard__Hosts'} aria-label={'Masternode addresses'}>
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
                        onClick={() => cycleNodeQuorum(row.quorumHashes, row.proTxHash)}
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
