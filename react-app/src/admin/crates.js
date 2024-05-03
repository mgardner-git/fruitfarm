import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from '../components/protectedRoute';
import ErrorDialog  from '../components/errorDialog';
import Search from '../components/search';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Locations from '../components/locations';


const Crates = () => {
  
    const [locationId, setLocationId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null); 
    const [locations, setLocations] = useState([]);
    const [inventory, setInventory] = useState(null); //used in the edit dialog
    const [crates, setCrates] = useState([]);
    const [crate, setCrate] = useState(null); //the one being edited in the dialog
    const [addCrate, setAddCrate] = useState(null); //the one being edited in the add new crate dialog
    const [search, setSearch] = useState(null);
    useEffect(() => {
        loadCrates();
    }, [locationId, search]);

    useEffect(() => {
        if (locationId) {
            axios.get("/api/inventory/byLocation/" + locationId).then(function(response) {
                setInventory(response.data);
            });
        }
    }, [locationId]);

    function loadCrates() {
        let url = "/api/crates/" + locationId + (search == null ? '' : "/" + search);
        axios.get(url).then(function(response) {
            setCrates(response.data);
        });
    }

    useEffect(() => {
        axios.get("/api/locations/").then(function(response) {
          
          console.log(response.data);
          setLocations(response.data);
        }).catch(function(err) {
            setErrorMessage(err.response.data);
        });
    }, []);
      
    function closeErrorDialog(e) {
      e.preventDefault();
      setErrorMessage(null);
    }

    function closeDialog(e) {
        e.preventDefault();
        setCrate(null);
        setAddCrate(null);
    }

    function confirmDelete(crate) {
        if (window.confirm("Are you sure you want to delete crate #" + crate.serialNumber)) {
            axios.delete("/api/crates/" + crate.serialNumber).then(function(response) {
                console.log(response.data);
                loadCrates();
                alert("deleted");

            }).catch(function(err) {
                setErrorMessage(err.response.data);
            });
        }
    }

    function saveCrate() {
        if (crate) {
            axios.put("/api/crates/" + crate.serialNumber, crate).then(function(response) {
                loadCrates();
                setCrate(null);
            }).catch(function(err) {
                setErrorMessage(err.response.data)
            });   
        } else if (addCrate) {
            if (addCrate.inventoryId == null) {
                addCrate.quantityAvailable=null;
            }
            axios.post("/api/crates/" + addCrate.serialNumber, addCrate).then(function(response) {
                loadCrates();
                setAddCrate(null);
            }).catch(function(err) {
                setErrorMessage(err.response.data)
            });
        }
    }

    function openEditDialog(crate) {
        let newCrate = {
            ...crate,
            locationId: locationId            
        };
        setCrate(newCrate);

    }

    function openAddDialog() {
        let newCrate = {
            locationId: locationId,
            quantityAvailable:0,
            serialNumber: null,
            inventoryId: null
        }
        setAddCrate(newCrate);
        console.log(newCrate);
        setCrate(null);
    }

    function updateCrateSerialNumber(inCrate, serialNumber) {
        let newAdd = {
            ...addCrate, 
            serialNumber: serialNumber
        }
        setAddCrate(newAdd);
    }
    
    function updateCrateType(inCrate, inventoryId) {
        let name = null;
        for (let index=0; index < inventory.length; index++) {
            if (inventory[index].id == inventoryId) {            
                name = inventory[index].name;
            }
        }
        if (crate) {
            let newCrate = {
                ...crate,
                inventoryId: inventoryId,
                name: name
            };    
            setCrate(newCrate);
        } else if (addCrate) {
            let newCrate = {
                ...addCrate,
                inventoryId: inventoryId,
                name: name
            };
    
            setAddCrate(newCrate);
        }
    }
    function updateCrateQuantity(inCrate, quantity) {
        if (crate) {
            //editing
            let newCrate = {
                ...crate,
                quantityAvailable: quantity
            }    
            setCrate(newCrate);
        } else if (addCrate) {
            //creating
            let newCrate = {
                ...addCrate,
                quantityAvailable: quantity
            }    
            setAddCrate(newCrate);
        }        
      }
      function closeErrorDialog(e) {
        e.preventDefault();
        setErrorMessage(null);
      }
      return (
        <ProtectedRoute roles="inventoryManager">
        <div id = "manageCrates">
            <h3>Crates</h3>
            <div class = "controls">                
                <label htmlFor="locations">Locations:</label>
                <Locations onChange = {(e) => setLocationId(e.target.value)}></Locations>    
                <label>Search:</label>            
                <Search onBlur={(e) => setSearch(e.target.value)}/>                
                {inventory && 
                    <div id="add">
                        <AddIcon onClick={(e) => openAddDialog()}></AddIcon>
                    </div>
                }
           </div>
            <TableContainer component = {Paper} id = "crates">
                <Table sx = {{minWidth:650}} >
                <TableHead>
                    <TableRow><TableCell>Serial</TableCell><TableCell>Produce</TableCell><TableCell>Quantity</TableCell><TableCell>actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {crates.map((crate) => (
                        <TableRow>
                            <TableCell>{crate.serialNumber}</TableCell>
                            <TableCell>{crate.name}</TableCell>
                            <TableCell>{crate.quantityAvailable}</TableCell>
                            <TableCell>
                                <DeleteIcon onClick={(e) => confirmDelete(crate)}></DeleteIcon>
                                <EditIcon onClick={(e) => openEditDialog(crate)}></EditIcon>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={crate != null} id = "editDialog" onClose={closeDialog}>
                <DialogTitle>Edit Crate</DialogTitle>
                <DialogContent>
                    {crate && 
                        <div class = "dialog_form">
                            <div>
                                <label> Serial Number</label>
                                <Select onChange = {(e) => updateCrateType(crate, e.target.value)} label = "produce type" value = {crate.inventoryId}>
                                    {inventory.map((inv) => (
                                        <MenuItem value = {inv.id}>{inv.name}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <label>Quantity</label>
                                <input type = "number" value = {crate.quantityAvailable} onChange = {(e) => updateCrateQuantity(crate, e.target.value)}></input>
                            </div>
                        </div>                        
                    }       
                </DialogContent>
                <DialogActions>          
                    <Button variant = "contained" onClick = {saveCrate}>Save</Button>
                    <Button variant = "contained" onClick = {closeDialog} >Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={addCrate != null} id = "createDialog" onClose={closeDialog}>
                <DialogTitle>New Crate</DialogTitle>
                <DialogContent>
                    {addCrate && 
                        <div class = "dialog_form">
                            <div>
                                <label> Serial Number</label>
                                <input type = "text" value = {addCrate.serialNumber} onChange = {(e) => updateCrateSerialNumber(addCrate, e.target.value)}></input>
                            </div>
                            <div>
                                <label>Type Stored</label>
                                <Select onChange = {(e) => updateCrateType(addCrate, e.target.value)} label = "produce type" value = {addCrate.inventoryId}>
                                    {inventory.map((inv) => (
                                        <MenuItem value = {inv.id}>{inv.name}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <label>Quantity</label>
                                <input type = "number" value = {addCrate.quantityAvailable} onChange = {(e) => updateCrateQuantity(addCrate, e.target.value)}></input>
                            </div>  
                            <label>{addCrate.serialNumber}</label>    
                            <label>{crate == null}</label>                      
                        </div>
                    }       
                </DialogContent>
                <DialogActions>          
                    <Button variant = "contained" onClick = {saveCrate}>Save</Button>
                    <Button variant = "contained" onClick = {closeDialog} >Close</Button>
                </DialogActions>
            </Dialog>
            <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>

        </div>
        </ProtectedRoute>
    )
}
export default Crates;