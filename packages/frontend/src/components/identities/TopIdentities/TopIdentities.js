'use client'

import { TopIdentitiesCards } from '../index'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { useState, useEffect } from 'react'
import { Grid, GridItem } from '@chakra-ui/react'
import * as Api from '../../../util/Api'
import './TopIdentities.scss'

export default function TopIdentities ({ className }) {
  const [identities, setIdentities] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getIdentities(1, 3, 'desc', 'balance')
      .then(res => fetchHandlerSuccess(setIdentities, res))
      .catch(err => fetchHandlerError(setIdentities, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(fetchData, [])

  return (
    <div className={`TopIdentities ${className || ''}`}>
      <Grid className={'TopIdentities__ColumnTitles '}>
        <GridItem className={'TopIdentities__ColumnTitle'}>
          Identifier
        </GridItem>
        <GridItem className={'TopIdentities__ColumnTitle'}>
          Balance
        </GridItem>
      </Grid>

      <TopIdentitiesCards items={identities} rate={rate.data}/>
    </div>
  )
}
