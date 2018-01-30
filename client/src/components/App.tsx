// This is where you write the code,the core of the app.
import * as React from 'react';
import { observer, Provider } from 'mobx-react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppState from '../lib/state';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Grid from 'material-ui/Grid';
import IndexPage from './IndexPage';
import Dashboard from './Dashboard';
import UserInfo from './UserInfo';
import Login from './Login';
import Announces from './Announces';
import Menu from './Menu';
import Admin from './Admin';
import MessageDialog from './MessageDialog';
import { Redirect } from 'react-router';
import theme from '../lib/theme';

@observer
class App extends React.Component<{ state: AppState }, {}> {
  render() {
    return (
      <Provider state={this.props.state}>
        <MuiThemeProvider theme={theme}>
          <Router>
            <Grid container justify="center">
              <Grid item xs={12} lg={9}>
                <MessageDialog state={this.props.state} />
                {
                  this.props.state.user && this.props.state.user.token ?
                    (<Switch>
                      <Redirect from={`${process.env.PUBLIC_URL}/`} to={`${process.env.PUBLIC_URL}/dashboard`} />
                    </Switch>) :
                    (<Switch>
                      <Route path={`${process.env.PUBLIC_URL}/`} exact />
                      <Redirect to={`${process.env.PUBLIC_URL}/`} />
                    </Switch>)
                }
                <Switch>
                  <Route path={`${process.env.PUBLIC_URL}/`} exact />
                  <Route component={Menu} />
                </Switch>
                <Grid container justify="center">
                  <Grid item xs={12} lg={7}>
                    <Switch>
                      <Route path={`${process.env.PUBLIC_URL}/`} exact component={IndexPage} />
                      <Route path={`${process.env.PUBLIC_URL}/dashboard`} exact component={Dashboard} />
                      <Route path={`${process.env.PUBLIC_URL}/announces`} exact component={Announces} />
                      <Route path={`${process.env.PUBLIC_URL}/admin`} exact component={Admin} />
                    </Switch>
                  </Grid>
                  <Grid item xs={12} lg={5}>
                    <Switch>
                      <Route path={`${process.env.PUBLIC_URL}/`} exact component={Login} />
                      <Route component={UserInfo} />
                    </Switch>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Router>
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default App;