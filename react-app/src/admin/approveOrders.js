import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from '../components/protectedRoute';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Locations from '../components/locations';
import ErrorDialog  from '../components/errorDialog';


const ApproveOrders = () => {  
  const [locationId, setLocationId] = useState(null);  
  const [orders, setOrders] = useState([]);
  
  const [order, setOrder] = useState(null); //selected order when you open the fulfill Dialog
  const [errorMessage, setErrorMessage] = useState(null); 

    
  
  useEffect(() => {
    if (locationId) {
        loadOrders();
    }
  }, [locationId]);

  function loadOrders() {
    axios.get("/api/inventory/ordersToApprove/" + locationId).then(function(response) {
        setOrders(response.data);
    }).catch(function(err) {
      setErrorMessage(err.response.data);
    });
  }
  function approveOrder(e, orderId) {
    e.preventDefault();
    console.log("approving " + orderId);
    axios.put("/api/inventory/approve/" + orderId).then(function(response) {
        loadOrders();
        setOrder(null);
    }).catch(function(err) {
      setErrorMessage(err.response.data);
    });
  }

  function rejectOrder(e, orderId) {
    e.preventDefault();
    console.log("rejecting " + orderId);
    axios.put("/api/inventory/reject/" + orderId).then(function(response) {
        loadOrders();
        setOrder(null);
    }).catch(function(err) {
      setErrorMessage(err.response.data);
    });
  }

  function openApproveDialog(e, order) {
    e.preventDefault();
    setOrder(order);
    console.log("Selecting order " + order.id);

  }

  function closeDialog(e) {
    e.preventDefault();
    setOrder(null);
  }
  function closeErrorDialog(e) {
    e.preventDefault();
    setErrorMessage(null);
  }


  return (
    <ProtectedRoute roles="inventoryManager">
        <h2>Approve Orders</h2>
        <div class = "controls"> 
          <label htmlFor="locations">Locations:</label>
          <Locations onChange = {(e) => setLocationId(e.target.value)}></Locations>
        </div>
          {locationId != null && orders.length > 0 ? ( 
          <TableContainer component = {Paper}  id = "approveOrders">
          <Table>
            <TableHead>
              <TableRow>                    
                <TableCell>id</TableCell><TableCell>Fulfillable</TableCell>
              </TableRow>
            </TableHead>
            {orders.map((order) => (
              <TableBody>
                <TableRow>
                    <TableCell><h3>{order.id}</h3></TableCell>
                    <TableCell>{order.fulfillable ? "yes":"no"}</TableCell>
                    {order.fulfillable && 
                        <TableCell>
                            <Button variant = "contained" onClick={(e) => openApproveDialog(e,order)}>View Order</Button>
                        </TableCell>
                    }
                </TableRow>
              </TableBody>                
              ))}
          </Table>  
          </TableContainer>
          ): (
            <h3>There are no orders to approve</h3>
          )}


        <Dialog open={order != null} id = "approveDialog" onClose={closeDialog}>
          <DialogTitle>Approve Order</DialogTitle>
          <DialogContent>
            {order && 
            <TableContainer component = {Paper}  id = "lineItems">
              <Table>
                <TableHead>
                  <TableRow>              
                    <TableCell>Name</TableCell><TableCell>Price</TableCell><TableCell>Quantity Ordered</TableCell><TableCell>Quantity Available</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {order.items.map((item,index) => (
                  <TableRow>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.quantityAvailable}</TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </TableContainer>
            }
          </DialogContent>
          <DialogActions>          
              <Button variant = "contained" onClick = {(e) => approveOrder(e, order.id)}>Approve Order</Button>
              <Button variant = "contained" onClick = {(e) => rejectOrder(e,order.id)}>Reject Order</Button> 
              <Button variant = "contained" onClick = {closeDialog} >Close</Button>
          </DialogActions>
        </Dialog>
        <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>
    </ProtectedRoute>
)}
export default ApproveOrders;
  