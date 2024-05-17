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
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Locations from '../components/locations';
import InventoryDialog from '../components/inventoryDialog';


const Crates = () => {
  
    const [locationId, setLocationId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null); 
    const [inventory, setInventory] = useState(null); 
    const [crates, setCrates] = useState([]);
    const [crate, setCrate] = useState(null); 
    const [editMode, setEditMode] = useState(null); //edit or add
    const [search, setSearch] = useState(null);
    const [item, setItem] = useState(null); //used in the create inventory dialog
    
    useEffect(() => {
        loadCrates();
    }, [locationId, search]);

    useEffect(() => {
        if (locationId) {
            loadInventory();
        }
    }, [locationId]);

    function loadInventory() {
        axios.get("/api/inventory/byLocation/" + locationId).then(function(response) {
            setInventory(response.data);
        });
    }
    function loadCrates() {
        let url = "/api/crates/" + locationId + (search == null ? '' : "/" + search);
        axios.get(url).then(function(response) {
            setCrates(response.data);
        });
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
    function confirmEmpty(crate) {

        if (window.confirm("Are you sure you want to empty the contents of crate #" + crate.serialNumber)) {
            let emptyCrate = {
                serialNumber: crate.serialNumber,
                locationId: locationId,
                quantityAvailable: 0,                
            }
            axios.post("/api/crates/", emptyCrate).then(function(response) {
                loadCrates();
                setCrate(null);
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
        let newCrate = {
            locationId:locationId,
            serialNumber: inCrate.serialNumber,
            inventoryId: inCrate.inventoryId,
            quantityAvailable: inCrate.quantityAvailable
        }
        openDialog(newCrate);
    }

    function updateCrateSerialNumber(inCrate, serialNumber) {
        let newAdd = {
            ...crate, 
            serialNumber: serialNumber
        }
        setCrate(newAdd);
    }
    
    function updateCrateType(inCrate, inventoryId) {        
        let newCrate = {
            ...crate,
            inventoryId: inventoryId            
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

      function saveInventory() {
        loadInventory();
      }
      function openInventoryDialog() {
        setItem({
            locationId: locationId,
            price: 0
        })
      }
      function closeInventoryDialog() {
        setItem(null);
      }
      return (
        <ProtectedRoute roles="inventoryManager">
        <div id = "manageCrates">
            <h2>Crates</h2>
            <div class = "controls">                
                <label htmlFor="locations">Locations:</label>
                <Locations onChange = {(e) => setLocationId(e.target.value)}></Locations>    
                <label>Search:</label>            
                <Search onBlur={(e) => setSearch(e.target.value)}/>                
                {inventory && 
                    <div id="add">
                        <Button variant="contained" onClick={(e) => openDialogAsCreate()}> <AddIcon></AddIcon>Create Crate</Button>
                    </div>
                }
           </div>
            <TableContainer component = {Paper} id = "crates">
                <Table sx = {{minWidth:650}} >
                <TableHead>
                    <TableRow><TableCell>Serial</TableCell><TableCell>Produce</TableCell><TableCell>Quantity</TableCell><TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {crates.map((crate) => (
                        <TableRow>
                            <TableCell>{crate.serialNumber}</TableCell>
                            <TableCell>{crate.name}</TableCell>
                            <TableCell>{crate.quantityAvailable}</TableCell>
                            <TableCell>
                                <Button variant="contained" title="Delete"><DeleteIcon  onClick={(e) => confirmDelete(crate)}></DeleteIcon></Button>
                                <Button variant="contained" title="Edit"><EditIcon onClick={(e) => openDialogAsEdit(crate)}></EditIcon></Button>
                                <Button variant="contained" title="Empty"><CheckBoxOutlineBlank onClick={(e) => confirmEmpty(crate)}></CheckBoxOutlineBlank></Button>
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
                            <div>
                            <Select onChange = {(e) => updateCrateType(crate, e.target.value)} label = "produce type" value = {crate.inventoryId}>
                                {inventory.map((inv) => (
                                    <MenuItem value = {inv.id}>{inv.name}</MenuItem>
                                ))}
                            </Select>
                            <Button variant="contained" onClick={openInventoryDialog}><AddIcon></AddIcon>Add Inventory</Button>
                            </div>
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
            <InventoryDialog onSave={saveInventory} item={item} locationId={locationId} closeDialog={closeInventoryDialog} onChange={(e) => setItem({...item})} />

            <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>

        </div>
        </ProtectedRoute>
    )
}
export default Crates;