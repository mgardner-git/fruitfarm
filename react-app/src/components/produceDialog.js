import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import {useEffect, useState} from 'react';


const ProduceDialog = (props) => {
    const [count, setCount] = useState(0);
     
    function updateName(newName) {
        props.product.name = newName;
        setCount(count+1);
    }
    function updateDescription(newDesc) {
        props.product.description = newDesc;
        setCount(count+1);
    }
    return (
        <Dialog open={props.product != null} id = "produceDialog"  onClose={props.closeProduceDialog}>
        <DialogTitle>Produce</DialogTitle>
        {props.product && 
            <DialogContent>

                <div>
                    <label>Name:</label>
                    <input value = {props.product.name} type = "text" onChange={(e) => updateName(e.target.value)}/>
                </div>
                <div>
                    <label>Description:</label>
                    <textarea value = {props.product.description} onChange = {(e) => updateDescription(e.target.value)}/>
                </div>
            </DialogContent>                
        }
            
            <DialogActions>
            <Button variant = "contained" onClick = {props.saveProduct}>Save</Button>
            <Button variant = "contained" onClick = {props.closeProduceDialog} >Close</Button>
        </DialogActions> 
        </Dialog>
    )
}
export default ProduceDialog;