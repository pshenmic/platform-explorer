import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './transaction.css'
import {useState} from "react";
import {getTransitionTypeString} from "../../util";
import {StateTransitionEnum} from "../enums/state.transition.type";

export async function loader({params}) {
    const {txHash} = params

    const transaction = await Api.getTransaction(txHash);

    return {transaction};
}

function TransactionRoute() {
    const {transaction} = useLoaderData();

    const decodeTx = (tx) => {
        if (decodedST) {
            return
        }
        setDecoding(true)
        setDecodingError(false)
        setDecodedST(null)

        Api.decodeTx(tx)
            .then((stateTransition) => {
                setDecoding(false)
                setDecodedST(stateTransition)
                console.log(stateTransition)
            })
            .catch((e) => {
                setDecodingError(e.message)
            })
            .finally(() => setDecoding(false))
    }

    const [decoding, setDecoding] = useState(false)
    const [decodingError, setDecodingError] = useState(null)
    const [decodedST, setDecodedST] = useState(null)

    return (
        <div className={"container"}>
            <div className={"transaction_details"}>
                <div className={"transaction_details_item"}>
                    <span className={"transaction_details_item__title"}>Hash:</span>
                    <span className={"transaction_details_item__value"}>{transaction.hash}</span>
                </div>
                <div className={"transaction_details_item"}>
                    <span className={"transaction_details_item__title"}>Height:</span>
                    <span className={"transaction_details_item__value"}>{transaction.blockHeight}</span>
                </div>
                <div className={"transaction_details_item"}>
                    <span className={"transaction_details_item__title"}>Index:</span>
                    <span className={"transaction_details_item__value"}>{transaction.index}</span>
                </div>
                <div className={"transaction_details_item"}>
                    <span className={"transaction_details_item__title"}>Type:</span>
                    <span className={"transaction_details_item__value"}>{getTransitionTypeString(transaction.type)}</span>
                </div>
                <div className={"transaction_details_item"}>
                    <span className={"transaction_details_item__title"}>Timestamp:</span>
                    <span className={"transaction_details_item__value"}>{transaction.timestamp}</span>
                </div>

                <div className={"transaction_details_item"}>
                    <div className={"transaction_details_item_transaction"}>
                        <div className={"transaction_raw"} onClick={() => decodeTx(transaction.data)}
                             style={{'cursor': decodedST ? 'auto' : 'pointer'}}>
                            {!decoding && !decodingError && !decodedST ? <span>{transaction.data}</span> : null}
                            {decodedST ?
                                <div className={"state_transition"}>
                                    <div className={"state_transition_item"}>
                                        <span>Owner ID:</span>
                                        <span>{decodedST.ownerId}</span>
                                    </div>
                                    <div className={"state_transition_item"}>
                                        <span>State Transition Type:</span>
                                        <span>{decodedST.type} ({getTransitionTypeString(decodedST.type)})</span>
                                    </div>
                                    <div className={"state_transition_item"}>
                                        <span>Identity:</span>
                                        <span>{decodedST.identityId}</span>
                                    </div>
                                    {decodedST.type === StateTransitionEnum.DOCUMENTS_BATCH ?
                                        <div className={"state_transition_item"}>
                                            <span>State Transitions:</span>
                                            <span>{decodedST.transitions.length}</span>
                                        </div> : null}
                                </div>
                                : null}

                            <div className={decoding ? 'tooltip loader' : 'disable'}/>
                            <span className={decodingError ? null : 'disable'}>{decodingError}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransactionRoute;
