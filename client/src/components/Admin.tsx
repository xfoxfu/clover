import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import { RouteComponentProps } from 'react-router-dom';

import AddAnnounceDialog from './AddAnnounceDialog';
import GetRefCodeDialog from './GetRefCodeDialog';

import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField/TextField';
import Grid from 'material-ui/Grid';
import Switch from 'material-ui/Switch';

import User from '../models/user';
import { getAllUsers } from '../api/index';

interface IState {
  users: User[]
}
@inject('state') @observer
class Admin extends React.Component<RouteComponentProps<{}> & { state: AppState }, IState> {
  state: IState = { users: [] };
  componentDidMount() {
    const token = this.props.state.user && this.props.state.user.token;
    if (!token) {
      return this.props.state.emitError(new Error('未登入'));
    }
    getAllUsers(token)
      .then((users) => this.setState({ users }))
      .catch(this.props.state.emitError);
  }
  render() {
    const { users } = this.state;
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
                          fullWidth
                          disabled
                          label="VMess UID"
                          value={user.vmess.id}
                        />
                        <TextField
                          fullWidth
                          disabled
                          label="VMess Alter ID"
                          value={user.vmess.aid}
                        />
                        <TextField
                          fullWidth
                          disabled
                          label="Shadowsocks Port"
                          value={user.ss.port}
                        />
                        <TextField
                          fullWidth
                          disabled
                          label="Shadowsocks Password"
                          value={user.ss.password}
                        />
                        <TextField
                          fullWidth
                          disabled
                          label="Shadowsocks Encryption"
                          value={user.ss.encryption}
                        />
                        <TextField
                          fullWidth
                          multiline
                          disabled
                          label="Note"
                          value={user.note}
                        />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </p>
      </div>
    );
  }
}
export default Admin;