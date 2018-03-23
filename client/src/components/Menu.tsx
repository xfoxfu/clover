import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import { RouteComponentProps, Link } from 'react-router-dom';
import { Menu, Icon } from 'antd';

@inject('state') @observer
class MenuComponent extends React.Component<RouteComponentProps<{}> & { state: AppState }, {}> {
  render() {
    return (
      <div>
        <h1>
          {this.props.state.site && this.props.state.site.siteTitle}
        </h1>
        <Menu
          selectedKeys={[this.props.location.pathname]}
          mode="horizontal"
        >
          <Menu.Item key="/dashboard"><Link to="/dashboard">
            <Icon type="mail" />首页</Link>
          </Menu.Item>
          <Menu.Item key="/announces"><Link to="/announces">
            <Icon type="mail" />公告</Link>
          </Menu.Item>
          {this.props.state.user && this.props.state.user.isAdmin &&
            <Menu.Item key="/admin"><Link to="/admin">
              <Icon type="mail" />管理</Link>
            </Menu.Item>}
        </Menu>
      </div>
    );
  }
}
export default MenuComponent;