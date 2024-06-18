'use client'

import { CardsBlock } from '../../components/dataContracts'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'

export default function Cards () {
  const [dataContracts, setDataContracts] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getDataContracts(1, 4, 'desc', 'documents_count')
      .then(res => fetchHandlerSuccess(setDataContracts, res))
      .catch(err => fetchHandlerError(setDataContracts, err))
  }

  useEffect(fetchData, [])

  return <CardsBlock title={'Top Contracts:'} items={dataContracts}/>
}
