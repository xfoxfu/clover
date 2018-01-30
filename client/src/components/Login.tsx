import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import { RouteComponentProps } from 'react-router-dom';
import Button from 'material-ui/Button';
import Tabs, { Tab } from 'material-ui/Tabs';
import TextField from 'material-ui/TextField/TextField';
import Typography from 'material-ui/Typography';
import { ChangeEvent } from 'react';

enum TABS {
  LOGIN,
  REGISTER,
  PASS_REC,
}

@inject('state') @observer
class Dashboard extends React.Component<RouteComponentProps<{}> & { state: AppState }, {
  email: string;
  password: string;
  password2: string;
  ref: string;
  tab: number;
  err: string;
}> {
  state = {
    email: '',
    password: '',
    password2: '',
    ref: '',
    tab: 0,
    err: '',
  };

  handleChange = (name: string) => (event: ChangeEvent<{ value: string }>) => {
    this.setState({
      ...this.state,
      [name]: event.target.value,
    });
  }
  handleChangeTab = (event: ChangeEvent<{}>, value: number) => {
    this.setState({
      ...this.state,
      tab: value,
    });
  }

  handleSubmit = async () => {
    try {
      switch (this.state.tab) {
        case TABS.LOGIN: {
          await this.props.state.login(this.state.email, this.state.password);
          break;
        }
        case TABS.REGISTER: {
          if (this.state.password !== this.state.password2) {
            throw new Error('两次输入的密码不匹配');
          }
          await this.props.state.reg(this.state.email, this.state.password, this.state.ref);
          break;
        }
        case TABS.PASS_REC: {
          await this.props.state.resetPasswordEmail(this.state.email);
          break;
        }
        default: {
          throw new Error('此功能未实现');
        }
      }
    } catch (err) {
      this.props.state.emitError(err);
    }
  }

  render() {
    return (
      <div>
        <Tabs
          value={this.state.tab}
          onChange={this.handleChangeTab}
        >
          <Tab label="登入" />
          <Tab label="注册" />
          <Tab label="找回密码" />
        </Tabs>
        <Typography>
          <div style={{ padding: '8px', paddingBottom: '0px' }}>
            <TextField
              id="email"
              label="邮箱"
              type="email"
              value={this.state.email}
              onChange={this.handleChange('email')}
              margin="normal"
              fullWidth
            />
          </div>
          {this.state.tab !== TABS.PASS_REC &&
            <div style={{ padding: '8px', paddingBottom: '0px' }}>
              <TextField
                id="password"
                label="密码"
                type="password"
                value={this.state.password}
                onChange={this.handleChange('password')}
                margin="normal"
                fullWidth
              />
            </div>
          }{this.state.tab === TABS.REGISTER &&
            <div style={{ padding: '8px', paddingBottom: '0px' }}>
              <TextField
                id="password2"
                label="再次输入密码"
                type="password"
                value={this.state.password2}
                onChange={this.handleChange('password2')}
                margin="normal"
                fullWidth
              />
            </div>
          }{(this.state.tab === TABS.REGISTER && (this.props.state.site && !this.props.state.site.openRegister)) &&
            <div style={{ padding: '8px', paddingBottom: '0px' }}>
              <TextField
                id="ref"
                label="邀请码"
                multiline
                value={this.state.ref}
                onChange={this.handleChange('ref')}
                margin="normal"
                fullWidth
              />
            </div>
          }
          <div style={{ padding: '8px' }}>
            <Button
              color="secondary"
              raised
              onClick={this.handleSubmit}
            >
              {this.state.tab === TABS.LOGIN ? '登入' :
                (this.state.tab === TABS.REGISTER ? '注册' :
                  (this.state.tab === TABS.PASS_REC ? '提交' : '')
                )}
            </Button>
          </div>
        </Typography>
      </div >
    );
  }
}
export default Dashboard;