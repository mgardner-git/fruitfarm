import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from './components/protectedRoute';
import {useNavigate} from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { TableFooter } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';


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
                  <AccordionSummary   expandIcon = {<span><ArrowDownwardIcon/></span>} aria-controls="panel1-content" ><h3>{location.name}</h3></AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component = {Paper}  id = "purchasing">
                      <Table>
                        <TableHead>
                          <TableRow>
                             <TableCell>Product</TableCell><TableCell>price</TableCell><TableCell>Quantity</TableCell><TableCell>total</TableCell>                          
                            <TableCell>    
                              <Button variant = "contained" onClick={(e) => goOrder(location.locationId,e)}>Order</Button>                              
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                            {location.items.map((item) => (
                              <TableRow>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.price}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.total}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                              <TableCell colspan="3" align="right">
                                <h3>Location Total:</h3>
                              </TableCell>
                              <TableCell> {location.total}</TableCell>
                            </TableRow>
                        </TableFooter>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>                  
              </Accordion>
              )): ""}
              <h3>Grand Total:{cart.total}</h3>
          </div>
    </ProtectedRoute>
  )
}
export default Cart;