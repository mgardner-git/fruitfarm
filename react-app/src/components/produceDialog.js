import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';


const ErrorDialog = (props) => {
    return (
        <Dialog open={props.product != null} id = "produceDialog"  onClose={props.closeProduceDialog}>
        <DialogTitle>Produce</DialogTitle>
        {props.product && 
            <DialogContent>
                <div>
                    <label>Name:</label>
                    <input value = {props.product.name} type = "text" onChange={(e) => props.product.name = e.target.value}/>
                </div>
                <div>
                    <label>Description:</label>
                    <textarea value = {props.product.name} onChange = {(e) => props.product.description = e.target.value}/>
                </div>
            </DialogContent>                }
            <DialogActions>
            <Button variant = "contained" onClick = {props.saveProduct}>Save</Button>
            <Button variant = "contained" onClick = {props.closeProduceDialog} >Close</Button>
        </DialogActions> 
        </Dialog>
    )
}
export default ErrorDialog;