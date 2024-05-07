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
    function saveAddress() {
        axios.post("/api/address/", address).then(function(response) {
            setAddress(null);
            loadAddresses();
        }).catch (function(err) {
            setErrorMessage(err.response.data);
        });
        setAddress(null);
    }
    function updateAddress() {
        var newAddress = {
            ...address,
            street1 : document.getElementById("street1").value,
            street2 : document.getElementById("street2").value,
            city :document.getElementById("city").value,
            state :document.getElementById("state").value,
            zip : document.getElementById("zip").value
        }
        setAddress(newAddress);
    }
    function closeErrorDialog() {
        setErrorMessage(null);
    }
    return (
        <ProtectedRoute roles="customer manager">
            <div className = "container">
                <h3>Addresses</h3>
                <div class = "controls">                                    
                    <div id="add">
                        <AddIcon onClick={(e) => openDialog({})}></AddIcon>
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