import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from './protectedRoute';
import {useNavigate} from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';




const Cart = () => {
  let navigate = useNavigate();
  const [cart, setCart] = useState({
    locations: []
  }); 
  
  useEffect(() => {
    axios.get("/api/cart/allLocations").then(function(response) {
      
      console.log(response.data);
      if (response.status === 200){
        setCart(response.data);
      } else {

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
          <div id = "cart">
          {cart.locations? cart.locations.map((location) => (
            <Accordion>
                  <AccordionSummary   expandIcon = {<span>+</span>} aria-controls="panel1-content" >{location.name}</AccordionSummary>
                  <AccordionDetails>
                    <table class = "items">
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
                    </table>
                  </AccordionDetails>
                  
              </Accordion>
              )): ""}
              <h3>Grand Total:{cart.total}</h3>
          </div>
    </ProtectedRoute>
  )
}
export default Cart;