import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import ErrorDialog  from './components/errorDialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Search from './components/search';
import {useNavigate} from 'react-router-dom';
import {useSearchParams} from 'react-router-dom';


const Product = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");
  const [product, setProduct] = useState({});
  const [inventory, setInventory] = useState([]); //locations and prices where that product it sold at
  const [errorMessage, setErrorMessage] = useState(null);  
  const navigate = useNavigate();
  


  useEffect(() => {
    loadInventory();
  }, []);

  function loadInventory() {
        let url = "/api/inventory/byProduct/" + productId; 
        axios.get(url).then(function(response) {          
            setInventory(response.data);          
        }).catch(function(err) {
            setErrorMessage(err.response.data);
        });
  }
  
  function goInventory(item) {
    navigate("/purchase?location=" + item.locationId + "&search=" + item.name); 
  }
  
  function closeErrorDialog(e) {    
    setErrorMessage(null);
  }

  return (
    <div class="container">
        <h1>{product.name}</h1>
        {inventory.length > 0 ? ( 
        <TableContainer component = {Paper}  id = "products">
        <Table>
            <TableHead>
                <TableRow>   
                <TableCell>Location</TableCell><TableCell>Price</TableCell><TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>                     
            {inventory.map((item) => (
            <TableBody>
                <TableRow>
                    <TableCell>{item.locationName}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell><Button variant="contained" onClick={(e)=>goInventory(item)}>Purchase</Button></TableCell>
                </TableRow>
            </TableBody>
            ))}
        </Table>
        </TableContainer>
        ): (
        <h3>There are no matching inventory</h3>
        )}
        <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>

    </div>
  )
}
export default Product;