import ImageGenerator from '../imageGenerator'
import { DateBlock, Identifier, InfoLine, PrefundedBalance } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { ValueCard } from '../cards'
import { Badge } from '@chakra-ui/react'
import './DocumentTotalCard.js.scss'

function DocumentTotalCard ({ document, rate, className }) {
  console.log('document', document)

  return (
    <div className={`InfoBlock InfoBlock--Gradient DocumentTotalCard ${document?.loading ? 'DocumentTotalCard--Loading' : ''} ${className || ''}`}>
      {document?.data?.name &&
        <div className={'DocumentTotalCard__Title'}>
          {document?.data.name}
        </div>
      }

      <div className={'DocumentTotalCard__Header'}>
        <div className={'DocumentTotalCard__Avatar'}>
          {!document?.error
            ? <ImageGenerator
              username={document.data?.identifier}
              lightness={50}
              saturation={50}
              width={88}
              height={88}
            />
            : 'n/a'
          }
        </div>

        <div className={'DocumentTotalCard__HeaderLines'}>
          <InfoLine
            className={'DocumentTotalCard__Identifier'}
            title={'Identifier'}
            loading={document.loading}
            error={document.error || !document.data?.identifier}
            value={
              <Identifier
                className={''}
                copyButton={true}
                styles={['highlight-both', `size-${document.data?.identifier?.length}`]}
                ellipsis={false}
              >
                {document.data?.identifier}
              </Identifier>
            }
          />

          <InfoLine
            className={'DocumentTotalCard__DataContract'}
            title={'Data Contract'}
            loading={document.loading}
            error={document.error}
            value={
              <ValueCard link={`/dataContract/${document.data?.dataContractIdentifier}`}>
                <Identifier
                  avatar={true}
                  className={''}
                  copyButton={true}
                  styles={['highlight-both']}
                  ellipsis={false}
                >
                  {document.data?.dataContractIdentifier}
                </Identifier>
              </ValueCard>
            }
          />

          <InfoLine
            className={'DocumentTotalCard__Owner'}
            title={'Owner'}
            loading={document.loading}
            error={document.error}
            value={
              <ValueCard link={`/identity/${document.data?.owner}`}>
                <Identifier
                  avatar={true}
                  className={''}
                  copyButton={true}
                  styles={['highlight-both']}
                  ellipsis={false}
                >
                  {document.data?.owner}
                </Identifier>
              </ValueCard>
            }
          />

          <InfoLine
            title={'Revision'}
            value={document.data?.revision}
            loading={document.loading}
            error={document.error || document.data?.revision === undefined}
          />
        </div>
      </div>

      <HorisontalSeparator className={'DocumentTotalCard__Separator'}/>

      <div className={'DocumentTotalCard__CommonInfo'}>

        <InfoLine
          className={'DocumentTotalCard__Entropy'}
          title={'Entropy'}
          loading={document.loading}
          error={document.error || !document.data?.entropy}
          value={
            <Identifier
              className={''}
              copyButton={true}
              styles={['highlight-both', `size-${document.data?.entropy?.length}`]}
              ellipsis={false}
            >
              {document.data?.entropy}
            </Identifier>
          }
        />

        <InfoLine
          title={'System'}
          value={<Badge colorScheme={'gray'}>{document.data?.system ? 'Yes' : 'No'}</Badge>}
          loading={document.loading}
          error={document.error || !document.data?.timestamp}
        />

        <InfoLine
          title={'Identity Contract Nonce'}
          value={document.data?.nonce}
          loading={document.loading}
          error={document.error || document.data?.nonce === undefined}
        />

        <InfoLine
          title={'Deleted'}
          value={<Badge colorScheme={'gray'}>{document.data?.deleted ? 'true' : 'false'}</Badge>}
          loading={document.loading}
          error={document.error || document.data?.deleted === undefined}
        />

        {document.data?.prefundedVotingBalance &&
          <InfoLine
            title={'Prefunded Voting Balance'}
            value={<PrefundedBalance prefundedBalance={document.data?.prefundedVotingBalance} rate={rate}/>}
            loading={document.loading}
            error={document.error}
          />
        }

        <InfoLine
          title={'Timestamp'}
          value={<DateBlock timestamp={document.data?.timestamp}/>}
          loading={document.loading}
          error={document.error || !document.data?.timestamp}
        />
      </div>
    </div>
  )
}

export default DocumentTotalCard
