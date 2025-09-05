import { Button, Grid, GridItem, Icon } from '@chakra-ui/react'
import { ProportionsLine } from '../../ui/infographics'
import { Identifier, TimeDelta } from '../../data'
import { LinkContainer } from '../../ui/containers'
import { checkPlatformExtension, ExtensionStatusEnum } from '../../../util/extension'
import { colors } from '../../../styles/colors'
import './ContendersListItem.scss'

function ContendersListItem ({ contender, className }) {
  const isExtensionConnected = checkPlatformExtension() === ExtensionStatusEnum.CONNECTED;

  return (
    <div className={`ContendersListItem ${className || ''}`}>
      <div className={'ContendersListItem__ScrollZone'}>
        <Grid className={'ContendersListItem__Content'}>
          <GridItem className={'ContendersListItem__Column--Timestamp'}>
            <TimeDelta endDate={new Date(contender?.timestamp)}/>
          </GridItem>
          <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Hash'}>
            <LinkContainer
              className={'ContendersListItem__LinkContainer'}
              href={`/transaction/${contender?.documentStateTransition}`}
            >
              <Identifier
                ellipsis={false}
                styles={['highlight-both']}
              >
                {contender?.documentStateTransition}
              </Identifier>
            </LinkContainer>
          </GridItem>
          <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Identity'}>
            <LinkContainer
              className={'ContendersListItem__LinkContainer'}
              href={`/identity/${contender?.identifier}`}
            >
              <Identifier
                avatar={true}
                ellipsis={false}
                styles={['highlight-both']}
              >
                {contender?.identifier}
              </Identifier>
            </LinkContainer>
          </GridItem>
          <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Document'}>
            <LinkContainer
              className={'ContendersListItem__LinkContainer'}
              href={`/document/${contender?.documentIdentifier}`}
            >
              <Identifier
                avatar={true}
                ellipsis={false}
                styles={['highlight-both']}
              >
                {contender?.documentIdentifier}
              </Identifier>
            </LinkContainer>
          </GridItem>
          <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Votes'}>
            <ProportionsLine items={[
              {
                count: contender?.towardsIdentityVotes,
                color: colors.green.emeralds,
                tooltipTitle: 'Towards Identity',
                tooltipContent: <span>{contender?.towardsIdentityVotes} Towards identity votes</span>
              },
              {
                count: contender?.abstainVotes,
                color: colors.orange.default,
                tooltipTitle: 'Abstain',
                tooltipContent: <span>{contender?.abstainVotes} Abstain votes</span>
              },
              {
                count: contender?.lockVotes,
                color: colors.red.default,
                tooltipTitle: 'Lock',
                tooltipContent: <span>{contender?.lockVotes} Lock votes</span>
              }
            ]} />
          </GridItem>
             
          <GridItem className={'ContendersListItem__Column ContendersListItem__Column--Votes'}>
            {
              isExtensionConnected ? 
              <Button className='ContendersListItem__Column_Vote-btn' variant="brand" size="sm">Vote</Button>
              : <>
              <Icon />
              </>
            }
          </GridItem>
        </Grid>
      </div>
    </div>
  )
}

export default ContendersListItem
