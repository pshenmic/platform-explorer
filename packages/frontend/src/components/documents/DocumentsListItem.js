import { Grid, GridItem } from '@chakra-ui/react'
import { Identifier, Credits } from '../data'
import { ValueContainer } from '../ui/containers'
import { RateTooltip } from '../ui/Tooltips'
import Link from 'next/link'
import { forwardRef, useRef, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import './DocumentsListItem.scss'

const mobileWidth = 550

function DocumentsListItem ({ document, withdrawal }) {
  const containerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const clickable = isMobile && withdrawal?.hash

  console.log('document', document)

  useResizeObserver(containerRef, () => {
    const { offsetWidth } = containerRef.current
    setIsMobile(offsetWidth <= mobileWidth)
  })

  const Wrapper = forwardRef(function Wrapper (props, ref) {
    return clickable
      ? <Link ref={ref} href={`/transaction/${withdrawal?.hash}`} className={props.className}>{props.children}</Link>
      : <div ref={ref} className={props.className}>{props.children}</div>
  })

  const ItemWrapper = ({ isLocal, children, ...props }) => {
    return clickable
      ? <div {...props}>{children}</div>
      : isLocal
        ? <Link {...props}>{children}</Link>
        : <a {...props}>{children}</a>
  }

  return (
    <div ref={containerRef} className={`DocumentsListItem ${clickable ? 'DocumentsListItem--Clickable' : ''}`}>
      <Wrapper className={'DocumentsListItem__ContentWrapper'}>
        <Grid className={'DocumentsListItem__Content'}>
          <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Timestamp'}>
            {new Date(document?.timestamp).toLocaleString()}

          </GridItem>

          <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Identifier'}>
            {document?.identifier
              ? <ItemWrapper className={'DocumentsListItem__ColumnContent'} isLocal={true} href={'/document/' + document?.identifier}>
                <ValueContainer className={''} light={true} clickable={true}>
                  <Identifier styles={['highlight-both']}>{document?.identifier}</Identifier>
                </ValueContainer>
              </ItemWrapper>
              : '-'
            }
          </GridItem>

          <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Owner'}>
            {document?.owner
              ? <ItemWrapper className={'DocumentsListItem__ColumnContent'} isLocal={true} href={'/identity/' + document?.owner}>
                <ValueContainer className={''} light={true} clickable={true}>
                  <Identifier styles={['highlight-both']}>{document?.owner}</Identifier>
                </ValueContainer>
              </ItemWrapper>
              : '-'
            }
          </GridItem>
        </Grid>
      </Wrapper>
    </div>
  )
}

export default DocumentsListItem

// export default function DocumentsListItem ({ document }) {
//   const { identifier, timestamp } = document
//
//   return (
//     <Link
//         href={`/document/${identifier}`}
//         className={'DocumentsListItem'}
//     >
//         <div className={'DocumentsListItem__Identifier'}>
//             {identifier}
//         </div>
//
//         <div className={'DocumentsListItem__Timestamp'}>
//             {new Date(timestamp).toLocaleString()}
//         </div>
//     </Link>
//   )
// }
