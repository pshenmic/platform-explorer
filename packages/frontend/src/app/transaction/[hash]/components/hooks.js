import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import * as Api from '@utils/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '@utils'

export const useTransactionQuery = () => {
  const { hash } = useParams()
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!hash) return

    const fetchData = async () => {
      setState((state) => ({ ...state, loading: true, error: null }))

      try {
        const data = await Api.getTransaction(hash)
        fetchHandlerSuccess(
          () => setState({ data, loading: false, error: null }),
          data
        )
      } catch (error) {
        fetchHandlerError(
          () => setState({ data: null, loading: false, error }),
          error
        )
      }
    }

    fetchData()
  }, [hash])

  return state
}

export const useDecodedSTQuery = (transaction) => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  })

  useEffect(() => {
    if (!transaction) {
      setState({ data: null, loading: false, error: null })
      return
    }

    const fetchData = async () => {
      setState((state) => ({ ...state, loading: true, error: null }))
      const { data: tx } = transaction
      try {
        const data = await Api.decodeTx(tx)
        fetchHandlerSuccess(
          () => setState({ data, loading: false, error: null }),
          data
        )
      } catch (error) {
        fetchHandlerError(
          () => setState({ data: null, loading: false, error }),
          error
        )
      }
    }

    fetchData()
  }, [transaction])

  return state
}

export const useRateQuery = () => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchData = async () => {
      setState((state) => ({ ...state, loading: true, error: null }))

      try {
        const data = await Api.getRate()
        fetchHandlerSuccess(
          () => setState({ data, loading: false, error: null }),
          data
        )
      } catch (error) {
        fetchHandlerError(
          () => setState({ data: null, loading: false, error }),
          error
        )
      }
    }

    fetchData()
  }, [])

  return state
}
