import { Grid, GridItem } from '@chakra-ui/react'
import { BigNumber, Identifier, NotActive, TimeDelta } from '../../data'
import { LinkContainer, ValueContainer } from '../../ui/containers'
import { useRouter } from 'next/navigation'
import { RateTooltip } from '../../ui/Tooltips'
import './DocumentsRevisionsListItem.scss'

function DocumentsRevisionsListItem ({ revision, rate }) {
  const router = useRouter()

  console.log('revision', revision)
  console.log('revision?.txHash', revision?.txHash)

  return (
    <div className={'DocumentsRevisionsListItem'}>
      <Grid className={'DocumentsRevisionsListItem__Content'}>
        <GridItem className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--Timestamp'}>
          <TimeDelta endDate={revision?.timestamp}/>
        </GridItem>

        <GridItem className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--TxHash'}>
          {revision?.txHash
            ? <ValueContainer
                link={`/transaction/${revision?.txHash}`}
                light={true}
                size={'xxs'}
                clickable={true}
              >
                <Identifier ellipsis={true} styles={['highlight-both']}>{revision?.txHash}</Identifier>
              </ValueContainer>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--Owner'}>
          {revision?.owner
            ? <LinkContainer
                className={'DocumentsRevisionsListItem__ColumnContent'}
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  router.push(`/identity/${revision?.owner}`)
                }}
              >
                <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>{revision?.owner}</Identifier>
              </LinkContainer>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--GasUsed DocumentsRevisionsListItem__Column--Credits'}>
          {revision?.gasUsed
            ? <RateTooltip credits={revision?.gasUsed} rate={rate}>
              <span><BigNumber>{revision?.gasUsed}</BigNumber></span>
            </RateTooltip>
            : <NotActive>-</NotActive>
          }
        </GridItem>

        <GridItem className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--Revision DocumentsRevisionsListItem__Column--Number'}>
          {revision?.revision}
        </GridItem>
      </Grid>
    </div>
  )
}

export default DocumentsRevisionsListItem
