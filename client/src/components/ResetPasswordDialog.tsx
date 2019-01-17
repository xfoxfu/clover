import * as React from "react";
import { ChangeEvent } from "react";
import { inject, observer } from "mobx-react";
import AppState from "../lib/state";
import { Button, Form, Input, Modal } from "antd";

@inject("state")
@observer
class FormDialog extends React.Component<
  {
    state: AppState;
  },
  {
    open: boolean;
    password: string;
    newPassword: string;
    newPassword2: string;
    loading: boolean;
  }
> {
  public state = {
    open: false,
    password: "",
    newPassword: "",
    newPassword2: "",
    loading: false,
  };

  public handleClickOpen = () => {
    this.setState({ open: true });
  };
  public handleClose = () => {
    if (this.state.newPassword !== this.state.newPassword2) {
      return this.props.state.emitError(new Error("两次输入的密码不匹配"));
    }
    this.setState({ loading: true });
    this.props.state
      .resetPassword(this.state.password, this.state.newPassword)
      .then(() =>
        this.setState({
          open: false,
          password: "",
          newPassword: "",
          newPassword2: "",
          loading: false,
        })
      )
      .catch(err => {
        this.setState({ loading: false });
        this.props.state.emitError(err);
      });
  };
  public simpleClose = () => {
    this.setState({ open: false });
  };
  public handleChange = (name: string) => (
    event: ChangeEvent<{ value: string }>
  ) => {
    this.setState({
      ...this.state,
      [name]: event.target.value,
    });
  };

  public render() {
    const { loading } = this.state;
    return (
      <span>
        <Button onClick={this.handleClickOpen}>修改密码</Button>
        <Modal
          visible={this.state.open}
          onOk={this.handleClose}
          onCancel={this.simpleClose}
          confirmLoading={loading}
        >
          修改密码后，您需要重新登入网站。
          <Form.Item label="当前密码">
            <Input
              autoFocus
              id="password"
              type="password"
              onChange={this.handleChange("password")}
            />
          </Form.Item>
          <Form.Item label="新密码">
            <Input
              id="newPassword"
              type="password"
              onChange={this.handleChange("newPassword")}
            />
          </Form.Item>
          <Form.Item label="确认密码">
            <Input
              id="newPassword2"
              type="password"
              onChange={this.handleChange("newPassword2")}
            />
          </Form.Item>
        </Modal>
      </span>
    );
  }
}

export default FormDialog;
