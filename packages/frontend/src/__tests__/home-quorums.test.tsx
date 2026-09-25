import type { jest as Jest } from '@jest/globals'
declare const jest: typeof Jest
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import QuorumCard from '../components/home/QuorumCard'
import * as Api from '../util/Api'
import { ResponseErrorNotFound } from '../util/Errors'
import { orderQuorums } from '../components/home/quorumModel'

jest.mock('../util/Api', () => ({ getQuorums: jest.fn(), getQuorumByHash: jest.fn() }))
jest.mock('../components/ui/Tooltips', () => ({ Tooltip: ({ children }: any) => children }))
jest.mock('../components/ui/icons', () => ({ BlockIcon: () => null }))
jest.mock('next/image', () => ({ __esModule: true, default: () => null }))

const listKey = ['home', 'quorums', 'list']
const listMock = jest.mocked(Api.getQuorums)
const detailMock = jest.mocked(Api.getQuorumByHash)
const clients: QueryClient[] = []
let roster: Api.PlatformQuorum[]
const node = (n: number) => n.toString(16).padStart(64, '0')
const quorum = (n: number): Api.PlatformQuorum => ({
  quorumHash: `Q${n}`,
  creationHeight: n * 24,
  blockHeight: n * 24,
  type: 'llmq_4_3',
  isCurrent: false,
  members: [3, 1, 0, 2].map(i => ({ proTxHash: node(n + i), valid: true }))
})

beforeEach(() => {
  jest.clearAllMocks()
  roster = Array.from({ length: 24 }, (_, i) => quorum(i + 1))
  roster[10].isCurrent = true
  listMock.mockImplementation(async () => roster.map(({ members, ...q }) => q))
  detailMock.mockImplementation(async hash => {
    const q = roster.find(q => q.quorumHash === hash)
    if (!q) throw new ResponseErrorNotFound()
    return q
  })
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any
  Element.prototype.scrollIntoView = jest.fn()
})

afterEach(() => {
  for (const client of clients.splice(0)) client.clear()
})

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  clients.push(client)
  const props = {
    validators: { data: { pagination: { total: 80 } } },
    validatorsList: Array.from({ length: 80 }, (_, i) => ({ proTxHash: node(i + 1) })),
    bannedValidatorsList: [],
    poolLoading: false,
    lastProposerProTx: node(11),
    avgBlockTimeSec: 3
  }
  const view = render(
    <QueryClientProvider client={client}>
      <QuorumCard {...props} />
    </QueryClientProvider>
  )
  const rerender = (proposer: string) =>
    view.rerender(
      <QueryClientProvider client={client}>
        <QuorumCard {...props} lastProposerProTx={proposer} />
      </QueryClientProvider>
    )
  const matrix = () => within(screen.getByRole('img'))
  return { ...view, client, matrix, rerender }
}

async function refresh(client: QueryClient) {
  await act(async () => {
    await client.refetchQueries({ queryKey: listKey })
  })
}

function selection(container: HTMLElement) {
  return container.querySelector('.QuorumCard__QBtn.is-on')?.getAttribute('aria-label')
}

