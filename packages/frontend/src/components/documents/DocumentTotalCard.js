import ImageGenerator from '../imageGenerator'
import { DateBlock, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { ValueCard } from '../cards'
import './DocumentTotalCard.js.scss'

function DocumentTotalCard ({ document, className }) {
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
        </div>
      </div>

      <HorisontalSeparator className={'DocumentTotalCard__Separator'}/>

      <div className={'DocumentTotalCard__CommonInfo'}>
        <InfoLine
          title={'Revision'}
          value={document.data?.version}
          loading={document.loading}
          error={document.error}
        />

        <InfoLine
          title={'Creation Date'}
          value={<DateBlock timestamp={document.data?.timestamp}/>}
          loading={document.loading}
          error={document.error}
        />
      </div>
    </div>
  )
}

export default DocumentTotalCard
