import {Outlet, Link} from "react-router-dom";
import "./root.css";
import React, {useState} from 'react';
import * as Api from '../util/Api'
import {useNavigate} from "react-router-dom";
import ModalWindow from "./ModalWindow";

export default function RootComponent() {
    let navigate = useNavigate();

    const [showModal, setShowModal] = useState(false)
    const [modalText, setModalText] = useState("false")

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

    const handleKeyPress = async (event) => {
        if (event.key === 'Enter') {
            try {
                const searchResult = await Api.search(searchQuery)

                if (searchResult?.block) {
                    // redirect to blocks
                    console.log(searchResult?.block.header.hash)
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
    }

    const handleSearchInput = (event) => {
        setSearchQuery(event.target.value)
    }

    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div>
            <div className="topnav">
                <Link to="/">Home</Link>
                <Link to="/blocks">Blocks</Link>
                <Link to="/dataContracts">Data Contracts</Link>
                <input value={searchQuery} type="text" placeholder="Search..." onChange={handleSearchInput}
                       onKeyPress={handleKeyPress}/>
                <ModalWindow open={showModal} text={modalText} setShowModal={setShowModal}/>
            </div>
            <Outlet/>

            <div className={"modal"}>
                <div className={"modal_container"}>
                    <div className={"modal_message"} style={{padding: '20px'}}>
                        Testnet is down for a moment<br/>
                        <br/>
                        Watch our discord #testnet channel<br/> for updates https://discord.gg/UbcUSse7
                    </div>
                </div>
            </div>
        </div>
    );
}
