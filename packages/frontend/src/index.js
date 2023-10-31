import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import HomeRoute, {loader as homeLoader} from "./routes/home/home.route";
import BlockRoute, {
    loader as blockLoader,
} from "./routes/block/block.route";
import ErrorPage from "./routes/error/error.route";
import RootComponent from "./components/RootComponent";
import BlocksRoute, {loader as blocksLoader} from "./routes/blocks/blocks.route";
import TransactionRoute, {
    loader as transactionLoader,
} from "./routes/transaction/transaction.route";
import DataContractRoute, {loader as dataContractLoader} from "./routes/dataContract/data.contract.route";
import DataContractsRoute from "./routes/dataContracts/data.contracts.route";
import DocumentRoute, {loader as documentLoader} from "./routes/document/document.route";
import IdentityRoute, {loader as identityLoader} from "./routes/identity/identity.route";
import IdentitiesRoute, {loader as identitiesLoader} from "./routes/identities/identities.route";


const router = createBrowserRouter([
    {
        path: "/",
        element: <RootComponent/>,
        errorElement: <ErrorPage/>,
        children: [
            {
                index: true,
                element: <HomeRoute/>,
                loader: homeLoader,
            },
            {
                path: "blocks",
                element: <BlocksRoute/>,
                loader: blocksLoader,
            },
            {
                path: "block/:hash",
                element: <BlockRoute/>,
                loader: blockLoader,
            },
            {
                path: "transaction/:txHash",
                element: <TransactionRoute/>,
                loader: transactionLoader,
            },
            {
                path: "dataContract/:identifier",
                element: <DataContractRoute/>,
                loader: dataContractLoader,
            },
            {
                path: "dataContracts",
                element: <DataContractsRoute/>,
            },
            {
                path: "document/:identifier",
                element: <DocumentRoute/>,
                loader: documentLoader,
            },
            {
                path: "identities",
                element: <IdentitiesRoute/>,
                loader: identitiesLoader,
            },
            {
                path: "identity/:identifier",
                element: <IdentityRoute/>,
                loader: identityLoader,
            },
        ]
    }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
