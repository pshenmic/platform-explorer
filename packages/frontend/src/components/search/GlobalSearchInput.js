import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";
import ModalWindow from "../ModalWindow";
import * as Api from '../../util/Api'
import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'


function GlobalSearchInput () {
    let navigate = useNavigate();
        
    const [showModal, setShowModal] = useState(false)
    const [modalText, setModalText] = useState("false")

    const [searchQuery, setSearchQuery] = useState("");

    const showModalWindow = (text, timeout) => {
        setShowModal(true)
        setModalText(text)

        if (timeout) {
            setTimeout(() => {
                setShowModal(false)
                setModalText("")
            }, timeout)
        }
    }

    const search = async () => {
        try {
            const searchResult = await Api.search(searchQuery)

            if (searchResult?.block) {
                // redirect to blocks
                setSearchQuery("")
                return navigate(`/block/${searchResult?.block.header.hash}`)
            }

            if (searchResult?.transaction) {
                setSearchQuery("")
                return navigate(`/transaction/${searchResult?.transaction.hash}`)
            }

            if (searchResult?.dataContract) {
                setSearchQuery("")
                return navigate(`/dataContract/${searchResult?.dataContract.identifier}`)
            }
            
            if (searchResult?.document) {
                setSearchQuery("")
                return navigate(`/document/${searchResult?.document.identifier}`)
            }
            
            showModalWindow('Not found', 6000)
        } catch (e) {
            showModalWindow('Not found', 6000)
        }
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            search();
        }
    }

    const handleSearchInput = (event) => {
        setSearchQuery(event.target.value)
    }


    return (
        <div>
            <InputGroup size='md'>
                <Input
                    pr='4.5rem'
                    value={searchQuery} 
                    type="text" 
                    placeholder="Search..." 
                    onChange={handleSearchInput}
                    onKeyPress={handleKeyPress}
                    bg='gray.900'
                />
                <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={search}>
                        <SearchIcon/>
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

export default GlobalSearchInput;
