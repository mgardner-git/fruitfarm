import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from './protectedRoute';
import {Link} from 'react-router-dom';


const Order = () => {

  const [errorMessage, setErrorMessage] = useState(null); 
  const [cart, setCart] = useState({
    locations: []
  });
  const [address, setAddress] = useState(null);
  const [addresses, setAddresses] = useState([]); 
  const [order, setOrder] = useState(null);
  useEffect(() => {
    axios.get("/api/cart/byLocation").then(function(response) {
      
      console.log(response.data);
      if (response.status == 200){
        setCart(response.data);
      } else {
        setErrorMessage(JSON.stringify(response));        
      }
    });
    axios.get("/api/address/byUser").then(function(response) {
      setAddresses(response.data);
      setAddress(response.data[0]);
      console.log(addresses);
      console.log(address);
    });

  }, []);

  function sendOrder(event){
    event.preventDefault();
    axios.post("/api/order/",{address: address.id}).then(function(response) {
      
      console.log(response.data);
      if (response.status == 200){
        setOrder(response.data);
      } else {
        setErrorMessage(JSON.stringify(response));        
      }
    });
  }
  return (
    <ProtectedRoute roles="customer manager">
          <h1>Order</h1>
          <table id = "cart">
            
              
            
            <tbody>
              {cart.locations? cart.locations.map((location) => (
                <>
                  <tr>
                    <td colspan = "4" align="left"><h3>{location.name}</h3></td>
                  </tr>
                  
                  <tr>
                    <td colspan="3" align="right">
                      <h3>Location Total:</h3>
                    </td>
                    <td> {location.total}</td>
                  </tr>
                </>
              )): ""}
              <tr>
                <td colspan="3" align = "right"><h3>Order Total:</h3></td>
                <td>{cart.total}</td>
              </tr>
            </tbody>
          </table>
          <label>Select Address:</label>
          <select name = "address" value = "address">
          {addresses.map((addr) => 
              <option key = {addr.id} value = {addr.id}>{addr.street1}</option>
          )}
          </select>
       
         <button onClick={sendOrder}>Finalize Order</button>
         {order &&
         <div id ="result">
            <h2>Orders</h2>

            {order.orders.map((locOrder)=>
              <div class="order">{locOrder.id}</div>
            )}
         </div>
        }
    </ProtectedRoute>
  );
}
export default Order;