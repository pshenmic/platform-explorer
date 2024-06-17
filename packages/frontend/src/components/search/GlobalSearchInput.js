import { useState } from 'react'
import ModalWindow from '../modalWindow'
import * as Api from '../../util/Api'
import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/navigation'

function GlobalSearchInput () {
  const [showModal, setShowModal] = useState(false)
  const [modalText, setModalText] = useState('false')
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')

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

  const search = async () => {
    try {
      const searchResult = await Api.search(searchQuery)

      if (searchResult?.block) {
        setSearchQuery('')
        router.push(`/block/${searchResult?.block.header.hash}`)
        return
      }

      if (searchResult?.transaction) {
        setSearchQuery('')
        router.push(`/transaction/${searchResult?.transaction.hash}`)
        return
      }

      if (searchResult?.dataContract) {
        setSearchQuery('')
        router.push(`/dataContract/${searchResult?.dataContract.identifier}`)
        return
      }

      if (searchResult?.document) {
        setSearchQuery('')
        router.push(`/document/${searchResult?.document.identifier}`)
        return
      }

      showModalWindow('Not found', 6000)
    } catch (e) {
      showModalWindow('Not found', 6000)
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
        <InputGroup size={'md'}>
            <Input
                pr={'4.5rem'}
                value={searchQuery}
                type={'text'}
                placeholder={'Search...'}
                onChange={handleSearchInput}
                onKeyPress={handleKeyPress}
                bg={'gray.900'}
            />
            <InputRightElement width='4.5rem'>
                <Button
                    h={'1.75rem'}
                    size={'sm'}
                    onClick={search}
                    _hover={{ bg: 'whiteAlpha.300' }}
                    bg={'whiteAlpha.200'}
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
