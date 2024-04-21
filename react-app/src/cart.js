import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from './protectedRoute';
import {useNavigate} from 'react-router-dom';


const Cart = () => {
  let navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null); 
  const [cart, setCart] = useState({
    locations: []
  }); 
  
  useEffect(() => {
    axios.get("/api/cart/allLocations").then(function(response) {
      
      console.log(response.data);
      if (response.status == 200){
        setCart(response.data);
      } else {
        setErrorMessage(JSON.stringify(response));        
      }
    });
  }, []);

  function goOrder(locationId, event) {
    event.preventDefault();
    navigate("/order?locationId=" + locationId);
  }
  return (
    <ProtectedRoute roles="customer manager">
          <h1>Cart</h1>
          <table id = "cart">
            
              
            
            <tbody>
              {cart.locations? cart.locations.map((location) => (
                <>
                  <tr>
                    <td colspan = "4" align="left"><h3>{location.name}</h3></td>
                  </tr>
                  <tr><th>Product</th><th>price</th><th>Quantity</th><th>total</th>
                    <th>
                      {location.locationId}
                      <button onClick={(e) => goOrder(location.locationId,e)}>Order</button>
                    </th>
                  </tr>
                  {location.items.map((item) => (

                      <tr>
                        <td>{item.name}</td>
                        <td>{item.price}</td>
                        <td>{item.quantity}</td>
                        <td>{item.total}</td>
                      </tr>
                  ))}
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
          
    </ProtectedRoute>
  )
}
export default Cart;