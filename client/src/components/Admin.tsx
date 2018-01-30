import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import { RouteComponentProps } from 'react-router-dom';
import { ChangeEvent } from 'react';

import AddAnnounceDialog from './AddAnnounceDialog';
import GetRefCodeDialog from './GetRefCodeDialog';

import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField/TextField';
import Grid from 'material-ui/Grid';
import Switch from 'material-ui/Switch';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { CircularProgress } from 'material-ui/Progress';

import User from '../models/user';
import { getAllUsers, editUser } from '../api/index';

interface IState {
  users: User[],
  editorUser?: {
    id: number;
    email: string,
    enabled: boolean,
    isAdmin: boolean,
    isEmailVerified: boolean,
    note: string,
  },
  open: boolean,
  loading: boolean;
}
@inject('state') @observer
class Admin extends React.Component<RouteComponentProps<{}> & { state: AppState }, IState> {
  state: IState = {
    users: [],
    open: false,
    loading: false,
  };

  componentDidMount() {
    const token = this.props.state.user && this.props.state.user.token;
    if (!token) {
      return this.props.state.emitError(new Error('未登入'));
    }
    getAllUsers(token)
      .then((users) => this.setState({ users }))
      .catch(this.props.state.emitError);
  }

  handleClickOpen = (user: User) => () => {
    this.setState({
      open: true,
      editorUser: user,
    });
  };
  handleClose = () => {
    if (!this.state.editorUser) { return; }
    const token = this.props.state.user && this.props.state.user.token;
    if (!token) { return; }
    const { id, email, enabled, isAdmin, isEmailVerified, note } = this.state.editorUser;
    editUser(token, { id, email, enabled, isAdmin, isEmailVerified, note })
      .then((message) => {
        this.props.state.emitMessage(message.message);
        this.setState({ open: false });
      })
      .then(() => getAllUsers(token))
      .then((users) => this.setState({ users }))
      .catch(this.props.state.emitError);
  };
  handleSimpleClose = () => {
    this.setState({ open: false });
  };

  handleInputChange = (name: string) => (event: ChangeEvent<{ value: string }>) => {
    const value = event.target.value;
    this.setState((state) => ({
      editorUser: {
        ...this.state.editorUser,
        [name]: value,
      },
    }) as any);
  };
  handleCheckboxChange = (name: string) => (event: React.ChangeEvent<{}>, checked: boolean) => {
    this.setState((state) => ({
      editorUser: {
        ...state.editorUser,
        [name]: checked,
      }
    }) as any);
  };

  render() {
    const { users, editorUser } = this.state;
    const admin = this.props.state.user;
    return (
      <div>
        <p>
          <AddAnnounceDialog state={this.props.state} />
          <GetRefCodeDialog state={this.props.state} />
          <Grid container>
            <Grid item xs={12} lg={12}>
              <Card>
                <CardContent>
                  <Typography type="headline" component="h2">
                    服务器状态
                  </Typography>
                  <Typography>
                    <p><b>VMess</b>
                      <Switch
                        disabled
                        checked={admin && admin.vmess.enabled}
                        aria-label="checkedA"
                      /><br /><b>Shadowsocks</b>
                      <Switch
                        disabled
                        checked={admin && admin.ss.enabled}
                        aria-label="checkedA"
                      />
                    </p>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {
              users.length && users.map((user) => (
                <Grid item xs={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography>
                        <p><b>{user.email}</b></p>
                        <p>
                          {user.isAdmin ? <b>管理员</b> : "用户"}&nbsp;
                          <b>{user.isEmailVerified ? "" : "邮箱未激活"}</b>&nbsp;
                          <b>{user.enabled ? "" : "账户已停用"}</b>
                        </p>
                        <TextField
                          fullWidth disabled
                          label="VMess UID"
                          value={user.vmess.id}
                        />
                        <TextField
                          fullWidth disabled
                          label="VMess Alter ID"
                          value={user.vmess.aid}
                        />
                        <TextField
                          fullWidth disabled
                          label="Shadowsocks Port"
                          value={user.ss.port}
                        />
                        <TextField
                          fullWidth disabled
                          label="Shadowsocks Password"
                          value={user.ss.password}
                        />
                        <TextField
                          fullWidth disabled
                          label="Shadowsocks Encryption"
                          value={user.ss.encryption}
                        />
                        <TextField
                          fullWidth multiline disabled
                          label="Note" value={user.note}
                        />
                        <Button onClick={this.handleClickOpen(user)}>编辑用户</Button>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            <Dialog
              open={this.state.open}
              onClose={this.handleClose}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">修改用户</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  请修改下方的选项，然后点击保存。
                </DialogContentText>
                <TextField
                  margin="dense"
                  id="name"
                  label="邮箱"
                  type="email"
                  value={editorUser && editorUser.email}
                  onChange={this.handleInputChange('email')}
                  fullWidth
                />
                启用：
                  <Switch
                  checked={editorUser && editorUser.enabled}
                  aria-label="checkedA"
                  onChange={this.handleCheckboxChange('enabled')}
                />
                <br />管理员：
                <Switch
                  checked={editorUser && editorUser.isAdmin}
                  aria-label="checkedB"
                  onChange={this.handleCheckboxChange('isAdmin')}
                />
                <br />邮箱验证：
                <Switch
                  checked={editorUser && editorUser.isEmailVerified}
                  aria-label="checkedC"
                  onChange={this.handleCheckboxChange('isEmailVerified')}
                />
                <TextField
                  margin="dense"
                  id="note"
                  label="备注"
                  type=" text"
                  value={editorUser && editorUser.note}
                  onChange={this.handleInputChange('note')}
                  fullWidth
                  multiline
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleSimpleClose} color="primary">
                  取消
                </Button>
                <Button
                  onClick={this.handleClose}
                  color="primary"
                  disabled={this.state.loading}
                  raised
                >
                  提交
                </Button>
                {this.state.loading && <CircularProgress />}
              </DialogActions>
            </Dialog>
          </Grid>
        </p>
      </div>
    );
  }
}
export default Admin;