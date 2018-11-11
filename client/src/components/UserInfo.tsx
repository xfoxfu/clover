import * as React from "react";
import { inject, observer } from "mobx-react";
import AppState from "../lib/state";
import { RouteComponentProps } from "react-router-dom";
import ResetPasswordDialog from "./ResetPasswordDialog";
import { Button, Card } from "antd";

@inject("state")
@observer
class Dashboard extends React.Component<
  RouteComponentProps<{}> & { state: AppState },
  {}
> {
  render() {
    return (
      <Card
        style={{ marginTop: "8px" }}
        title={this.props.state.user && this.props.state.user.email}
      >
        <p>{this.props.state.user && this.props.state.user.note}</p>
        <ResetPasswordDialog state={this.props.state} />
        <Button onClick={this.props.state.logout}>登出</Button>
      </Card>
    );
  }
}

export default Dashboard;
