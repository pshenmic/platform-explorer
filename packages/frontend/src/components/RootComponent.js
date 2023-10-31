import {Outlet, Link} from "react-router-dom";
import "./root.css";
import React, {useState} from 'react';
import Navbar from "../components/navbar/Navbar";
import theme from "../styles/theme";
import "../styles/theme.scss";
import { ChakraProvider} from '@chakra-ui/react'


export default function RootComponent() {

    return (
        <ChakraProvider theme={theme}>
            
            <Navbar/>

            <Outlet/>

        </ChakraProvider>
    );
}
