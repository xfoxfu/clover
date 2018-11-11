// This is where you write the code,the core of the app.
import * as React from "react";
import { observer, Provider } from "mobx-react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import AppState from "../lib/state";
import IndexPage from "./IndexPage";
import Dashboard from "./Dashboard";
import UserInfo from "./UserInfo";
import Login from "./Login";
import Announces from "./Announces";
import Menu from "./Menu";
import Admin from "./Admin";
import { Redirect } from "react-router";
import "antd/dist/antd.css";
import { Row, Col } from "antd";
import { hot } from "react-hot-loader";
import { APP_ROOT } from "../lib/const.ts";

@observer
class App extends React.Component<{ state: AppState }, {}> {
  public render() {
    return (
      <Provider state={this.props.state}>
        <Router basename={APP_ROOT}>
          <Row type="flex" justify="center">
            <Col xs={24} lg={18}>
              {this.props.state.user && this.props.state.user.token ? (
                <Switch>
                  <Redirect from="/" to="/dashboard" />
                </Switch>
              ) : (
                <Switch>
                  <Route path="/" exact />
                  <Redirect to="/" />
                </Switch>
              )}
              <Switch>
                <Route path="/" exact />
                <Route component={Menu} />
              </Switch>
              <Row gutter={8}>
                <Col xs={24} lg={14}>
                  <Switch>
                    <Route path="/" exact component={IndexPage} />
                    <Route path="/dashboard" exact component={Dashboard} />
                    <Route path="/announces" exact component={Announces} />
                    <Route path="/admin" exact component={Admin} />
                  </Switch>
                </Col>
                <Col xs={24} lg={10}>
                  <Switch>
                    <Route path="/" exact component={Login} />
                    <Route component={UserInfo} />
                  </Switch>
                </Col>
              </Row>
            </Col>
          </Row>
        </Router>
      </Provider>
    );
  }
}

export default hot(module)(App);
