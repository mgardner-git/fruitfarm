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

import DeleteIcon from '@mui/icons-material/Delete';

const SearchProducts = () => {

  const [products, setProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [search, setSearch] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, [search]);

  function loadProducts() {
    if (search) {
        let url = "/api/produce/search/" +  (search == null ? '': search);
        axios.get(url).then(function(response) {          
        setProducts(response.data);          
        }).catch(function(err) {
        setErrorMessage(err.response.data);
        });
    }
  }

  function goProduct(productId) {
        navigate("/product?id=" + productId); 
  }
  function closeErrorDialog(e) {
    e.preventDefault();
    setErrorMessage(null);
  }

  return (
    <div class="container">
        <div class = "controls">                                    
            <label>Search:</label>            
            <Search onBlur={(e) => setSearch(e.target.value)}/>                
        </div>    
        {products.length > 0 ? ( 
        <TableContainer component = {Paper}  id = "fulfillOrders">
        <Table>
            <TableHead>
                <TableRow>   
                <TableCell>Name</TableCell><TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>                     
            {products.map((product) => (
            <TableBody>
                <TableRow>
                    <TableCell>{product.name}</TableCell>
                    <TableCell><Button variant="contained" onClick={(e)=>goProduct(product.id)}>Purchase</Button></TableCell>
                </TableRow>
            </TableBody>
            ))}
        </Table>
        </TableContainer>
        ): (
        <h3>There are no matching products</h3>
        )}
        <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>

    </div>
  )
}
export default SearchProducts;
