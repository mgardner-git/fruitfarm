import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import axios from 'axios';

const AddressDialog = (props) => {

    function updateAddress() {
        var newAddress = {
            ...props.address,
            street1 : document.getElementById("street1").value,
            street2 : document.getElementById("street2").value,
            city :document.getElementById("city").value,
            state :document.getElementById("state").value,
            zip : document.getElementById("zip").value
        }
        props.setAddress(newAddress);
    }
    function saveAddress() {
        axios.post("/api/address/", props.address).then(function(response) {
            props.setAddress(null);
            if (props.onSave) {
                props.onSave();
            }       
        }).catch (function(err) {
            //not sure what to do here
        });
        props.setAddress(null);
    }

    return (

        <Dialog open={props.address != null} id = "addressDialog" onClose = "{props.onClose}">
          <DialogTitle>Address</DialogTitle>
          {props.address && 
                <DialogContent>
                    <div class="gridForm">
                    
                        <label>Street 1</label>                        
                        <input type = "text" value = {props.address.street1} onChange = {updateAddress} id = "street1"/>
                        <label>Street 2</label>
                        <input type = "text" value = {props.address.street2} onChange = {updateAddress} id = "street2"/>
                        <label>city</label>
                        <input type = "text" value = {props.address.city} onChange = {updateAddress} id = "city"/>
                        <label>state</label>
                        <input type = "text" value = {props.address.state} onChange = {updateAddress} id = "state"/>
                        <label>Zip:</label>
                        <input type = "text" value = {props.address.zip} onChange = {updateAddress} id = "zip"/>                    
                    </div>
                </DialogContent>
            }
          <DialogActions>                              
            <Button variant = "contained" onClick = {props.onClose}>Close</Button>
            <Button variant = "contained" onClick = {saveAddress}>Save</Button>
          </DialogActions>
        </Dialog>

    )
}
export default AddressDialog;