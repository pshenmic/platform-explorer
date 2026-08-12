import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import * as Api from '@utils/Api'
import type { Transaction, Rate } from '../../../../types'
import type { LoadableState } from '../../../../types/common'
import type { DecodedStateTransition } from './types'

const initialLoading = <T>(loading = true): LoadableState<T> => ({
  data: null,
  loading,
  error: false
})

export const useTransactionQuery = (): LoadableState<Transaction> => {
  const params = useParams()
  const hashParam = params?.hash
  const hash = Array.isArray(hashParam) ? hashParam[0] : hashParam

  const [state, setState] = useState<LoadableState<Transaction>>(initialLoading())

  useEffect(() => {
    if (!hash) return

    const fetchData = async (): Promise<void> => {
      setState(prev => ({ ...prev, loading: true, error: false }))

      try {
        const data = await Api.getTransaction(hash)
        setState({ data, loading: false, error: false })
      } catch (error) {
        console.error(error)
        setState({ data: null, loading: false, error: true })
      }
    }

    fetchData()
  }, [hash])

  return state
}

export const useDecodedSTQuery = (
  transaction: Transaction | null | undefined
): LoadableState<DecodedStateTransition> => {
  const [state, setState] = useState<LoadableState<DecodedStateTransition>>(initialLoading(false))

  useEffect(() => {
    if (!transaction) {
      setState({ data: null, loading: false, error: false })
      return
    }

    const fetchData = async (): Promise<void> => {
      setState(prev => ({ ...prev, loading: true, error: false }))
      const tx = transaction.data
      if (!tx) {
        setState({ data: null, loading: false, error: true })
        return
      }

      try {
        const data = (await Api.decodeTx(tx)) as DecodedStateTransition
        setState({ data, loading: false, error: false })
      } catch (error) {
        console.error(error)
        setState({ data: null, loading: false, error: true })
      }
    }

    fetchData()
  }, [transaction])

  return state
}

export const useRateQuery = (): LoadableState<Rate> => {
  const [state, setState] = useState<LoadableState<Rate>>(initialLoading())

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setState(prev => ({ ...prev, loading: true, error: false }))

      try {
        const data = await Api.getRate()
        setState({ data, loading: false, error: false })
      } catch (error) {
        console.error(error)
        setState({ data: null, loading: false, error: true })
      }
    }

    fetchData()
  }, [])

  return state
}
