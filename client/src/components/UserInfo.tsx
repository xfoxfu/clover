import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import { RouteComponentProps } from 'react-router-dom';
import Avatar from 'material-ui/Avatar/Avatar';
import Button from 'material-ui/Button/Button';
import Card from 'material-ui/Card/Card';
import CardContent from 'material-ui/Card/CardContent';
import Chip from 'material-ui/Chip';
import Typography from 'material-ui/Typography';
import ResetPasswordDialog from './ResetPasswordDialog';
import theme from '../lib/theme';

@inject('state') @observer
class Dashboard extends React.Component<RouteComponentProps<{}> & { state: AppState }, {}> {
  render() {
    return (
      <Card>
        <CardContent>
          <Typography type="headline" component="h2">
            <Chip
              avatar={<Avatar>{this.props.state.user && this.props.state.user.id}</Avatar>}
              label={this.props.state.user && this.props.state.user.email}
              color="primary"
            />
          </Typography>
          <Typography>
            <p>
              <ResetPasswordDialog state={this.props.state} />
              <Button onClick={this.props.state.logout} style={{ margin: theme.spacing.unit }}>
                登出
              </Button>
            </p>
            <p>{this.props.state.user && this.props.state.user.note}</p>
          </Typography>
        </CardContent>
      </Card>
    );
  }
}
export default Dashboard;