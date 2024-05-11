import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import {useEffect, useState} from 'react';
import { Select } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import ProduceDialog from '../components/produceDialog';
import ErrorDialog from './errorDialog';
import axios from 'axios';



const InventoryDialog = (props) => {
    const [count, setCount] = useState(0);
    const [produce, setProduce] = useState([]);
    const [product, setProduct] = useState(null);
    
    const [errorMessage, setErrorMessage] = useState(null);
    useEffect(() => {
        loadProduce();
    }, [props.locationId]);

    
    function loadProduce() {
        axios.get("/api/produce/all/" + props.locationId).then(function(response) {
            setProduce(response.data);
        }).catch(function(err) {
            setErrorMessage(err.response.data);
        });
    }

    function saveItem() {
        //may be a create or edit
        axios.post("/api/inventory", props.item).then(function(response) {
            props.onSave(); 
            props.closeDialog();      
            loadProduce();     
        }).catch(function (err) {
            setErrorMessage(err.response.data);
        });
    }

    function updateProduceType(produceId) {
        props.item.produceId = produceId;
        setCount(count+1);
    }

    
    function updatePrice(newPrice) {
        props.item.price = newPrice;
        setCount(count+1);
    }
    function openAddProduceDialog() {
        setProduct({});
    }

    function saveProduct() {
        props.item.produceId = product.id;
        setProduct(null);
        loadProduce();
    }

    function closeProduceDialog() {
        setProduct(null);
    }
    function closeErrorDialog() {
        setErrorMessage(null);
    }

    return (
        <>
        <Dialog open={props.item != null} id = "inventoryDialog"  onClose={props.closeDialog}>
        <DialogTitle>Inventory</DialogTitle>
        {props.item && 
        <DialogContent>
            <div class="gridForm">
                {props.item.id && 
                    <>
                        <label>ID:</label>
                        <span>{props.item.id}</span>
                    </>
                }
                
                <label>Type:</label>
                {props.item.id == null?
                    <div>        
                        <Select onChange = {(e) => updateProduceType(e.target.value)} label = "produce type" value = {props.item.produceId}>
                            {produce.map((fruit) => (
                                <MenuItem value = {fruit.id}>{fruit.name}</MenuItem>
                            ))}
                        </Select>
                        <Button variant = "contained" onClick = {openAddProduceDialog} ><AddIcon />Add Type</Button>
                    </div>
                :
                    <span>{props.item.name}</span>
                }
                <label>Price:</label>               
                <input type = "number" value = {props.item.price ? props.item.price.slice(1):0} step = ".01" onChange={(e) => updatePrice(e.target.value)} />
            </div>
        </DialogContent>
        }
        <DialogActions>
            <Button variant = "contained" onClick = {saveItem}>Save</Button>
            <Button variant = "contained" onClick = {props.closeDialog} >Close</Button>
        </DialogActions>    
        </Dialog>
        <ProduceDialog closeProduceDialog={closeProduceDialog} product = {product} onSave={saveProduct}/>
        <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}/>
    </>
    )
}
export default InventoryDialog;