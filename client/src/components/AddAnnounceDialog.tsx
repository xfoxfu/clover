import * as React from "react";
import { inject, observer } from "mobx-react";
import AppState from "../lib/state";
import { ChangeEvent } from "react";
import { Button, Modal, Form, Input } from "antd";

@inject("state")
@observer
class FormDialog extends React.Component<
  {
    state: AppState;
  },
  {
    open: boolean;
    title: string;
    content: string;
    loading: boolean;
  }
> {
  public state = {
    open: false,
    title: "",
    content: "",
    loading: false
  };

  public handleClickOpen = () => {
    this.setState({ open: true });
  };
  public handleClose = () => {
    const { title, content } = this.state;
    this.setState({ loading: true });
    this.props.state
      .addAnnounce(title, content)
      .then(() =>
        this.setState({
          open: false,
          title: "",
          content: "",
          loading: false
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
      [name]: event.target.value
    });
  };

  public render() {
    const { loading } = this.state;
    return (
      <span>
        <Button onClick={this.handleClickOpen}>创建公告</Button>
        <Modal
          visible={this.state.open}
          onOk={this.handleClose}
          onCancel={this.simpleClose}
          title="创建公告"
          confirmLoading={this.state.loading}
        >
          将会自动发送邮件给已激活邮箱的用户。
          <Form.Item label="标题">
            <Input autoFocus id="title" onChange={this.handleChange("title")} />
          </Form.Item>
          <Form.Item label="正文">
            <Input.TextArea
              id="content"
              onChange={this.handleChange("content")}
            />
          </Form.Item>
        </Modal>
      </span>
    );
  }
}
export default FormDialog;
