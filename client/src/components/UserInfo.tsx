import * as React from "react";
import { inject, observer } from "mobx-react";
import AppState from "../lib/state";
import { RouteComponentProps } from "react-router-dom";
import ResetPasswordDialog from "./ResetPasswordDialog";
import { Button, Card, Tooltip, Tag } from "antd";

@inject("state")
@observer
class Dashboard extends React.Component<
  RouteComponentProps<{}> & { state: AppState },
  {}
> {
  public render() {
    const { user } = this.props.state;
    return (
      <Card
        style={{ marginTop: "8px" }}
        title={this.props.state.user && this.props.state.user.email}
      >
        <p>{this.props.state.user && this.props.state.user.note}</p>
        <p>
          <Tooltip
            placement="top"
            title={user && `自 ${user.fee_start + 1} 月起计费`}
          >
            <Tag color="#2db7f5">待缴费 {user && user.fee_total} 元</Tag>
          </Tooltip>
          <Tag color="#108ee9">每月 {user && user.fee_base} 元</Tag>
        </p>
        <ResetPasswordDialog state={this.props.state} />
        <Button onClick={this.props.state.logout}>登出</Button>
      </Card>
    );
  }
}

export default Dashboard;
