'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound, creditsToDash } from '../../util'
import { InfoCard, ValueCard } from '../cards'
import EpochProgress from '../networkStatus/EpochProgress'
import { Identifier } from '../data'
import { Slider, SliderElement } from '../ui/Slider'
import { WheelControls } from '../ui/Slider/plugins'
import { Flex, Text, Box } from '@chakra-ui/react'
import ImageGenerator from '../imageGenerator'
import { InfoIcon } from '@chakra-ui/icons'
import { RateTooltip, EpochTooltip } from '../ui/Tooltips'
import './ValidatorsTotal.scss'
import './ValidatorsTotalCard.scss'

export default function ValidatorsTotal () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [validators, setValidators] = useState({ data: {}, loading: true, error: false })
  const [epoch, setEpoch] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getStatus()
      .then(res => {
        fetchHandlerSuccess(setStatus, res)

        Api.getEpoch(res?.epoch?.number)
          .then(res => fetchHandlerSuccess(setEpoch, res))
          .catch(err => fetchHandlerError(setEpoch, err))
      })
      .catch(err => fetchHandlerError(setStatus, err))

    Api.getValidators(1, 10)
      .then(res => fetchHandlerSuccess(setValidators, res))
      .catch(err => fetchHandlerError(setValidators, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(fetchData, [])

  return (
    <div className={'ValidatorsTotal slider-container'}>
      <Slider
        className={'ValidatorsTotal__Slider'}
        settings={{
          rubberband: false,
          renderMode: 'performance',
          breakpoints: {
            '(min-width: 600px)': {
              slides: { perView: 2 }
            }
          },
          slides: {
            origin: 'center',
            perView: 1.1
          }
        }}
        plugins={[WheelControls]}
      >
        <SliderElement className={'ValidatorsTotal__CardsColumn'}>
          <InfoCard className={'ValidatorsTotal__Card ValidatorsTotalCard'} loading={status.loading}>
            <div className={'ValidatorsTotalCard__Title'}>Epoch</div>
            <div className={'ValidatorsTotalCard__Value'}>
              {typeof status?.data?.epoch?.number === 'number'
                ? <EpochTooltip epoch={status.data.epoch}>
                    <div className={'ValidatorsTotalCard__EpochNumber'}>
                      #{status.data.epoch.number}
                      <InfoIcon ml={2} color={'brand.light'} boxSize={4}/>
                    </div>
                  </EpochTooltip>
                : 'n/a'}
            </div>
            {status?.data?.epoch && <EpochProgress epoch={status.data.epoch} className={'ValidatorsTotalCard__EpochProgress'}/>}
          </InfoCard>
          <InfoCard className={'ValidatorsTotal__Card ValidatorsTotalCard ValidatorsTotalCard--Fees'} loading={status.loading}>
            <div className={'ValidatorsTotalCard__Title'}>Fees collected</div>
            <div className={'ValidatorsTotalCard__Value'}>
              <div className={'ValidatorsTotalCard__TotalCollectedFees'}>
                {typeof epoch?.data?.totalCollectedFees === 'number'
                  ? <RateTooltip
                      credits={epoch.data.totalCollectedFees}
                      rate={rate.data}
                    >
                      <span>
                        {currencyRound(epoch.data.totalCollectedFees)}
                        <InfoIcon ml={2} color={'brand.light'} boxSize={4}/>
                      </span>
                    </RateTooltip>
                  : 'n/a'}
              </div>
              <Flex fontFamily={'mono'} fontSize={'0.75rem'} fontWeight={'normal'}>
                <Text color={'gray.500'} mr={'8px'}>Last 24h: </Text>
                <Text>
                  {typeof status.data?.totalCollectedFeesDay === 'number'
                    ? currencyRound(status.data.totalCollectedFeesDay)
                    : 'n/a'}
                </Text>
              </Flex>
            </div>
          </InfoCard>
        </SliderElement>
        <SliderElement className={'ValidatorsTotal__CardsColumn'}>
          <InfoCard
            className={'ValidatorsTotal__Card ValidatorsTotalCard ValidatorsTotalCard--BestValidator'}
            loading={status.loading}
          >
            <div className={'ValidatorsTotalCard__Title'}>Best Validator</div>
            <div className={'ValidatorsTotalCard__Value'}>
              {epoch?.data?.bestValidator
                ? <ValueCard
                  link={epoch?.data?.bestValidator ? `/validator/${epoch?.data?.bestValidator}` : undefined}
                  className={'ValidatorsTotalCard__Value'}
                >
                  <Identifier avatar={true} copyButton={true} styles={['highlight-both']}>
                    {epoch.data.bestValidator}
                  </Identifier>
                </ValueCard>
                : 'n/a'
              }
            </div>
          </InfoCard>
          <InfoCard className={'ValidatorsTotal__Card ValidatorsTotalCard ValidatorsTotalCard--TotalValidators'} loading={validators.loading}>
            <div className={'ValidatorsTotalCard__Title'}>Total validators</div>
            <div className={'ValidatorsTotalCard__Value'}>
              <div>
                {typeof validators?.data?.pagination?.total === 'number'
                  ? validators.data.pagination.total
                  : 'n/a'}
                </div>
              </div>
              <Flex>
                {validators.data?.resultSet?.map((validator, i) => (
                  <Box opacity={ 1 - 0.1 * i } key={i}>
                    <ImageGenerator
                      className={''}
                      username={validator.proTxHash}
                      lightness={50}
                      saturation={50}
                      width={32}
                      height={32}
                    />
                  </Box>
                ))}
              </Flex>
          </InfoCard>
        </SliderElement>
      </Slider>
    </div>
  )
}
