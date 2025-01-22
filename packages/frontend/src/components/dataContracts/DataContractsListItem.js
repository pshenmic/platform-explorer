import Link from 'next/link'
import { Alias, Identifier, BigNumber } from '../data'
import ValueContainer from '../ui/containers/ValueContainer'
import { Grid, GridItem } from '@chakra-ui/react'
import './DataContractsListItem.scss'

function DataContractsListItem ({ dataContract }) {
  console.log('dataContract', dataContract)

  return (
    <Link
      href={`/dataContract/${dataContract?.identifier}`}
      className={'DataContractsListItem'}
    >
      <Grid className={'DataContractsListItem__Content'}>
        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--Identifier'}>
          <div className={'DataContractsListItem__IdentifierContainer'}>
            {dataContract?.name
              ? <Alias avatarSource={dataContract?.identifier}>{dataContract.name}</Alias>
              : <Identifier
                  className={'DataContractsListItem__Identifier'}
                  avatar={true}
                  styles={['highlight-both']}
                  ellipsis={true}
                >
                {dataContract.identifier}
              </Identifier>}
          </div>
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--DocumentsCount'}>
          <ValueContainer colorScheme={dataContract?.documentsCount > 0 ? 'brand' : 'darkGray'} size={'xs'}>
            <BigNumber>{dataContract?.documentsCount}</BigNumber>
          </ValueContainer>
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--Timestamp'}>
          {(typeof dataContract?.timestamp === 'string')
            ? <div className={'DataContractsListItem__Timestamp'}>
                {new Date(dataContract?.timestamp).toLocaleString()}
              </div>
            : dataContract?.isSystem && <div className={'DataContractsListItem__SystemLabel'}>SYSTEM</div>
          }
        </GridItem>
      </Grid>
    </Link>
  )

  // return (
  //   <Link
  //     href={`/dataContract/${dataContract?.identifier}`}
  //     className={'DataContractsListItem'}
  //   >
  //     <div className={'DataContractsListItem__IdentifierContainer'}>
  //       {dataContract?.name
  //         ? <>
  //             <ImageGenerator className={'DataContractsListItem__Avatar'} username={dataContract?.identifier} lightness={50} saturation={50} width={24} height={24}/>
  //             <Alias>{dataContract.name}</Alias>
  //           </>
  //         : <Identifier
  //           className={'DataContractsListItem__Identifier'}
  //           avatar={true}
  //           styles={['highlight-both']}
  //           ellipsis={false}
  //         >
  //           {dataContract.identifier}
  //         </Identifier>}
  //     </div>
  //
  //     {dataContract?.isSystem && <div className={'DataContractsListItem__SystemLabel'}>SYSTEM</div>}
  //
  //     {(typeof dataContract?.timestamp === 'string') &&
  //       <div className={'DataContractsListItem__Timestamp'}>
  //         <DateBlock timestamp={dataContract?.timestamp} format={'dateOnly'} showTime={true}/>
  //       </div>
  //     }
  //   </Link>
  // )
}

export default DataContractsListItem