describe('home quorum lifecycle', () => {
  it('preserves display order without mutating the API list', () => {
    const before = roster.map(q => q.quorumHash)
    const ordered = orderQuorums(roster)
    expect(ordered.map(q => q.quorumHash)).toEqual([
      ...Array.from({ length: 11 }, (_, i) => `Q${11 - i}`),
      ...Array.from({ length: 13 }, (_, i) => `Q${24 - i}`)
    ])
    expect(roster.map(q => q.quorumHash)).toEqual(before)
  })

  it('keeps node numbers, overlap highlighting and proposer across a current-quorum change', async () => {
    const { container, client, matrix, rerender } = mount()
    await waitFor(() => expect(matrix().getAllByRole('button')).toHaveLength(4))
    expect(
      matrix()
        .getAllByRole('button')
        .map(b => b.getAttribute('aria-label')?.match(/^#\d+/)?.[0])
    ).toEqual(['#1', '#2', '#3', '#4'])
    expect(container.querySelectorAll('.QuorumCard__Cell.is-proposer')).toHaveLength(1)
    await waitFor(() =>
      expect(container.querySelectorAll('.QuorumCard__Cell.is-carry').length).toBeGreaterThan(0)
    )
    roster = roster.map(q => ({ ...q, isCurrent: q.quorumHash === 'Q12' }))
    await refresh(client)
    rerender(node(12))
    await waitFor(() =>
      expect(matrix().getAllByRole('button')[0].getAttribute('aria-label')).toMatch(/^#2,/)
    )
    expect(
      container.querySelector('.QuorumCard__Cell.is-proposer')?.getAttribute('aria-label')
    ).toMatch(/^#2,/)
    expect(selection(container)).toContain('Core 288')
    rerender(node(79))
    expect(container.querySelectorAll('.QuorumCard__Cell.is-proposer')).toHaveLength(0)
  })

  it('preserves a pin on refresh errors, follows it across rotations, then retires it when removed', async () => {
    const { container, client, matrix } = mount()
    await waitFor(() => expect(matrix().getAllByRole('button')).toHaveLength(4))
    fireEvent.click(screen.getByRole('button', { name: /Quorum .*Core 240$/ }))
    await waitFor(() => expect(selection(container)).toContain('Core 240'))
    expect(container.querySelectorAll('.QuorumCard__Cell.is-proposer')).toHaveLength(0)
    listMock.mockRejectedValue(new Error('offline'))
    await refresh(client)
    expect(selection(container)).toContain('Core 240')
    expect(await screen.findByText(/Could not update quorums/)).toBeTruthy()
    listMock.mockImplementation(async () => roster.map(({ members, ...q }) => q))
    roster = roster.map(q => ({ ...q, isCurrent: q.quorumHash === 'Q12' }))
    await refresh(client)
    expect(selection(container)).toContain('Core 240')
    roster = [...roster.filter(q => q.quorumHash !== 'Q10'), quorum(25)]
    await refresh(client)
    await waitFor(() => expect(selection(container)).toContain('Core 288'))
    expect(container.querySelector('.QuorumCard__Stage')?.getAttribute('data-pin')).toBeNull()
    expect(container.querySelectorAll('.QuorumCard__Cell--skel')).toHaveLength(0)
  })

  it('shows retry instead of endless skeletons on a detail failure and recovers', async () => {
    detailMock.mockRejectedValue(new Error('network failure'))
    const { container, matrix } = mount()
    await screen.findByText('Signing roster unavailable.')
    expect(container.querySelectorAll('.QuorumCard__Cell--skel')).toHaveLength(0)
    detailMock.mockImplementation(async hash => roster.find(q => q.quorumHash === hash)!)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(matrix().getAllByRole('button')).toHaveLength(4))
    expect(screen.queryByText('Signing roster unavailable.')).toBeNull()
  })

  it('does not label old members as the new current quorum while its detail is loading', async () => {
    const { container, client, matrix } = mount()
    await waitFor(() => expect(matrix().getAllByRole('button')).toHaveLength(4))
    let finish!: (value: Api.PlatformQuorum) => void
    detailMock.mockImplementation(hash =>
      hash === 'Q30'
        ? new Promise(resolve => {
            finish = resolve
          })
        : Promise.resolve(roster.find(q => q.quorumHash === hash)!)
    )
    roster = [...roster.map(q => ({ ...q, isCurrent: false })), { ...quorum(30), isCurrent: true }]
    await refresh(client)
    await waitFor(() => expect(selection(container)).toContain('Core 720'))
    expect(container.querySelectorAll('.QuorumCard__Cell.is-proposer')).toHaveLength(0)
    expect(matrix().queryAllByRole('button')).toHaveLength(0)
    await act(async () => {
      finish(roster[roster.length - 1])
    })
    await waitFor(() => expect(matrix().getAllByRole('button')).toHaveLength(4))
  })

  it('does not invent a current quorum when the API has none', async () => {
    roster = roster.map(q => ({ ...q, isCurrent: false }))
    const { container } = mount()
    await screen.findByText('Signing roster unavailable.')
    expect(container.querySelectorAll('.QuorumCard__QBtn.is-live')).toHaveLength(0)
    expect(container.querySelectorAll('.QuorumCard__Cell--skel')).toHaveLength(0)
  })

  it('reconciles a 404 between list and detail responses', async () => {
    detailMock.mockImplementation(async hash => {
      if (hash === 'Q11') {
        roster = roster
          .filter(q => q.quorumHash !== 'Q11')
          .map(q => ({ ...q, isCurrent: q.quorumHash === 'Q12' }))
        throw new ResponseErrorNotFound()
      }
      return roster.find(q => q.quorumHash === hash)!
    })
    const { container, matrix } = mount()
    await waitFor(() => expect(selection(container)).toContain('Core 288'))
    await waitFor(() => expect(matrix().getAllByRole('button')).toHaveLength(4))
  })

  it('continues through more than 24 replacements and loads memberships on node selection', async () => {
    const { container, client, matrix } = mount()
    await waitFor(() => expect(matrix().getAllByRole('button')).toHaveLength(4))
    fireEvent.click(matrix().getAllByRole('button')[0])
    await waitFor(() => expect(new Set(detailMock.mock.calls.map(c => c[0])).size).toBe(24))
    await waitFor(() =>
      expect(container.querySelectorAll('.QuorumCard__QBtn.is-signed')).toHaveLength(4)
    )
    for (let n = 25; n <= 50; n++) {
      roster = [
        ...roster.slice(1).map(q => ({ ...q, isCurrent: false })),
        { ...quorum(n), isCurrent: true }
      ]
      await refresh(client)
      await waitFor(() => expect(selection(container)).toContain(`Core ${n * 24}`))
      await waitFor(() => expect(matrix().getAllByRole('button')).toHaveLength(4))
      expect(container.querySelectorAll('.QuorumCard__QBtn')).toHaveLength(24)
      expect(container.querySelectorAll('.QuorumCard__Cell--skel')).toHaveLength(0)
    }
  })
})
