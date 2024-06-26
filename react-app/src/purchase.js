import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from './components/protectedRoute';
import {Link} from 'react-router-dom';
import Button from '@mui/material/Button';
import ErrorDialog  from './components/errorDialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableFooter } from '@mui/material';
import Search from './components/search';
import Locations from './components/locations';
import DeleteIcon from '@mui/icons-material/Delete';
import {useSearchParams} from 'react-router-dom';


const Purchase = () => {
  const [searchParams] = useSearchParams();
  const [myLocation, setMyLocation] = useState(null); //location Id
  const [products, setProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState([]);  //error per product, for odering more then available
  const [search, setSearch] = useState(null);
  
  useEffect(() => {
    const paramLoc  = searchParams.get("location");
    const paramSearch = searchParams.get("search");
    if (paramLoc) {
      setMyLocation(paramLoc);
    }
    if (paramSearch) {
      setSearch(paramSearch);
    }

  },[])
  useEffect(() => {
    if (myLocation) {
      loadProducts();
    }
  }, [myLocation, search]);

  function loadProducts() {
    let url = "/api/produce/produceAndCart/" + myLocation + (search == null ? '': "/" + search);
    axios.get(url).then(function(response) {          
          setProducts(response.data);          
    }).catch(function(err) {
      setErrorMessage(err.response.data);
    });
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
      if (products[index].id === parseInt(inventoryId)) {
        products[index].quantity = quantity;

      }
    }
    enforceMaxQuantity();    
  }  

  function closeErrorDialog(e) {
    e.preventDefault();
    setErrorMessage(null);
  }

  function deleteCartItem(inventoryItem) {

    axios.delete("/api/cart/"+ inventoryItem.cartId).then(function(response) {
      loadProducts();
    }).catch(function(err) {
      setErrorMessage(err.response.data);
    });
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
          alert("Cart Updated"); 
          loadProducts();
      }).catch(function(err) {
        setErrorMessage(err.response.data);        
        setMyLocation(myLocation);
      });
      
    } else {
      setErrorMessage("You have cart errors.");
    }
    return true;
  }

  
  return (
      <ProtectedRoute roles="customer manager">
        <div className = "container">

           <div class = "controls"> 
              <label htmlFor="locations">Locations:</label>
              <Locations value = {myLocation} onChange = {(e) => setMyLocation(e.target.value)}></Locations>            
              <Search value={search} onBlur={(e) => setSearch(e.target.value)}/>
           </div>      
           {myLocation &&     
            <TableContainer component = {Paper}  id = "purchasing">
              <Table>
                <TableHead>
                  <TableRow>
                     <TableCell>Name</TableCell><TableCell>Qty. Available</TableCell><TableCell>Price</TableCell><TableCell>Purchase Quantity</TableCell>
                     <TableCell>Actions</TableCell>
                     <TableCell width = "190"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product,index) => (
                    <TableRow>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.quantityAvailable}</TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell>
                        <input type="number" id = {product.id} min="0" value = {product.quantity ? product.quantity : ''}
                          onChange= {(e) => updateQuantity(product.id, e.target.value)}>
                        </input>
                      </TableCell>
                      <TableCell>
                        {product.cartId && 
                          <Button variant="contained" onClick={(e) => deleteCartItem(product)}><DeleteIcon></DeleteIcon>Delete</Button>
                        }
                      </TableCell>
                      <TableCell>
                        {errors[index]}
                      </TableCell>                     
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell align = "right" colspan = "4">
                      <Button variant = "contained" onClick = {updateCart}>Update Cart</Button>
                      <Button variant = "contained"><Link to="/cart">Go To Cart</Link></Button>           
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
           }           
        </div>
        <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>
      </ProtectedRoute>
)}
export default Purchase;