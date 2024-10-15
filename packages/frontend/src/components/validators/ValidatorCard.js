import './ValidatorCard.scss'
import { Identifier, DateBlock, InfoLine, CreditsBlock } from '../data'
import ImageGenerator from '../imageGenerator'
import { HorisontalSeparator } from '../ui/separators'
import Link from 'next/link'

export default function ValidatorCard ({ validator, identity, rate, className }) {
  console.log('validator', validator)
  console.log('identity', identity)

  return (
    <div className={`InfoBlock InfoBlock--Gradient ValidatorCard ${validator.loading ? 'ValidatorCard--Loading' : ''} ${className || ''}`}>
      <div className={'ValidatorCard__Header'}>
        <div className={'ValidatorCard__Avatar'}>
          {!validator.error
            ? <ImageGenerator
                username={validator.data.proTxHash}
                lightness={50}
                saturation={50}
                width={88}
                height={88}/>
            : ''
          }
        </div>

        <div className={'ValidatorCard__HeaderLines'}>
          <InfoLine
            className={'ValidatorCard__ProTxHash'}
            title={'Pro TX Hash'}
            loading={validator.loading}
            value={(!validator.error
              ? <Identifier
                  className={''}
                  copyButton={true}
                  styles={['highlight-both']}
                  ellipsis={false}
                >
                  {validator.data.proTxHash}
                </Identifier>
              : 'n/a'
            )}
          />
          <InfoLine
            title={'Balance'}
            value={!identity.error
              ? <CreditsBlock credits={identity.data?.balance} rate={rate}/>
              : 'n/a'
            }
            loading={identity.loading}
          />
        </div>
      </div>

      <HorisontalSeparator className={'ValidatorCard__Separator'}/>

      <InfoLine
        className={'ValidatorCard__InfoLine'}
        title={'Creation Date'}
        value={<DateBlock timestamp={1727887511000}/>}
        loading={validator.loading}
      />

      <InfoLine
        className={'ValidatorCard__InfoLine'}
        title={'Block Height'}
        value={(
          <span className={'ValidatorCard__BlockHeighValue'}>#10225</span>
        )}
        loading={validator.loading}
      />

      <InfoLine
        className={'ValidatorCard__InfoLine'}
        title={'Identity Address'}
        value={(
          <Link href={`/identity/${validator.data?.identity}`}>
            <Identifier
              className={''}
              copyButton={true}
              styles={['highlight-both']}
              ellipsis={false}
              clickable={true}
            >
              {validator.data?.identity}
            </Identifier>
          </Link>
        )}
        loading={validator.loading}
      />

      <InfoLine
        className={'ValidatorCard__InfoLine'}
        title={'Node ID'}
        value={(
          <Identifier
            className={''}
            copyButton={true}
            styles={['highlight-both']}
            ellipsis={false}
          >
            50d847734406592420320c864eb572fb900e5c36
          </Identifier>
        )}
        loading={validator.loading}
      />
    </div>
  )
}
