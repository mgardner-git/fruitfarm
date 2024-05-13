import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from '../components/protectedRoute';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ErrorDialog  from '../components/errorDialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Locations from '../components/locations';


const FulfillOrders = () => {
  
  const [locationId, setLocationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null); 
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null); //selected order when you open the fulfill Dialog
 
  const [fulfillItems, setFulfillItems] = useState([]); //the put body sent to fulfill 1 order

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
          inventoryId: lineItem.inventoryId,
          lineItemId: lineItem.id,
          quantity: lineItem.quantity, 
          crates: []

        };

        //find all crates that carry this item
        for (let c = 0; c < crates.length; c++) {
          const checkCrate = crates[c];
          if (checkCrate.inventoryId === parseInt(lineItem.inventoryId)) {
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
        <h2>Fulfill Orders</h2>
        <div class = "controls"> 
          <label htmlFor="locations">Locations:</label>
          <Locations onChange = {(e) => setLocationId(e.target.value)}></Locations>
        </div>
          {locationId != null && orders.length > 0 ? ( 
          <TableContainer component = {Paper}  id = "fulfillOrders">
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
                            <Button variant = "contained" onClick={(e) => openFulfillDialog(e, order)}>View Order</Button>
                        </TableCell>
                    }
                  </TableRow>
                </TableBody>
              ))}            
          </Table>  
          </TableContainer>
          ): (
            <h3>There are no orders to fulfill</h3>
          )}

        <Dialog open={order != null} id = "fulfillDialog" onClose={closeDialog}>
          <DialogTitle>Fulfill Order</DialogTitle>
          <DialogContent>
            {order && 
            <TableContainer component = {Paper}  id = "lineItems">
            <Table>
              <TableHead>
                <TableRow>                 
                  <TableCell>Id</TableCell><TableCell>Name</TableCell><TableCell>Price</TableCell><TableCell>Quantity Ordered</TableCell><TableCell>Quantity Available</TableCell>
                </TableRow>
              </TableHead>              
              {order.items.map((item,index) => (
                <TableBody>
                  <TableRow>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.quantityAvailable}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colspan="4">                    
                        <h3>Crates</h3>
                        {fulfillItems[index].crates.map((crate) => (
                          <div>
                            <label>#{crate.serialNumber}</label>&nbsp;
                            <label>Available:</label> {crate.quantityAvailable}<br/>
                            <input type="number" min="0"  onChange={(e) => updateCrate(crate, e.target.value)}/>
                          </div>                          
                        ))}                                             
                    </TableCell>                    
                  </TableRow>
                </TableBody>
              ))}
            </Table>
            </TableContainer>
            }
            </DialogContent>
            <DialogActions>              
              <Button variant = "contained" onClick = {(e) => fulfillOrder(e, order)}>Fulfill</Button>
              <Button variant = "contained" onClick = {closeDialog}>Close</Button>
            </DialogActions>
          </Dialog>
          <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>

    </ProtectedRoute>
)}
export default FulfillOrders;
  