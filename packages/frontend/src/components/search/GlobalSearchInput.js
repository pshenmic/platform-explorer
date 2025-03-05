import { useState, useEffect } from 'react'
import ModalWindow from '../modalWindow'
import * as Api from '../../util/Api'
import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
// import { useRouter } from 'next/navigation'
import {
  ResponseErrorNotFound,
  ResponseErrorTimeout,
  ResponseErrorInternalServer
} from '../../util/Errors'
import './GlobalSearchInput.scss'
import mockSearchResults from '../layout/navbar/mockSearchResults'

import { fetchHandlerSuccess, fetchHandlerError } from '../../util'

function GlobalSearchInput ({ onResultChange }) {
  const [showModal, setShowModal] = useState(false)
  const [modalText, setModalText] = useState('false')
  // const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let timer
    if (showModal) {
      timer = setTimeout(() => {
        setShowModal(false)
        setModalText('')
      }, 6000)
    }
    return () => clearTimeout(timer)
  }, [showModal])

  const showModalWindow = (text, timeout) => {
    setShowModal(true)
    setModalText(text)

    if (timeout) {
      setTimeout(() => {
        setShowModal(false)
        setModalText('')
      }, timeout)
    }
  }

  // const searchRedirect = (url) => {
  //   setSearchQuery('')
  //   router.push(url)
  // }

  const search = async () => {
    try {
      onResultChange({ data: {}, loading: true, error: false })

      Api.search(searchQuery)
        .then(res => fetchHandlerSuccess(onResultChange, mockSearchResults))
        .catch(err => fetchHandlerError(onResultChange, err))

      // const searchResult = await Api.search(searchQuery)

      // fetchHandlerSuccess(onResultChange, mockSearchResults)

      // const searchTypeMap = {
      //   block: `/block/${searchResult?.block?.header?.hash}`,
      //   transaction: `/transaction/${searchResult?.transaction?.hash}`,
      //   dataContract: `/dataContract/${searchResult?.dataContract?.identifier}`,
      //   dataContracts: `/dataContract/${searchResult?.dataContracts?.[0].identifier}`,
      //   document: `/document/${searchResult?.document?.identifier}`,
      //   identity: `/identity/${searchResult?.identity?.identifier}`,
      //   identities: `/identity/${searchResult?.identities?.[0].identifier}`,
      //   validator: `/validator/${searchResult?.validator?.proTxHash}`
      // }

      // for (const key in searchTypeMap) {
      //   if (searchResult[key]) {
      //     searchRedirect(searchTypeMap[key])
      //     return
      //   }
      // }

      // showModalWindow('Not found', 6000)
    } catch (e) {
      console.error(e)

      const errorMessage = (() => {
        if (e instanceof ResponseErrorNotFound ||
            e instanceof ResponseErrorTimeout ||
            e instanceof ResponseErrorInternalServer) {
          return e.message
        }
        return 'Request error'
      })()

      showModalWindow(errorMessage)
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      search()
    }
  }

  const handleSearchInput = (event) => {
    setSearchQuery(event.target.value)
  }

  return (
    <div>
      <InputGroup size={'md'} className={'GlobalSearchInput'}>
          <Input
            pr={'4.5rem'}
            value={searchQuery}
            type={'text'}
            placeholder={'Search...'}
            onChange={handleSearchInput}
            onKeyPress={handleKeyPress}
            color={'gray.250'}
            fontSize={'12px'}
            className={'GlobalSearchInput__Field'}
          />
          <InputRightElement>
            <Button
              h={'28px'}
              w={'28px !important'}
              minW={'none'}
              size={'sm'}
              onClick={search}
              className={'GlobalSearchInput__Button'}
            >
              <SearchIcon color={'whiteAlpha.900'}/>
            </Button>
        </InputRightElement>
      </InputGroup>

      <ModalWindow
        open={showModal}
        text={modalText}
        setShowModal={setShowModal}
      />
    </div>
  )
}

export default GlobalSearchInput
