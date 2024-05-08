import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import {useEffect, useState} from 'react';
import axios from 'axios';
import ErrorDialog from './errorDialog';

const ProduceDialog = (props) => {
    const [count, setCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState(null);
     
    function updateName(newName) {
        props.product.name = newName;
        setCount(count+1);
    }
    function updateDescription(newDesc) {
        props.product.description = newDesc;
        setCount(count+1);
    }
    function saveProduct() {
        axios.post("/api/produce/", props.product).then(function(response) {
            setCount(count+1);
            props.onSave();

        }).catch(function(err) {
            setErrorMessage(err.response.data);
        })
    }
    function closeErrorDialog() {
        setErrorMessage(null);
    }
    return (
        <>        
        <Dialog open={props.product != null} id = "produceDialog"  onClose={props.closeProduceDialog}>
        <DialogTitle>Produce</DialogTitle>
        {props.product && 
            <DialogContent>
                 <div class="gridForm">
                   <label>Name:</label>
                   <input value = {props.product.name} type = "text" onChange={(e) => updateName(e.target.value)}/>
                    <label>Description:</label>
                    <textarea value = {props.product.description} onChange = {(e) => updateDescription(e.target.value)}/>
                </div>
            </DialogContent>
        }            
            <DialogActions>
            <Button variant = "contained" onClick = {saveProduct}>Save</Button>
            <Button variant = "contained" onClick = {props.closeProduceDialog} >Close</Button>
        </DialogActions> 
        </Dialog>
        <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}/>
        </>

    )
}
export default ProduceDialog;