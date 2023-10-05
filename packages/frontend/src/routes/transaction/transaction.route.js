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
            </div>
        </div>
    );
}

export default TransactionRoute;
