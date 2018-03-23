import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import { Button, Modal, Form, Input } from 'antd';
import { ChangeEvent } from 'react';
import { getRefCode } from '../api/index';
import { Link } from 'react-router-dom';

@inject('state') @observer
class FormDialog extends React.Component<{
  state: AppState
}, {
  open: boolean,
  email: string,
  note: string,
  code: string,
  loading: boolean;
}> {
  state = {
    open: false,
    email: '',
    note: '',
    code: '',
    loading: false,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  }
  handleClose = () => {
    const { email, note } = this.state;
    const token = this.props.state.user && this.props.state.user.token;
    if (!token) {
      return this.props.state.emitError(new Error('未登入'));
    }
    this.setState({ loading: true });
    getRefCode(token, email, note)
      .then((result) => this.setState({
        note: '',
        email: '',
        code: result.refcode,
        loading: false,
      }))
      .catch((err) => {
        this.setState({ loading: false });
        this.props.state.emitError(err);
      });
  }
  simpleClose = () => {
    this.setState({ open: false });
  }
  handleChange = (name: string) => (event: ChangeEvent<{ value: string }>) => {
    this.setState({
      ...this.state,
      [name]: event.target.value,
    });
  }

  render() {
    const { loading } = this.state;
    return (
      <span>
        <Button
          onClick={this.handleClickOpen}
        >
          生成邀请码
        </Button>
        <Modal
          visible={this.state.open}
          onCancel={this.simpleClose}
          title="生成邀请码"
          footer={<Button key="back" onClick={this.simpleClose}>关闭</Button>}
        >
          邀请码有效期 6 小时。
          <Form.Item label="邮箱">
            <Input
              autoFocus
              id="email"
              type="email"
              onChange={this.handleChange('email')}
            />
          </Form.Item>
          <Form.Item label="用户备注">
            <Input.TextArea
              autosize
              id="note"
              onChange={this.handleChange('note')}
            />
          </Form.Item>
          <div style={{ position: 'relative', }}>
            <Button
              type="primary"
              onClick={this.handleClose}
              loading={loading}
            >
              提交
            </Button>
            <Form.Item label="邀请码">
              <Input.TextArea
                id="code"
                autosize
                value={this.state.code}
              />
            </Form.Item>
            <Link to={'/?ref=' + encodeURI(this.state.code)}>
              <Button>链接</Button>
            </Link>
          </div>
        </Modal>
      </span >
    );
  }
}
export default FormDialog;
