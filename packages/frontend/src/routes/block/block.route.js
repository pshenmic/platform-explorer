import React from 'react';
import { Link, useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './block.css'

export async function loader({params}) {
    const {hash} = params
    const block = await Api.getBlockByHash(hash);
    return {block};
}

function BlockRoute() {
    const {block} = useLoaderData();

    const txHashes = block?.txHashes;

    return (
        <div className="container">
            <div className={"block_details"}>
                <div className={"block_details_item"}>
                    <span className={"block_details_item__title"}>Hash:</span>
                    <span className={"block_details_item__value"}>{block.block_id.hash}</span>
                </div>
                <div className={"block_details_item"}>
                    <span className={"block_details_item__title"}>Height:</span>
                    <span className={"block_details_item__value"}>{block.block.header.height}</span>
                </div>
                <div className={"block_details_item"}>
                    <span className={"block_details_item__title"}>Timestamp:</span>
                    <span className={"block_details_item__value"}>{block.block.header.time}</span>
                </div>
                <div className={"block_details_item"}>
                    <span className={"block_details_item__title"}>Block Version:</span>
                    <span className={"block_details_item__value"}>{block.block.header.version.block}</span>
                </div>
                <div className={"block_details_item"}>
                    <span className={"block_details_item__title"}>App Version:</span>
                    <span className={"block_details_item__value"}>{block.block.header.version.app}</span>
                </div>
                <div className={"block_details_item"}>
                    <span className={"block_details_item__title"}>L1 Locked Height:</span>
                    <span className={"block_details_item__value"}>{block.block.header.core_chain_locked_height}</span>
                </div>
                <div className={"block_details_item"}>
                    <span className={"block_details_item__title"}>Transactions count:</span>
                    <span className={"block_details_item__value"}>{txHashes ? txHashes.length : 0}</span>
                </div>

                {txHashes ? <div className={"block_transactions_list"}>
                    <ul>
                        {txHashes.map((hash, i) =>
                            <li key={hash}>
                                <Link className={"block_transaction_link"} to={`/transaction/${hash}`}>{hash}</Link>
                            </li>)}

                    </ul>
                </div> : null}
            </div>
        </div>
    );
}

export default BlockRoute;
