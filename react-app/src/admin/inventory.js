import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from '../components/protectedRoute';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ErrorDialog  from '../components/errorDialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Locations from '../components/locations';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Search from '../components/search';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InventoryDialog from '../components/inventoryDialog';


const Inventory = () => {
  
    const [locationId, setLocationId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null); 
    const [locations, setLocations] = useState([]);
    const [inventory, setInventory] = useState([]); //used in the edit dialog   
    const [item, setItem] = useState(null); //the item to create or edit
    const [search, setSearch] = useState(null);
    const [produce, setProduce] = useState([]);
    const [product, setProduct] = useState(null); //used for adding a new produce entry

    useEffect(() => {
        loadInventory();
    }, [locationId, search]);


    function loadProduce() {
        axios.get("/api/produce/all/" + locationId).then(function(response) {
            setProduce(response.data);
        }).catch(function(err) {
            setErrorMessage(err.response.data);
        });
    }
   function loadInventory() {
        if (locationId) {
            var url = "/api/inventory/byLocation/" + locationId +  (search != null ? ("/" + search) : "");
            axios.get(url).then(function(response) {
                setInventory(response.data);
            }).catch(function (err) {
                setErrorMessage(err.response.data);
            });
        }
    }


    function openDialog(inItem) {      
        console.log("Opening item: " + inItem);  
        if (inItem == null) {            
            setItem({
                id: null,
                locationId: locationId,
                price: 0
            });
        }
        else {
            setItem({                
                ...inItem,
                locationId: locationId
            });
        }
    }

    function saveInventory() {

        setItem({
            ...item
        });
        setLocationId(locationId);
        loadInventory();
    }
    function closeDialog() {
        setItem(null);
    }
    function closeErrorDialog(e) {
        e.preventDefault();
        setErrorMessage(null);
    }
    function updatePrice(price) {
        let newItem = {
            ...item,
            price: price
        };
        setItem(newItem);
    }




      return (
        <ProtectedRoute roles="inventoryManager">
        <div id = "manageInventory">
            <h3>Inventory</h3>
            <div class = "controls">                
                <label htmlFor="locations">Locations:</label>
                <Locations onChange = {(e) => setLocationId(e.target.value)}></Locations>    
                <label>Search:</label>            
                <Search onBlur={(e) => setSearch(e.target.value)}/>                
                {inventory && locationId &&
                    <div id="add">
                        <Button variant = "contained"  onClick={(e) => openDialog()}><AddIcon></AddIcon>Add Inventory</Button>
                    </div>
                }
           </div>
            <TableContainer component = {Paper} id = "crates">
            <Table sx = {{minWidth:650}} >
                <TableHead>
                    <TableRow><TableCell>Type</TableCell><TableCell>Price</TableCell><TableCell>Actions</TableCell></TableRow>
                </TableHead>
                <TableBody>
                    {inventory.map((item) => (
                        <TableRow>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.price}</TableCell>
                            <TableCell>                                
                                <Button variant="contained" onClick={(e) => openDialog(item)}><EditIcon></EditIcon>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </TableContainer>
            <span>{item!=null}</span>
            <InventoryDialog onSave={saveInventory} item={item} locationId={locationId} closeDialog={closeDialog}/>
            <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}/>
        </div>
    </ProtectedRoute>
    )
}
export default Inventory;