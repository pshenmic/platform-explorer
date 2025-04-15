import { Grid, GridItem } from '@chakra-ui/react'
import { EmptyListMessage } from '../../ui/lists'
import ContendersListItem from './ContendersListItem'
import './ContendersList.scss'

function ContendersList ({ contenders = [], className }) {
  return (
    <div className={`PublicKeysList ${className || ''}`}>
      <div className={'PublicKeysList__ScrollZone'}>
        <Grid className={'PublicKeysList__ColumnTitles'}>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Id'}>
            Key Id
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--PublicKeyHash'}>
            Public Key Hash
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Type'}>
            Type
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Purpose'}>
            Purpose
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--SecurityLevel'}>
            Security Level
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--ReadOnly'}>
            Read Only
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Data'}>
            Data
          </GridItem>
        </Grid>

        {contenders?.length > 0 &&
          contenders.map((contender, i) => <ContendersListItem contender={contender} key={i}/>)
        }

        {contenders?.length === 0 &&
          <EmptyListMessage>There are no public keys</EmptyListMessage>
        }
      </div>
    </div>
  )
}

export default ContendersList
