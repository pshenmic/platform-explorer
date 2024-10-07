import './ValidatorCard.scss'
import { Identifier, DateBlock, Endpoint, IpAddress, InfoLine } from '../data'
import ImageGenerator from '../imageGenerator'
import { HorisontalSeparator } from '../ui/separators'

function Credits ({ credits, usd, format }) {
  return (
    <span>
      <span>{credits} CREDITS</span>
      <span>({credits / 1000} DASH)</span>
      <span>~{usd}$</span>
    </span>
  )
}

export default function ValidatorCard ({ validator }) {
  console.log('validator', validator)

  if (validator.error) {
    return
  }

  if (validator.loading) {
    return
  }
  
  return (
    <div className={'InfoBlock InfoBlock--Gradient ValidatorCard'}>
      <div className={'ValidatorCard__Header'}>
        <div className={'ValidatorCard__Avatar'}>
          <ImageGenerator
            username={validator.data.proTxHash}
            lightness={50}
            saturation={50}
            width={88}
            height={88}/>  
        </div>

        <div className={'ValidatorCard__HeaderLines'}>
          <InfoLine
            title={'Pro TX Hash'}
            value={(
              <Identifier
                className={''}
                copyButton={true}
                styles={['gradient-both']}
              >
                {validator.data.proTxHash}
              </Identifier>
            )}
          />
          <InfoLine
            title={'Balance'}
            value={<Credits credits={85800000} usd={'209.15'} />}
          />
        </div>
      </div>

      <HorisontalSeparator className={'ValidatorCard__Separator'}/>

      <InfoLine
        title={'Creation Date'}
        value={<DateBlock timestamp={1727887511000}/>}
      />

      <InfoLine
        title={'Block Height'}
        value={'#10225'}
      />

      <InfoLine
        title={'Identity Address'}
        value={(
          <Identifier
            className={''}
            copyButton={true}
            styles={['gradient-both']}
          >
            23975732199C674FD2133FA9F08454D809561DC24E6E941D78FF414C528ABA67
          </Identifier>
        )}
      />

      <InfoLine
        title={'Node ID'}
        value={(
          <Identifier
            className={''}
            copyButton={true}
            styles={['gradient-both']}
          >
            50d847734406592420320c864eb572fb900e5c36
          </Identifier>
        )}
      />
    </div>
  )
}
