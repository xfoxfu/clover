import * as React from 'react';
import { ChangeEvent } from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Form, Input, Tabs } from 'antd';

const { TabPane } = Tabs;
const FormItem = Form.Item;

enum TABS {
    LOGIN,
    REGISTER,
    PASS_REC,
}

@inject('state') @observer
class Dashboard extends React.Component<RouteComponentProps<{}> & { state: AppState }, {
    email: string;
    password: string;
    password2: string;
    ref: string;
    tab: number;
    err: string;
    loading: boolean;
}> {
    public state = {
        email: '',
        password: '',
        password2: '',
        ref: '',
        tab: 0,
        err: '',
        loading: false,
    };

    public handleChange = (name: string) => (event: ChangeEvent<{ value: string }>) => {
        this.setState({
            ...this.state,
            [name]: event.target.value,
        });
    }
    public handleChangeTab = (key: string) => {
        this.setState({
            ...this.state,
            tab: +key,
        });
    }

    public handleSubmit = async () => {
        try {
            this.setState({ loading: true });
            switch (this.state.tab) {
                case TABS.LOGIN: {
                    await this.props.state.login(this.state.email, this.state.password);
                    break;
                }
                case TABS.REGISTER: {
                    if (this.state.password !== this.state.password2) {
                        throw new Error('两次输入的密码不匹配');
                    }
                    await this.props.state.reg(this.state.email, this.state.password, this.state.ref);
                    break;
                }
                case TABS.PASS_REC: {
                    await this.props.state.resetPasswordEmail(this.state.email);
                    break;
                }
                default: {
                    throw new Error('此功能未实现');
                }
            }
        } catch (err) {
            this.props.state.emitError(err);
        } finally {
            this.setState({ loading: false });
        }
    }

    public render() {
        return (
            <div>
                <Tabs
                    defaultActiveKey="0"
                    onChange={this.handleChangeTab}
                >
                    <TabPane tab="登入" key="0" />
                    <TabPane tab="注册" key="1" />
                    <TabPane tab="找回密码" key="2" />
                </Tabs>
                <Form layout="horizontal" onSubmit={this.handleSubmit}>
                    <FormItem label="邮箱">
                        <Input type="email" onChange={this.handleChange('email')} />
                    </FormItem>
                    {
                        this.state.tab !== TABS.PASS_REC &&
                        <FormItem label="密码">
                            <Input type="password" onChange={this.handleChange('password')} />
                        </FormItem>
                    } {
                        this.state.tab === TABS.REGISTER &&
                        <FormItem label="确认密码">
                            <Input type="password" onChange={this.handleChange('password2')} />
                        </FormItem>
                    } {
                        (this.state.tab === TABS.REGISTER &&
                            (this.props.state.site && !this.props.state.site.openRegister)) &&
                        <FormItem label="邀请码">
                            <Input.TextArea autosize onChange={this.handleChange('ref')} />
                        </FormItem>
                    }
                    <Button
                        onClick={this.handleSubmit}
                        type="primary"
                        loading={this.state.loading}
                    >
                        {this.state.tab === TABS.LOGIN ? '登入' :
                            (this.state.tab === TABS.REGISTER ? '注册' :
                                (this.state.tab === TABS.PASS_REC ? '提交' : '')
                            )}
                    </Button>
                </Form>
            </div>
        );
    }
}

export default Dashboard;
