import * as React from "react";
import { inject, observer } from "mobx-react";
import AppState from "../lib/state";
import { RouteComponentProps } from "react-router-dom";
import { ChangeEvent } from "react";

import AddAnnounceDialog from "./AddAnnounceDialog";
import GetRefCodeDialog from "./GetRefCodeDialog";

import {
  Row,
  Col,
  Card,
  Switch,
  Input,
  Form,
  Button,
  Modal,
  Checkbox,
} from "antd";

import IUser from "../models/user";
import { getAllUsers, editUser } from "../api/index";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

interface IState {
  users: IUser[];
  editorUser?: IUser & {
    id: number;
    email: string;
    enabled: boolean;
    isAdmin: boolean;
    isEmailVerified: boolean;
    note: string;
    regenerate: boolean;
  };
  open: boolean;
  loading: boolean;
}
@inject("state")
@observer
class Admin extends React.Component<
  RouteComponentProps<{}> & { state: AppState },
  IState
> {
  public state: IState = {
    users: [],
    open: false,
    loading: false,
  };

  public componentDidMount() {
    const token = this.props.state.user && this.props.state.user.token;
    if (!token) {
      return this.props.state.emitError(new Error("未登入"));
    }
    getAllUsers(token)
      .then(users => this.setState({ users }))
      .catch(this.props.state.emitError);
  }

  public handleClickOpen = (user: IUser) => () => {
    this.setState({
      open: true,
      editorUser: { ...user, regenerate: false },
    });
  };
  public handleClose = () => {
    if (!this.state.editorUser) {
      return;
    }
    const token = this.props.state.user && this.props.state.user.token;
    if (!token) {
      return;
    }
    const {
      id,
      email,
      enabled,
      isAdmin,
      isEmailVerified,
      note,
      regenerate,
    } = this.state.editorUser;
    editUser(token, {
      id,
      email,
      enabled,
      isAdmin,
      isEmailVerified,
      note,
      regenerate,
    })
      .then(message => {
        this.props.state.emitMessage(message.message);
        this.setState({ open: false });
      })
      .then(() => getAllUsers(token))
      .then(users => this.setState({ users }))
      .catch(this.props.state.emitError);
  };
  public handleSimpleClose = () => {
    this.setState({ open: false });
  };

  public handleInputChange = (name: string) => (
    event: ChangeEvent<{ value: string }>
  ) => {
    const value = event.target.value;
    this.setState(
      state =>
        ({
          editorUser: {
            ...this.state.editorUser,
            [name]: value,
          },
        } as any)
    );
  };
  public handleCheckboxChange = (name: string) => (
    event: CheckboxChangeEvent
  ) => {
    this.setState(
      state =>
        ({
          editorUser: {
            ...state.editorUser,
            [name]: event.target.checked,
          },
        } as any)
    );
  };

  public render() {
    const { users, editorUser } = this.state;
    const admin = this.props.state.user;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <div>
        <p>
          <Row>
            <AddAnnounceDialog state={this.props.state} />
            <GetRefCodeDialog state={this.props.state} />
          </Row>
          <Row gutter={8}>
            <Col>
              <Card title="服务器状态">
                <p>
                  <b>VMess</b>
                  <Switch checked={admin && admin.vmess.enabled} />
                  <b>Shadowsocks</b>
                  <Switch checked={admin && admin.ss.enabled} />
                </p>
              </Card>
            </Col>
            {users.length &&
              users.map(user => (
                <Col xs={24} lg={12}>
                  <Card title={user.email}>
                    <p>
                      {user.isAdmin ? <b>管理员</b> : "用户"}&nbsp;
                      <b>{user.isEmailVerified ? "" : "邮箱未激活"}</b>&nbsp;
                      <b>{user.enabled ? "" : "账户已停用"}</b>
                    </p>
                    <p>{user.note}</p>
                    <Button onClick={this.handleClickOpen(user)}>
                      编辑用户
                    </Button>
                  </Card>
                </Col>
              ))}
          </Row>
          <Modal
            visible={this.state.open}
            onOk={this.handleClose}
            onCancel={this.handleSimpleClose}
            title="修改用户"
            confirmLoading={this.state.loading}
          >
            <Form>
              <Form.Item label="邮箱" {...formItemLayout}>
                <Input
                  id="name"
                  type="email"
                  value={editorUser && editorUser.email}
                  onChange={this.handleInputChange("email")}
                />
              </Form.Item>
              <Form.Item label="启用" {...formItemLayout}>
                <Checkbox
                  checked={editorUser && editorUser.enabled}
                  onChange={this.handleCheckboxChange("enabled")}
                />
              </Form.Item>
              <Form.Item label="管理员" {...formItemLayout}>
                <Checkbox
                  checked={editorUser && editorUser.isAdmin}
                  onChange={this.handleCheckboxChange("isAdmin")}
                />
              </Form.Item>
              <Form.Item label="邮箱验证" {...formItemLayout}>
                <Checkbox
                  checked={editorUser && editorUser.isEmailVerified}
                  onChange={this.handleCheckboxChange("isEmailVerified")}
                />
              </Form.Item>
              <Form.Item label="备注" {...formItemLayout}>
                <Input.TextArea
                  id="note"
                  value={editorUser && editorUser.note}
                  onChange={this.handleInputChange("note")}
                  autosize
                />
              </Form.Item>
              <Form.Item label="重新生成配置" {...formItemLayout}>
                <Checkbox
                  checked={
                    this.state.editorUser && this.state.editorUser.regenerate
                  }
                  onChange={this.handleCheckboxChange("regenerate")}
                />
              </Form.Item>
              <Form.Item label="VMess UID" {...formItemLayout}>
                <Input value={editorUser && editorUser.vmess.id} />
              </Form.Item>
              <Form.Item label="VMess Alter ID" {...formItemLayout}>
                <Input value={editorUser && editorUser.vmess.aid} />
              </Form.Item>
              <Form.Item label="Shadowsocks Port" {...formItemLayout}>
                <Input value={editorUser && editorUser.ss.port} />
              </Form.Item>
              <Form.Item label="Shadowsocks Password" {...formItemLayout}>
                <Input value={editorUser && editorUser.ss.password} />
              </Form.Item>
              <Form.Item label="Shadowsocks Encryption" {...formItemLayout}>
                <Input value={editorUser && editorUser.ss.encryption} />
              </Form.Item>
            </Form>
          </Modal>
        </p>
      </div>
    );
  }
}
export default Admin;
