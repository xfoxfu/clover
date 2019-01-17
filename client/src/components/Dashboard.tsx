import * as React from "react";
import { inject, observer } from "mobx-react";
import AppState from "../lib/state";
import { RouteComponentProps } from "react-router-dom";

import Announces from "./Announces";
import { Button, Card, Form, Input, Steps, Tabs } from "antd";
import { IGuideItem } from "../lib/guide";
import { resendValidateEmail } from "../api/index";

const Step = Steps.Step;
const TabPane = Tabs.TabPane;

@inject("state")
@observer
class Dashboard extends React.Component<
  RouteComponentProps<{}> & { state: AppState },
  {
    currentStep: number[];
    currentOs: number[];
    resendEmailLoading: boolean;
  }
> {
  public state = {
    currentStep: [0, 0],
    currentOs: [0, 0],
    resendEmailLoading: false,
  };

  public handleChangeTab = (index: number) => (value: string) => {
    this.setState(state => ({
      currentStep: state.currentStep.map((v, i) => (i === index ? 0 : v)),
      currentOs: state.currentOs.map((v, i) => (i === index ? +value : v)),
    }));
  };
  public handleNext = (index: number) => () => {
    this.setState(state => ({
      currentStep: state.currentStep.map((v, i) => (i === index ? v + 1 : v)),
    }));
  };
  public handleBack = (index: number) => () => {
    this.setState(state => ({
      currentStep: state.currentStep.map((v, i) => (i === index ? v - 1 : v)),
    }));
  };
  public handleReset = (index: number) => () => {
    this.setState(state => ({
      currentStep: state.currentStep.map((v, i) => (i === index ? 0 : v)),
    }));
  };

  public handleResendEmail = () => {
    this.setState({ resendEmailLoading: true });
    if (!this.props.state.user) {
      return;
    }
    resendValidateEmail(this.props.state.user.token)
      .then(msg => this.props.state.emitMessage(msg.message))
      .catch(this.props.state.emitError)
      .then(() => this.setState({ resendEmailLoading: false }));
  };

  public render() {
    const guide = this.props.state.guide;
    const { enabled, isEmailVerified } = this.props.state.user || {
      enabled: false,
      isEmailVerified: false,
    };
    const makeGuideUi = (
      title: string,
      guideItems: IGuideItem[],
      index: number
    ) => (
      <Card style={{ marginTop: "8px" }} title={title}>
        <p>
          <Tabs onChange={this.handleChangeTab(index)}>
            {guideItems.map((value, guideIndex) => (
              <TabPane tab={value.os} key={guideIndex} />
            ))}
          </Tabs>
        </p>
        <Steps current={this.state.currentStep[index]} direction="vertical">
          {guideItems[this.state.currentOs[index]].descriptions.map(
            (description, stepIndex) => (
              <Step
                title={description.title}
                key={stepIndex}
                description={
                  this.state.currentStep[index] === stepIndex && (
                    <div>
                      <p>{description.content}</p>
                      {description.links && (
                        <p>
                          {description.links.map(link => (
                            <span style={{ paddingRight: "4px" }}>
                              <Button
                                type="primary"
                                href={link.href}
                                target="_blank"
                              >
                                {link.name}
                              </Button>
                            </span>
                          ))}
                        </p>
                      )}
                      {description.fields && (
                        <p>
                          {description.fields.map(value => (
                            <Form.Item label={value.name}>
                              <Input.TextArea autosize value={value.data} />
                            </Form.Item>
                          ))}
                        </p>
                      )}
                      {description.qrcode && (
                        <p>
                          <img src={description.qrcode} />
                        </p>
                      )}
                      <Button
                        disabled={this.state.currentStep[index] === 0}
                        onClick={this.handleBack(index)}
                      >
                        后退
                      </Button>
                      <Button
                        disabled={
                          this.state.currentStep[index] ===
                          guideItems[this.state.currentOs[index]].descriptions
                            .length
                        }
                        onClick={this.handleNext(index)}
                      >
                        {this.state.currentStep[index] !==
                        guideItems[this.state.currentOs[index]].descriptions
                          .length -
                          1
                          ? "前进"
                          : "完成"}
                      </Button>
                    </div>
                  )
                }
              />
            )
          )}
        </Steps>
        {this.state.currentStep[index] ===
          guideItems[this.state.currentOs[index]].descriptions.length && (
          <Button type="primary" onClick={this.handleReset(index)}>
            重置
          </Button>
        )}
      </Card>
    );
    return (
      <span>
        {!enabled && (
          <Card style={{ marginTop: "8px" }} title="用户账户已停用">
            <p>
              您的账号已被停用。请联系
              <a
                href={`mailto:${this.props.state.site &&
                  this.props.state.site.adminEmail}`}
              >
                {this.props.state.site && this.props.state.site.adminEmail}
              </a>
              重新启用您的账号。
            </p>
            <p>可能的原因：您主动要求停用、您的账户发生欠费。</p>
            <p>请您阅读下方描述信息确认您的缴费情况。</p>
            <pre>
              <code>{this.props.state.user && this.props.state.user.note}</code>
            </pre>
          </Card>
        )}
        {!isEmailVerified && (
          <Card style={{ marginTop: "8px" }} title="邮件地址未激活">
            <p>您的邮件地址没有激活。</p>
            <p>这将导致您无法收到本站的通知邮件。</p>
            <p>请您检查您的收件箱，或点击下方链接重发邮件。</p>
            <Button
              type="primary"
              onClick={this.handleResendEmail}
              loading={this.state.resendEmailLoading}
            >
              重发验证邮件
            </Button>
          </Card>
        )}
        {guide && (
          <div>
            {[
              makeGuideUi("VMess 配置说明（推荐）", guide.vmess, 0),
              makeGuideUi("Shadowsocks 配置说明", guide.ss, 1),
            ]}
          </div>
        )}
        <Announces state={this.props.state} count={2} />
      </span>
    );
  }
}

export default Dashboard;
