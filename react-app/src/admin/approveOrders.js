import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from '../protectedRoute';
import {Link} from 'react-router-dom';
import {useNavigate, useSearchParams} from 'react-router-dom';
import App from '../App';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import DialogContent from '@mui/material/DialogContent';
const ApproveOrders = () => {
  const navigate = useNavigate();
  
  const [locationId, setLocationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null); 
  const [orders, setOrders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [order, setOrder] = useState(null); //selected order when you open the fulfill Dialog

    
  useEffect(() => {
    axios.get("/api/locations").then(function(response) {
        setLocations(response.data);
    });
  }, []);


  useEffect(() => {
    if (locationId) {
        loadOrders();
    }
  }, locationId);

  function loadOrders() {
    axios.get("/api/inventory/ordersToApprove/" + locationId).then(function(response) {
        setOrders(response.data);
    });
  }
  function approveOrder(e, orderId) {
    e.preventDefault();
    console.log("approving " + orderId);
    axios.put("/api/inventory/approve/" + orderId).then(function(response) {
        loadOrders();
        setOrder(null);
    });
  }

  function rejectOrder(e, orderId) {
    e.preventDefault();
    console.log("rejecting " + orderId);
    axios.put("/api/inventory/reject/" + orderId).then(function(response) {
        loadOrders();
        setOrder(null);
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


  return (
    <ProtectedRoute roles="inventoryManager">
        <h1>Approve Orders</h1>
          <label>Locations</label>
          
          <select id = "locs" onChange={(e) => setLocationId(e.target.value)}>
                <option value = {null}> </option>
                {locations.map((loc) => (
                    <option value = {loc.id}> {loc.name}</option>
                ))}
          </select>
          {locationId != null && orders.length > 0 ? ( 
          <table id = "approveOrders">
            <thead>
                <tr><th>id</th><th>Fulfillable</th></tr>
            </thead>
            <tbody>              
              {orders.map((order) => (
                <>
                  <tr>
                    <td><h3>{order.id}</h3></td>
                    <td>{order.fulfillable ? "yes":"no"}</td>
                    {order.fulfillable && 
                        <td>
                            <Button variant = "contained" onClick={(e) => openApproveDialog(e,order)}>View Order</Button>
                        </td>
                    }
                  </tr>                  
                </>
              ))}
            </tbody>
        </table>  
          ): (
            <h3>There are no orders to approve</h3>
          )}


        <Dialog open={order != null} id = "approveDialog" onClose={closeDialog}>
          <DialogTitle>Approve Order</DialogTitle>
          <DialogContent>
            {order && 
            <table id = "lineItems">
              <thead>
                  <tr><th>Name</th><th>Price</th><th>Quantity Ordered</th><th>Quantity Available</th></tr>
              </thead>
              <tbody>
              {order.items.map((item,index) => (
                  <tr>
                      <td>{item.name}</td>
                      <td>{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>{item.quantityAvailable}</td>
                  </tr>

              ))}
              </tbody>
            </table>
            }
          </DialogContent>
          <DialogActions>          
              <Button variant = "contained" onClick = {(e) => approveOrder(e, order.id)}>Approve Order</Button>
              <Button variant = "contained" onClick = {(e) => rejectOrder(e,order.id)}>Reject Order</Button> 
              <Button variant = "contained" onClick = {closeDialog} >Close</Button>
          </DialogActions>
        </Dialog>
    </ProtectedRoute>
)}
export default ApproveOrders;
  