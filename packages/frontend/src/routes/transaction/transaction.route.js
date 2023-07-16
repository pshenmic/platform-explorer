import {Form, useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './transaction.css'
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
            </div>
        </div>
    );
}

export default TransactionRoute;
