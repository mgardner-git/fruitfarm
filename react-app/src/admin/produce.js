import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from '../components/protectedRoute';
import ProduceDialog from '../components/produceDialog';
import Search from '../components/search';
import AddIcon from '@mui/icons-material/Add';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ErrorDialog  from '../components/errorDialog';

import EditIcon from '@mui/icons-material/Edit';
import { Button } from '@mui/material';

const Produce = () => {
  
    
    const [errorMessage, setErrorMessage] = useState(null); 
    const [produce, setProduce] = useState([]);    
    const [product, setProduct] = useState(null); //used for adding a new produce entry
    const [search, setSearch] = useState(null);

    useEffect(() => {
        loadProduce();
    }, [search]);


    function closeProduceDialog() {
        setProduct(null);
    }
    function loadProduce() {
        let url = "/api/produce/search/" + (search ? search : "");
        axios.get(url ).then(function(response) {
            setProduce(response.data);
        }).catch(function(err) {
            setErrorMessage(err.response.data);
        });        
    }

    function closeErrorDialog() {
        setErrorMessage(null);
    }
    function saveProduct() {
        axios.post("/api/produce/", product).then(function(response) {
            setProduct(null);
            loadProduce();

        }).catch(function(err) {
            setErrorMessage(err.response.data);
        })
    }
    function openDialog(inProd) {
        console.log(inProd);
        if (inProd == null) {
            setProduct({
                name: "",
                description:""
            });
        } else {
            setProduct(inProd);
        }
    }
    

    return (
        <ProtectedRoute roles="inventoryManager">
            <div id = "manageProduce">
                <h3>Produce</h3>
                <div class = "controls">                                    
                    <label>Search:</label>            
                    <Search onBlur={(e) => setSearch(e.target.value)}/>                
                    <div id="add">
                        <Button variant="contained"><AddIcon onClick={(e) => openDialog()}></AddIcon>Add Produce</Button>
                    </div>

                </div>
                <TableContainer component = {Paper} id = "crates">
                <Table sx = {{minWidth:650}} >
                <TableHead>
                    <TableRow><TableCell>id</TableCell><TableCell>name</TableCell><TableCell>description</TableCell><TableCell>Actions</TableCell></TableRow>
                </TableHead>
                <TableBody>
                    {produce.map((item) => (
                        <TableRow>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.description.slice(0,20)} </TableCell>
                            <TableCell>                                
                                <EditIcon onClick={(e) => openDialog(item)}></EditIcon>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
                </TableContainer>                
                <ProduceDialog closeProduceDialog={closeProduceDialog} product = {product} saveProduct={saveProduct}/>
                <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}/>
            </div>
        </ProtectedRoute>
    )
}
export default Produce;