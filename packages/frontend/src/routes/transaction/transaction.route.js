import { useLoaderData } from "react-router-dom";
import * as Api from "../../util/Api";
import './transaction.css'

const StateTransitionEnum = {
    DATA_CONTRACT_CREATE: 0,
    DOCUMENTS_BATCH: 1,
    IDENTITY_CREATE: 2,
    IDENTITY_TOP_UP: 3,
    DATA_CONTRACT_UPDATE: 4,
    IDENTITY_UPDATE: 5,
};

const getTransitionTypeString = (id) => {
    const [stateTransitionType] = Object.entries(StateTransitionEnum)
        .filter(([key, value]) => StateTransitionEnum[key] === id ? value : null)
        .map(([key, ]) => key)

    return stateTransitionType ?? 'UNKNOWN'
}

export async function loader({params}) {
    const {txHash} = params

    const transaction = await Api.getTransaction(txHash);

    return {transaction};
}

function TransactionRoute() {
    const {transaction} = useLoaderData();

    return (
        <div className={"container"}>
            <div className={"transaction_details"}>
                <div className={"transaction_details_item"}>
                    <span>Hash:</span>
                    <span>{transaction.hash}</span>
                </div>
                <div className={"transaction_details_item"}>
                    <span>Height:</span>
                    <span>{transaction.height}</span>
                </div>
                <div className={"transaction_details_item"}>
                    <span>Index:</span>
                    <span>{transaction.index}</span>
                </div>

                {transaction.type ? <div className={"transaction_details_item"}>
                    <span>State Transition Type:</span>
                    <span>{transaction.type} ({getTransitionTypeString(transaction.type)})</span>
                </div> : <div>
                    Failed to decode State Transition
                </div>}

                {transaction.identityId ? <div className={"transaction_details_item"}>
                    <span>Identity:</span>
                    <span>{transaction.identityId}</span>
                </div> : null}

                {transaction.signature ? <div className={"transaction_details_item"}>
                    <span>Signature:</span>
                    <span>{transaction.signature}</span>
                </div> : null}

            </div>
        </div>
    );
}

export default TransactionRoute;
