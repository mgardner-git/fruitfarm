import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from '../protectedRoute';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ErrorDialog  from '../errorDialog';


const FulfillOrders = () => {
  
  const [locationId, setLocationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null); 
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null); //selected order when you open the fulfill Dialog
  const [locations, setLocations] = useState([]);
  const [fulfillItems, setFulfillItems] = useState([]); //the put body sent to fulfill 1 order
 
  useEffect(() => {
    axios.get("/api/locations").then(function(response) {
        setLocations(response.data);
    });
  }, []);


  useEffect(() => {
    if (locationId) {
        loadOrders();
    }
  }, [locationId]);

  function loadOrders() {
    axios.get("/api/inventory/ordersToFulfill/" + locationId).then(function(response) {
        setOrders(response.data);
        setOrder(null);
    });
  }
  function fulfillOrder(e, order) {
    e.preventDefault();
    console.log("fulfilling " + order.id);

    axios.put("/api/inventory/fulfill/" + order.id, fulfillItems).then(
      function(response) {
        loadOrders();
        setOrder(null);
      })
      .catch(function(error) {
        console.log(error.response.data);
        setErrorMessage(error.response.data);
      });
  }

  function updateCrate( crate, quantity) {
    crate.quantity = quantity;
  }
  function openFulfillDialog(e, order) {
    axios.get("/api/inventory/crates/" + order.id).then(function(response) {
      let crates  = response.data;
      let newFulfillItems = [];
      for (let index=0; index < order.items.length; index++) {
        let lineItem = order.items[index];
        let crateSet = {
          id: lineItem.inventoryId,
          quantity: lineItem.quantity, 
          crates: []

        };
        //find all crates that carry this item
        for (let c = 0; c < crates.length; c++) {
          const checkCrate = crates[c];
          if (checkCrate.inventoryId == lineItem.inventoryId) {
              crateSet.crates.push({
                serialNumber: checkCrate.serialNumber, 
                quantity: 0,
                quantityAvailable: checkCrate.quantityAvailable
              });
          }
        }
        newFulfillItems.push(crateSet);
      }

      setFulfillItems(newFulfillItems);
      setOrder(order);
    });
    
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
        <h1>Fulfill Orders</h1>
          <label>Locations</label>
          
          <select id = "locs" onChange={(e) => setLocationId(e.target.value)}>
                <option value = {null}> </option>
                {locations.map((loc) => (
                    <option value = {loc.id}> {loc.name}</option>
                ))}
          </select>
          {locationId != null && orders.length > 0 ? ( 
          <table id = "fulfillOrders">
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
                            <button onClick={(e) => openFulfillDialog(e, order)}>View Order</button>
                        </td>
                    }
                  </tr>
                  <tr>
                    <td></td>
                    <td>

                    </td>
                  </tr>
                </>
              ))}
            </tbody>
        </table>  
          ): (
            <h3>There are no orders to fulfill</h3>
          )}

        <Dialog open={order != null} id = "approveDialog" onClose={closeDialog}>
          <DialogTitle>Fulfill Order</DialogTitle>
          <DialogContent>
            {order && 
            <table id = "lineItems">
              <thead>
                  <tr><th>Name</th><th>Price</th><th>Quantity Ordered</th><th>Quantity Available</th></tr>
              </thead>
              <tbody>
              {order.items.map((item,index) => (
                <>
                  <tr>
                      <td>{item.name}</td>
                      <td>{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>{item.quantityAvailable}</td>
                  </tr>
                  <tr>
                    <td colspan="4">
                    {fulfillItems.map((crateSet) => (
                       <>
                        <h3>Carts</h3>
                        {crateSet.crates.map((crate) => (
                          <div>
                            <label>#{crate.serialNumber}</label>&nbsp;
                            <label>Available:</label> {crate.quantityAvailable}<br/>
                            <input type="number" min="0"  onChange={(e) => updateCrate(crate, e.target.value)}/>
                          </div>
                          
                        ))}                                             
                       </>
                    ))}
                    </td>                    
                  </tr>
                </>
              ))}
              </tbody>
            </table>
            }
            </DialogContent>
            <DialogActions>              
                <button onClick = {(e) => fulfillOrder(e, order)}>Fulfill</button>
                <button onClick = {closeDialog}>Close</button>
            </DialogActions>
          </Dialog>
          <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>

    </ProtectedRoute>
)}
export default FulfillOrders;
  