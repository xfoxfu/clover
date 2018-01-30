import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

@inject('state') @observer
class MessageDialog extends React.Component<{ state: AppState }, {}> {
  render() {
    return (
      <Dialog
        open={!!this.props.state.message}
        onClose={this.props.state.clearMessage}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">提示</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {this.props.state.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.state.clearMessage} color="secondary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog >);
  }
}

export default MessageDialog;