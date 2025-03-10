import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface AlertDialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    body: string;
    onAgree?: () => void;
}


export default function AlertDialog({
    open, onClose, title, body, onAgree
}: AlertDialogProps) {

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {title || ""}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {body}
          </DialogContentText>
        </DialogContent>
        {onAgree && (
        <DialogActions>
           <Button onClick={onClose}>Disagree</Button>
           <Button onClick={onAgree} autoFocus>
             Agree
           </Button>
        </DialogActions>)}
      </Dialog>
    </React.Fragment>
  );
}