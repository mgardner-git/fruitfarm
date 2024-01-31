import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from './protectedRoute';
import { Navigate} from 'react-router-dom';
import {Link} from 'react-router-dom';


const Purchase = () => {

  const [myLocation, setMyLocation] = useState(null); //location Id
  //TODO: Store users favorite loc perm
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [cart, setCart] = useState([]); 
  
  useEffect(() => {
    axios.get("/api/locations/").then(function(response) {
      
      console.log(response.data);
      if (response.status == 200){
        setLocations(response.data);
      } else {
        setErrorMessage(JSON.stringify(response));        
      }
    });
  }, []);

  useEffect(() => {
    if (myLocation) {
      axios.get("/api/produce?location=" + myLocation).then(function(response) {
          if (response.status == 200) {
            setProducts(response.data);
          } else {
            setErrorMessage(JSON.stringify(response));
          }
      });
    }

  }, [myLocation]);


  useEffect(() => {
    //go get the cart and match it to products in this location
    axios.get("/api/cart/").then(function(response) {
       if (response.status == 200) {
        var newCart  = [];
        for (var index=0; index < response.data.length; index++) {
          var cartItem = response.data[index];
          if (cartItem.locationId == myLocation){
            var cartRecord = {
              id: cartItem.id,
              inventoryId: cartItem.inventoryId,
              quantity: cartItem.quantity
            };
            newCart.push(cartRecord);
            var relatedInput = document.getElementById(cartItem.inventoryId);
            if (relatedInput) {
               relatedInput.setAttribute("value", cartItem.quantity);  //should just do this once.
            }
          }

        }
        setCart(newCart);
        console.log(cart);
       } else {
        setErrorMessage(JSON.stringify(response));
       }
    });
  }, [products])

  //occurs on each change of quantity
  function updateQuantity(inventoryId, quantity) {
    console.log("Update " + inventoryId + "," + quantity);
    var found = false;
    for (let index=0; index < cart.length; index++) {
      if (cart[index].inventoryId == inventoryId) {
        cart[index].quantity = quantity;
        found = true;
      }
    }
    if (!found) {
      cart.push({
        inventoryId: inventoryId,
        quantity: quantity
      });
    }
    //console.log(cart);
  }  

  //occurs only when they click update cart
  function updateCart(e) {
    e.preventDefault();
    axios.put("/api/cart/", cart).then(function(response) {
      if (response.status == 200){
        alert("Cart Updated");  //TODO: Toast Library
      } else {
        setErrorMessage(JSON.stringify(response));        
      }
    });
    return true;
  }

  
  return (
      <ProtectedRoute roles="customer manager">
        <div className = "container">
           <div id = "locations">
              <label htmlFor="locations">Locations:</label>
              <select id = "locs" onChange={(e) => setMyLocation(e.target.value)}>
                <option value = {null}> </option>
                {locations.map((loc) => (
                    <option value = {loc.id}> {loc.name}</option>
                ))}
              </select>
              
              <p className = {errorMessage ? "error":"ofscreen"} aria-live="assertive">
                {errorMessage}
              </p>
           </div>      
           {myLocation &&     
            <table id = "fruit"  border='1'>
                <thead>
                  <tr><th>Name</th><th>Qty. Available</th><th>Price</th><th>Purchase Quantity</th></tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr>
                      <td>{product.name}</td>
                      <td>{product.quantityAvailable}</td>
                      <td>{product.price}</td>
                      <td>
                        <input type="number" id = {product.id}
                          onChange= {(e) => updateQuantity(product.id, e.target.value)}
                          >
                        </input>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td align = "right" colspan = "4">
                      <button onClick = {updateCart}>Update Cart</button>
                      
                    </td>
                  </tr>
                </tfoot>
            </table>
           }
           <Link to="/cart">Go To Cart</Link>
        </div>
      </ProtectedRoute>
)}
export default Purchase;