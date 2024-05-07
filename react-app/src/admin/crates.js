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
    const [inventory, setInventory] = useState(null); 
    const [crates, setCrates] = useState([]);
    const [crate, setCrate] = useState(null); 
    const [editMode, setEditMode] = useState(null); //edit or add
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
    }

    function confirmDelete(crate) {
        if (window.confirm("Are you sure you want to delete crate #" + crate.serialNumber)) {
            axios.delete("/api/crates/" + crate.serialNumber).then(function(response) {                
                loadCrates();
                alert("deleted");

            }).catch(function(err) {
                setErrorMessage(err.response.data);
            });
        }
    }

    function saveCrate() {
        if (crate) {
            axios.post("/api/crates/", crate).then(function(response) {
                loadCrates();
                setCrate(null);
            }).catch(function(err) {
                setErrorMessage(err.response.data);
            });   
        }
    }


    function openDialog(inCrate) {
        setCrate(inCrate);
    }
    function openDialogAsCreate() {
        setEditMode(false);
        openDialog({
            locationId: locationId
        });
    }
    function openDialogAsEdit(inCrate) {
        setEditMode(true);
        openDialog(inCrate)
    }
    function closeDialog() {
        setCrate(null);
    }

    function updateCrateSerialNumber(inCrate, serialNumber) {
        let newAdd = {
            ...crate, 
            serialNumber: serialNumber
        }
        setCrate(newAdd);
    }
    
    function updateCrateType(inCrate, inventoryId) {
        let name = null;
        for (let index=0; index < inventory.length; index++) {
            if (inventory[index].id == inventoryId) {            
                name = inventory[index].name;
            }
        }
        
        let newCrate = {
            ...crate,
            inventoryId: inventoryId,
            name: name
        };    
        setCrate(newCrate);
        
    }
    function updateCrateQuantity(inCrate, quantity) {        
            let newCrate = {
                ...crate,
                quantityAvailable: quantity
            }    
            setCrate(newCrate);                
      }

      function closeErrorDialog(e) {      
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
                        <Button variant="contained"> <AddIcon onClick={(e) => openDialogAsCreate()}></AddIcon>Create Crate</Button>
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
                                <EditIcon onClick={(e) => openDialogAsEdit(crate)}></EditIcon>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={crate != null} id = "crateDialog" onClose={closeDialog}>
                <DialogTitle>Edit Crate</DialogTitle>
                <DialogContent>
                    {crate && 
                        <div class="gridForm">
                            <label>Serial #:</label>
                            {editMode ?
                                <label>{crate.serialNumber}</label>
                                :
                                <input type="text" value = {crate.serialNumber} onChange = {(e) => updateCrateSerialNumber(crate, e.target.value)}/>
                            }
                            <label> Type:</label>
                            <Select onChange = {(e) => updateCrateType(crate, e.target.value)} label = "produce type" value = {crate.inventoryId}>
                                {inventory.map((inv) => (
                                    <MenuItem value = {inv.id}>{inv.name}</MenuItem>
                                ))}
                            </Select>
                            <label>Quantity:</label>
                            <input type = "number" value = {crate.quantityAvailable} onChange = {(e) => updateCrateQuantity(crate, e.target.value)}></input>
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