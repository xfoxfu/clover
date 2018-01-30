import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import { RouteComponentProps } from 'react-router-dom';
import { ChangeEvent } from 'react';

import Announces from './Announces';
import Card, { CardContent } from 'material-ui/Card';
import Stepper, { Step, StepLabel, StepContent } from 'material-ui/Stepper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Tabs, { Tab } from 'material-ui/Tabs';
import TextField from 'material-ui/TextField/TextField';

import theme from '../lib/theme';
import { GuideItem } from '../lib/guide';
import { resendValidateEmail } from '../api/index';

@inject('state') @observer
class Dashboard extends React.Component<RouteComponentProps<{}> & { state: AppState }, {
  currentStep: number[];
  currentOs: number[];
}> {
  state = {
    currentStep: [0, 0],
    currentOs: [0, 0],
  };

  handleChangeTab = (index: number) => (event: ChangeEvent<{}>, value: number) => {
    this.setState((state) => ({
      currentStep: state.currentStep.map((v, i) => i === index ? 0 : v),
      currentOs: state.currentOs.map((v, i) => i === index ? value : v)
    }));
  }
  handleNext = (index: number) => () => {
    this.setState((state) => ({
      currentStep: state.currentStep.map((v, i) => i === index ? (v + 1) : v)
    }));
  }
  handleBack = (index: number) => () => {
    this.setState((state) => ({
      currentStep: state.currentStep.map((v, i) => i === index ? (v - 1) : v)
    }));
  }
  handleReset = (index: number) => () => {
    this.setState((state) => ({
      currentStep: state.currentStep.map((v, i) => i === index ? 0 : v),
    }));
  }

  handleResendEmail = () => {
    if (!this.props.state.user) { return; }
    resendValidateEmail(this.props.state.user.token)
      .then((msg) => this.props.state.emitMessage(msg.message))
      .catch(this.props.state.emitError);
  }

  render() {
    const guide = this.props.state.guide;
    const { enabled, isEmailVerified } = this.props.state.user || {
      enabled: false,
      isEmailVerified: false
    };
    const makeGuideUi = (title: string, guide: GuideItem[], index: number) => (
      <Card style={{ marginTop: '10px' }}>
        <CardContent>
          <Typography type="headline" component="h2">
            {title}
          </Typography>
          <Typography>
            <Tabs
              value={this.state.currentOs[index]}
              onChange={this.handleChangeTab(index)}
              indicatorColor="secondary"
              textColor="secondary"
              fullWidth
              scrollable
              scrollButtons="auto"
            >
              {guide.map((value) =>
                <Tab label={value.os} />
              )}
            </Tabs>
          </Typography>
          <Stepper activeStep={this.state.currentStep[index]} orientation="vertical">
            {guide[this.state.currentOs[index]].descriptions.map((description) =>
              <Step key={description.title}>
                <StepLabel>{description.title}</StepLabel>
                <StepContent>
                  <Typography>
                    <p>{description.content}</p>
                    {
                      description.links &&
                      <p>
                        {description.links.map((link) => (
                          <span style={{ paddingRight: '4px' }}>
                            <Button raised color="secondary" href={link.href} target="_blank">
                              {link.name}
                            </Button>
                          </span>
                        ))}
                      </p>
                    }
                    {
                      description.fields &&
                      <p>
                        {description.fields.map((value) =>
                          <TextField
                            multiline
                            label={value.name}
                            value={value.data}
                            margin="normal"
                            fullWidth
                            disabled
                          />
                        )}
                      </p>
                    }
                    {
                      description.qrcode &&
                      <p>
                        <img src={description.qrcode} />
                      </p>
                    }
                  </Typography>
                  <Button
                    disabled={this.state.currentStep[index] === 0}
                    onClick={this.handleBack(index)}
                    style={{ margin: theme.spacing.unit }}
                  >
                    后退
                      </Button>
                  <Button
                    {...console.log(this.state, index, guide) }
                    disabled={this.state.currentStep[index] ===
                      guide[this.state.currentOs[index]].descriptions.length}
                    raised
                    color="primary"
                    onClick={this.handleNext(index)}
                    style={{ margin: theme.spacing.unit }}
                  >
                    {this.state.currentStep[index] !==
                      guide[this.state.currentOs[index]].descriptions.length - 1 ?
                      '前进' : '完成'}
                  </Button>
                </StepContent>
              </Step>
            )}
          </Stepper>
          {
            this.state.currentStep[index] ===
            guide[this.state.currentOs[index]].descriptions.length &&
            <Button
              raised
              color="primary"
              onClick={this.handleReset(index)}
            >
              重置
                </Button>
          }
        </CardContent>
      </Card>
    );
    return (
      <span>
        {(!enabled) &&
          <Card style={{ marginTop: '10px' }}>
            <CardContent>
              <Typography type="headline" component="h2">
                用户账户已停用
              </Typography>
              <Typography>
                <p>
                  您的账号已被停用。请联系
                  <a href={`mailto:${this.props.state.site && this.props.state.site.adminEmail}`}>
                    {this.props.state.site && this.props.state.site.adminEmail}
                  </a>
                  重新启用您的账号。
                </p>
                <p>可能的原因：您主动要求停用、您的账户发生欠费。</p>
                <p>请您阅读下方描述信息确认您的缴费情况。</p>
                <pre><code>{this.props.state.user && this.props.state.user.note}</code></pre>
              </Typography>
            </CardContent>
          </Card>
        }
        {(!isEmailVerified) &&
          <Card style={{ marginTop: '10px' }}>
            <CardContent>
              <Typography type="headline" component="h2">
                邮件地址未激活
              </Typography>
              <Typography>
                <p>您的邮件地址没有激活。</p>
                <p>这将导致您无法收到本站的通知邮件。</p>
                <p>请您检查您的收件箱，或点击下方链接重发邮件。</p>
                <Button
                  raised
                  color="primary"
                  onClick={this.handleResendEmail}
                >
                  重发验证邮件
                </Button>
              </Typography>
            </CardContent>
          </Card>
        }
        {guide &&
          <div>
            {[
              makeGuideUi("VMess 配置说明（推荐）", guide.vmess, 0),
              makeGuideUi("Shadowsocks 配置说明", guide.ss, 1),
            ]}
          </div>}
        <Announces state={this.props.state} count={2} />
      </span>
    );
  }
}
export default Dashboard;