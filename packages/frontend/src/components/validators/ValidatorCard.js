import { Identifier, InfoLine, CreditsBlock } from '../data'
import ImageGenerator from '../imageGenerator'
import { HorisontalSeparator } from '../ui/separators'
import Link from 'next/link'
import './ValidatorCard.scss'

export default function ValidatorCard ({ validator, rate, className }) {
  return (
    <div className={`InfoBlock InfoBlock--Gradient ValidatorCard ${validator.loading ? 'ValidatorCard--Loading' : ''} ${className || ''}`}>
      <div className={'ValidatorCard__Header'}>
        <div className={'ValidatorCard__HeaderLines'}>
          <InfoLine
            className={'ValidatorCard__ProTxHash'}
            title={'Pro TX Hash'}
            loading={validator.loading}
            error={validator.error}
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
            value={<CreditsBlock credits={validator.data?.identityBalance} rate={rate}/>}
            loading={validator.loading}
            error={validator.error}
          />
        </div>
        <div className={'ValidatorCard__Avatar'}>
          {!validator.error
            ? <ImageGenerator
              username={validator.data.proTxHash}
              lightness={50}
              saturation={50}
              width={88}
              height={88}
            />
            : 'n/a'
          }
        </div>
      </div>

      <HorisontalSeparator className={'ValidatorCard__Separator'}/>

      <div className={'ValidatorCard__CommonInfo'}>

        {/* Will be activated later /*}

        {/* <InfoLine
          className={'ValidatorCard__InfoLine'}
          title={'Creation Date'}
          value={<DateBlock timestamp={1727887511000}/>}
          loading={validator.loading}
          error={validator.error}
        /> */}

        {/* <InfoLine
          className={'ValidatorCard__InfoLine'}
          title={'Block Height'}
          value={(
            <span className={'ValidatorCard__BlockHeighValue'}>#10225</span>
          )}
          loading={validator.loading}
          error={validator.error}
        /> */}

        <InfoLine
          className={'ValidatorCard__InfoLine ValidatorCard__InfoLine--IdentityAddress'}
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
          error={validator.error}
        />

        <InfoLine
          className={'ValidatorCard__InfoLine  ValidatorCard__InfoLine--NodeId'}
          title={'Node ID'}
          value={(
            <Identifier
              className={''}
              copyButton={true}
              styles={['highlight-both']}
              ellipsis={false}
            >
              {validator.data?.proTxInfo?.state?.platformNodeID}
            </Identifier>
          )}
          loading={validator.loading}
          error={validator.error}
        />
      </div>
    </div>
  )
}
