import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from './protectedRoute';
import { Navigate} from 'react-router-dom';
import {Link} from 'react-router-dom';
import Button from '@mui/material/Button';


const Purchase = () => {

  const [myLocation, setMyLocation] = useState(null); //location Id
  //TODO: Store users favorite loc perm
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState([]);
  
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
      
      axios.get("/api/produce/produceAndCart/" + myLocation).then(function(response) {
          if (response.status == 200) {
            setProducts(response.data);
          } else {
            setErrorMessage(JSON.stringify(response));
          }
      });
    }

  }, [myLocation]);



  function findProduct(inventoryId) {
    for (let index=0; index < products.length; index++) {
      let checkProduct = products[index];
      if (checkProduct.id === inventoryId) {
        return index;
      }
    }
    return null;
  }
  function enforceMaxQuantity() {

    var isClean = true;
    var newErrors = [];
    for (let index=0; index < products.length; index++) {
      let checkProduct = products[index];            
       if (checkProduct.quantity) {
        let isError = parseInt(checkProduct.quantity) > parseInt(checkProduct.quantityAvailable);
      
        if (isError) {
          newErrors[index] = "You can't buy more than " + checkProduct.quantityAvailable;
          isClean = false;
        } else {
          newErrors[index] = null;
        }
      }
    }
    setErrors(newErrors);
    return isClean;
  }

  //occurs on each change of quantity
  function updateQuantity(inventoryId, quantity) {
    console.log("Update " + inventoryId + "," + quantity);
    for (let index=0; index < products.length; index++) {
      if (products[index].id == inventoryId) {
        products[index].quantity = quantity;

      }
    }
    enforceMaxQuantity();    
  }  

  //occurs only when they click update cart
  function updateCart(e) {    
    e.preventDefault();
    let isClean = enforceMaxQuantity();
    
    if (isClean) {
      let cart = [];
      for (let index=0; index < products.length; index++) {
        let product = products[index];
        if (product.quantity != null && parseInt(product.quantity) > 0) {
          cart.push({
            id: product.cartId,
            quantity: product.quantity,
            inventoryId: product.id
          });
        } else {
          product.quantity = null;
        }
      }  
      axios.put("/api/cart/", cart).then(function(response) {
          alert("Cart Updated");  //TODO: Toast Library
      }).catch(function(err) {
        alert(err.response.data);
        //loadCart();
        setMyLocation(myLocation);
      });
    } else {
      alert("You have cart errors.")      
    }
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
                  <tr><th>Name</th><th>Qty. Available</th><th>Price</th><th>Purchase Quantity</th><th width = "190"></th></tr>
                </thead>
                <tbody>
                  {products.map((product,index) => (
                    <tr>
                      <td>{product.name}</td>
                      <td>{product.quantityAvailable}</td>
                      <td>{product.price}</td>
                      <td>
                        <input type="number" id = {product.id} min="0" value = {product.quantity}
                          onChange= {(e) => updateQuantity(product.id, e.target.value)}>
                        </input>
                      </td>
                     
                      <td>
                        {errors[index]}

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
           <Button variant = "contained"><Link to="/cart">Go To Cart</Link></Button>
        </div>
      </ProtectedRoute>
)}
export default Purchase;