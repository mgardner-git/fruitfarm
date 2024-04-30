import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
  
const ErrorDialog = (props) => {

    
    return (

        <Dialog open={props.errorMessage != null} id = "errorDialog">
          <DialogTitle>Error</DialogTitle>
          <DialogContent>{props.errorMessage}</DialogContent>
          <DialogActions>                              
                <button onClick = {props.close}>Close</button>
            </DialogActions>
        </Dialog>

    )
}
export default ErrorDialog;