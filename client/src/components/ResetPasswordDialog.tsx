import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { ChangeEvent } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import theme from '../lib/theme';

@inject('state') @observer
class FormDialog extends React.Component<{
  state: AppState
}, {
  open: boolean,
  password: string,
  newPassword: string,
  newPassword2: string,
  loading: boolean;
}> {
  state = {
    open: false,
    password: '',
    newPassword: '',
    newPassword2: '',
    loading: false,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };
  handleClose = () => {
    if (this.state.newPassword !== this.state.newPassword2) {
      return this.props.state.emitError(new Error('两次输入的密码不匹配'));
    }
    this.setState({ loading: true });
    this.props.state.resetPassword(this.state.password, this.state.newPassword)
      .then(() => this.setState({
        open: false,
        password: '',
        newPassword: '',
        newPassword2: '',
        loading: false
      }))
      .catch((err) => {
        this.setState({ loading: false });
        this.props.state.emitError(err)
      });
  };
  simpleClose = () => {
    this.setState({ open: false });
  }
  handleChange = (name: string) => (event: ChangeEvent<{ value: string }>) => {
    this.setState({
      ...this.state,
      [name]: event.target.value,
    });
  }

  render() {
    const { loading } = this.state;
    return (
      <span>
        <Button onClick={this.handleClickOpen} style={{ margin: theme.spacing.unit }}>修改密码</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">修改密码</DialogTitle>
          <DialogContent>
            <DialogContentText>
              修改密码后，您需要重新登入网站。
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="password"
              label="当前密码"
              type="password"
              fullWidth
              onChange={this.handleChange('password')}
            />
            <TextField
              margin="dense"
              id="newPassword"
              label="新密码"
              type="password"
              fullWidth
              onChange={this.handleChange('newPassword')}
            />
            <TextField
              margin="dense"
              id="newPassword2"
              label="再次输入新密码"
              type="password"
              fullWidth
              onChange={this.handleChange('newPassword2')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.simpleClose} color="secondary">
              取消
            </Button>
            <div style={{ position: 'relative', }}>
              <Button
                onClick={this.handleClose}
                color="secondary"
                disabled={loading}
              >
                提交
             </Button>
              {loading && <CircularProgress size={24} />}
            </div>
          </DialogActions>
        </Dialog>
      </span>
    );
  }
}
export default FormDialog;
