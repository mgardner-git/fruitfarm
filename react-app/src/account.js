import React from 'react'
import { ProtectedRoute } from './components/protectedRoute'
import {useEffect, useState} from 'react';
import axios from 'axios';
import ErrorDialog  from './components/errorDialog';
import AddressDialog from './components/addressDialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import Button from '@mui/material/Button';


const Account  = () => {
    const [addresses, setAddresses] = useState([]);
    const [address, setAddress] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
  
    useEffect(() => {
        loadAddresses();
    },[]);

    function loadAddresses() {
        axios.get("/api/address/byUser").then(function(response) {
            setAddresses(response.data);
          }).catch (function (err) {
            setErrorMessage(err.response.data);
          });        
    }

    function openDialog(inAddress) {
        setAddress(inAddress);
    }
    function closeDialog() {
        setAddress(null);
    }


    function closeErrorDialog() {
        setErrorMessage(null);
    }
    return (
        <ProtectedRoute roles="customer manager">
            <div className = "container">
                <h2>Addresses</h2>
                <div class = "controls">                                    
                    <div id="add">
                        <Button variant = "contained" onClick={(e) => openDialog({})}><AddIcon></AddIcon>Add Address</Button>
                    </div>
                </div>
                <TableContainer component = {Paper}  id = "purchasing">
                    <Table>
                      <TableHead>
                        <TableRow>
                           <TableCell>Street1</TableCell><TableCell>Street2</TableCell><TableCell>City</TableCell>
                           <TableCell>
                                Actions
                           </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {addresses.map((address) => (
                          <TableRow>
                            <TableCell>{address.street1}</TableCell>
                            <TableCell>{address.street2}</TableCell>
                            <TableCell>{address.city}</TableCell>                                                        
                            <TableCell>                                
                                <EditIcon onClick={(e) => openDialog(address)}></EditIcon>
                            </TableCell>
                          </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <AddressDialog onClose = {closeDialog} setAddress = {setAddress} address = {address} onSave={loadAddresses}/>
            <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>

        </ProtectedRoute>
    )
}
export default Account;