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

    useEffect(() => {
        loadProduce();
    }, [locationId]);

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

    function saveItem() {
        //may be a create or edit
        axios.post("/api/inventory", item).then(function(response) {
            alert("completed");
            setItem(null);
            loadInventory();
        });
    }
    function openDialog(inItem) {        
        if (inItem == null) {
            //if (produce.length > 0) {
                setItem({
                    id: null,
                    locationId: locationId,
                    price: 0
                });
            /*
            } else {
                setErrorMessage("There are no additional produce items that can be added to this location");
            }
            */
        }
        else {
            setItem({                
                ...inItem,
                locationId: locationId
            });
        }
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
    function updateProduceType(produceId) {
        let newItem = {
            ...item,
            produceId: produceId
        };
        setItem(newItem);
    }

    //for creating a new produce object along with the inventory item
    function updateName(newName) {
        let newItem = {
            ...item,
            produceId: null,
            name: newName
        };
        setItem(newItem);
    }

    function openAddProduceDialog() {
        setProduct({

        });
    }
    function closeProduceDialog() {
        setProduct(null);
    }
    function saveProduct() {
        axios.post("/api/produce", product).then(function(response) {            
            setProduct(null);
            loadProduce();
        }).catch(function(err) {
            setErrorMessage(err.response.data);
        });
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
                        <AddIcon onClick={(e) => openDialog()}></AddIcon>
                    </div>
                }
           </div>
            <TableContainer component = {Paper} id = "crates">
            <Table sx = {{minWidth:650}} >
                <TableHead>
                    <TableRow><TableCell>Type</TableCell><TableCell>Price</TableCell><tableCell>Actions</tableCell></TableRow>
                </TableHead>
                <TableBody>
                    {inventory.map((item) => (
                        <TableRow>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.price}</TableCell>
                            <TableCell>                                
                                <EditIcon onClick={(e) => openDialog(item)}></EditIcon>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </TableContainer>

            <Dialog open={item != null} id = "inventoryDialog"  onClose={closeDialog}>
                <DialogTitle>Inventory</DialogTitle>
                {item && 
                <DialogContent>
                    {item.id && 
                        <div>
                            <label>ID</label>&nbsp;
                            <span>{item.id}</span>
                        </div>
                    }
                    <div>
                        <label>Type</label>&nbsp;
                        {item.id == null?
                            <div>        
                                <Select onChange = {(e) => updateProduceType(e.target.value)} label = "produce type" value = {item.produceId}>
                                    {produce.map((fruit) => (
                                        <MenuItem value = {fruit.id}>{fruit.name}</MenuItem>
                                    ))}
                                </Select>
                                <AddIcon onClick = {openAddProduceDialog} />
                            </div>
                        :
                            <span>{item.name}</span>
                        }
                    </div>
                    <div>
                        <label>Price</label>
                        <input type = "number" value = {item.price} step = ".01" onChange={(e) => updatePrice(e.target.value)} />
                    </div>
                </DialogContent>
                }
                <DialogActions>
                    <Button variant = "contained" onClick = {saveItem}>Save</Button>
                    <Button variant = "contained" onClick = {closeDialog} >Close</Button>
               </DialogActions>    
            </Dialog>
            <Dialog open={product != null} id = "produceDialog"  onClose={closeProduceDialog}>
                <DialogTitle>Produce</DialogTitle>
                {product && 
                    <DialogContent>
                        <div>
                            <label>Name:</label>
                            <input type = "text" onChange={(e) => product.name = e.target.value}/>
                        </div>
                        <div>
                            <label>Description:</label>
                            <textarea onChange = {(e) => product.description = e.target.value}/>
                        </div>
                    </DialogContent>
                }
                    <DialogActions>
                       <Button variant = "contained" onClick = {saveProduct}>Save</Button>
                       <Button variant = "contained" onClick = {closeProduceDialog} >Close</Button>
                   </DialogActions> 
                </Dialog>
            <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>
        </div>
    </ProtectedRoute>
    )
}
export default Inventory;