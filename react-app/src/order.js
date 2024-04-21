import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from './protectedRoute';
import {Link} from 'react-router-dom';
import {useNavigate, useSearchParams} from 'react-router-dom';

const Order = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const locationId = searchParams.get("locationId");
  const [errorMessage, setErrorMessage] = useState(null); 
  const [cart, setCart] = useState({
    items: []
  });
  const [address, setAddress] = useState(null);
  const [addresses, setAddresses] = useState([]); 
  const [order, setOrder] = useState(null);
  
  
  useEffect(() => {
    
    axios.get("/api/cart/byLocation/" + locationId).then(function(response) {
      
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
    axios.post("/api/order/" + locationId,{address: address.id}).then(function(response) {
      
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
          <h2>{cart.name}</h2>
          <table id = "cart">
            <thead>
              <tr>
                <th>name</th>  
                <th>quantity</th>
                <th>Price</th>                
              </tr>  
            </thead>    
            <tbody>
              {cart.items.map((item) => 
                  <tr>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}}</td>
                  </tr>
              )}
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
                <ul class="order">            
                    <li>Your order has been registerd with order# {order.id} </li>
                    <li>You will receive an email when the order has been approved by inventory management.</li>
                </ul>            
          </div>
         }
    </ProtectedRoute>
  );
}
export default Order;