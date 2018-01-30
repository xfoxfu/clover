import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import { RouteComponentProps, Link } from 'react-router-dom';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography/Typography';

@inject('state') @observer
class Menu extends React.Component<RouteComponentProps<{}> & { state: AppState }, {}> {
  render() {
    return (
      <div>
        <Typography type="headline" component="h1">
          {this.props.state.site && this.props.state.site.siteTitle}
        </Typography>
        <Button component={props => <Link to={`${process.env.PUBLIC_URL}/dashboard`} {...props} />}>首页</Button>
        <Button component={props => <Link to={`${process.env.PUBLIC_URL}/announces`} {...props} />}>公告</Button>
        {this.props.state.user && this.props.state.user.isAdmin &&
          <Button component={props => <Link to={`${process.env.PUBLIC_URL}/admin`} {...props} />}>管理</Button>}
      </div>
    );
  }
}
export default Menu;