import React from 'react'
import { ProtectedRoute } from './components/protectedRoute'
import {useEffect, useState} from 'react';
import axios from 'axios';
import ErrorDialog  from './components/errorDialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    axios.get("/api/order/myOrders").then(function(response) {
      
      if (response.status === 200){
        for (let index=0; index < response.data.length; index++) {
          response.data[index].time = new Date(response.data[index].time).toDateString();
        }
        setMyOrders(response.data);
      } else {
        setErrorMessage(JSON.stringify(response));        
      }
    });
  }, []);

  function closeErrorDialog(e) {
    e.preventDefault();
    setErrorMessage(null);
  }

  return (
    <ProtectedRoute roles="customer">
        <h2>Previous Orders</h2>

        <TableContainer component = {Paper}  id = "myOrders">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Id#</TableCell><TableCell>Date</TableCell><TableCell>Status</TableCell><TableCell>Destination</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {myOrders.map((order) => (
              <TableRow>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.time}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.street1}&nbsp;{order.street2}&nbsp;{order.city},{order.state}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
        <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>
    </ProtectedRoute>
  )
}

export default MyOrders