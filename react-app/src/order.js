import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from './components/protectedRoute';
import {useSearchParams} from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { TableFooter } from '@mui/material';


const Order = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const locationId = searchParams.get("locationId");
  const [cart, setCart] = useState({
    items: []
  });
  const [address, setAddress] = useState(null);
  const [addresses, setAddresses] = useState([]); 
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  useEffect(() => {
    
    axios.get("/api/cart/byLocation/" + locationId).then(function(response) {
      console.log(response.data);
        setCart(response.data);
    })
    .catch(function(err) {
      setErrorMessage(err.response.data);
    });
    axios.get("/api/address/byUser").then(function(response) {
      setAddresses(response.data);
      setAddress(response.data[0]);
      console.log(addresses);
      console.log(address);
    });

  },[]);

  function sendOrder(event){
    event.preventDefault();
    axios.post("/api/order/" + locationId,{address: address.id}).then(function(response) {
      console.log(response.data);
      setOrder(response.data);
    })
    .catch(function(err) {
      setErrorMessage(err.response.data);
    });
  }
  return (
    <ProtectedRoute roles="customer manager">
      {order == null && 
      <>
          <h1>Order</h1>
          <h3>{cart.name}</h3>
          <TableContainer component = {Paper}  id = "purchasing">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>name</TableCell>  
                  <TableCell>quantity</TableCell>
                  <TableCell>Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {cart.items.map((item) => 
                  <TableRow>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.price}</TableCell>
                  </TableRow>
              )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colspan="3" align = "right"><h3>Order Total:</h3></TableCell>
                  <TableCell> {cart.total}</TableCell>
                </TableRow>              
              </TableFooter>
            </Table>
          </TableContainer>
          <label>Select Address:</label>
          <select name = "address" value = "address">
          {addresses.map((addr) => 
              <option key = {addr.id} value = {addr.id}>{addr.street1}</option>
          )}
          </select>       
         <Button variant="contained" onClick={sendOrder}>Finalize Order</Button>
        </>
        }
         {order &&
          <div id ="result">
              <h2>Orders</h2>
                <ul class="order">            
                    <li>Your order has been registered. Your order number is {order.id} </li>
                    <li>You will receive an email when the order has been approved by inventory management.</li>
                </ul>            
          </div>
         }
    </ProtectedRoute>
  );
}
export default Order;