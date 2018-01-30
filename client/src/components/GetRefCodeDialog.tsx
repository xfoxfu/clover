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
import { getRefCode } from '../api/index';
import theme from '../lib/theme';

@inject('state') @observer
class FormDialog extends React.Component<{
  state: AppState
}, {
  open: boolean,
  email: string,
  note: string,
  code: string,
  loading: boolean;
}> {
  state = {
    open: false,
    email: '',
    note: '',
    code: '',
    loading: false,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };
  handleClose = () => {
    const { email, note } = this.state;
    const token = this.props.state.user && this.props.state.user.token;
    if (!token) {
      return this.props.state.emitError(new Error('未登入'));
    }
    this.setState({ loading: true });
    getRefCode(token, email, note)
      .then((result) => this.setState({
        note: '',
        email: '',
        code: result.refcode,
        loading: false,
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
        <Button
          onClick={this.handleClickOpen}
          color="secondary"
          style={{ margin: theme.spacing.unit }}
        >生成邀请码</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">生成邀请码</DialogTitle>
          <DialogContent>
            <DialogContentText>
              邀请码有效期 6 小时。
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="email"
              label="邮箱"
              type="email"
              fullWidth
              onChange={this.handleChange('email')}
            />
            <TextField
              multiline
              margin="dense"
              id="note"
              label="用户备注"
              type="text"
              fullWidth
              onChange={this.handleChange('note')}
            />
            <div style={{ position: 'relative', }}>
              <Button
                onClick={this.handleClose}
                color="primary"
                disabled={loading}
                raised
              >
                提交
             </Button>
              {loading && <CircularProgress />}
              <TextField
                multiline
                margin="dense"
                id="code"
                label="邀请码"
                type="text"
                fullWidth
                disabled
                value={this.state.code}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.simpleClose} color="secondary">
              完成
            </Button>
          </DialogActions>
        </Dialog >
      </span >
    );
  }
}
export default FormDialog;
